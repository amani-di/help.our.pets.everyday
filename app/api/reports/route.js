// api/reports/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectDB } from '../../config/mongodb';
import cloudinary from '../../config/cloudinary';
import { ObjectId } from 'mongodb';

// Fonction utilitaire pour uploader un fichier vers Cloudinary
async function uploadToCloudinary(file, folder, resourceType = 'image') {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: folder,
        quality: 'auto',
        fetch_format: 'auto'
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
}

// API POST pour créer un nouveau signalement
export async function POST(request) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    // Récupération des données du formulaire
    const formData = await request.formData();
    
    // Extraction des champs du formulaire
    const reportType = formData.get('reportType');
    const wilaya = formData.get('wilaya');
    const commune = formData.get('commune');
    const neighborhood = formData.get('neighborhood');
    const dateIncident = formData.get('dateIncident');
    const contact = formData.get('contact');
    const description = formData.get('description');
    
    // Validation des champs obligatoires
    if (!reportType || !wilaya || !commune || !neighborhood || !dateIncident) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validation du type de signalement
    if (!['disparition', 'maltraitance'].includes(reportType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid report type' },
        { status: 400 }
      );
    }

    // Validation spécifique selon le type de signalement
    if (reportType === 'disparition' && (!description || !contact)) {
      return NextResponse.json(
        { success: false, message: 'Description and contact information are required for missing animal reports' },
        { status: 400 }
      );
    }

    // Récupération des fichiers photos
    const photos = formData.getAll('photos');
    if (photos.length < 2 || photos.length > 3) {
      return NextResponse.json(
        { success: false, message: 'Between 2 and 3 photos are required' },
        { status: 400 }
      );
    }

    // Récupération du fichier vidéo (optionnel pour maltraitance)
    const video = formData.get('video');

    // Connexion à la base de données
    const db = await connectDB();

    // Upload des photos vers Cloudinary
    const uploadedPhotos = [];
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      if (photo && photo.size > 0) {
        try {
          const uploadResult = await uploadToCloudinary(
            photo, 
            `reports/${reportType}`, 
            'image'
          );
          uploadedPhotos.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id
          });
        } catch (uploadError) {
          console.error('Error uploading photo:', uploadError);
          return NextResponse.json(
            { success: false, message: 'Error uploading photos' },
            { status: 500 }
          );
        }
      }
    }

    // Upload de la vidéo vers Cloudinary (si présente)
    let uploadedVideo = null;
    if (video && video.size > 0) {
      try {
        const uploadResult = await uploadToCloudinary(
          video, 
          `reports/${reportType}`, 
          'video'
        );
        uploadedVideo = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id
        };
      } catch (uploadError) {
        console.error('Error uploading video:', uploadError);
        return NextResponse.json(
          { success: false, message: 'Error uploading video' },
          { status: 500 }
        );
      }
    }

    // Création de l'objet signalement
    const reportData = {
      reportType: reportType,
      location: {
        wilaya: wilaya,
        commune: commune,
        neighborhood: neighborhood
      },
      dateIncident: new Date(dateIncident),
      photos: uploadedPhotos,
      userId: new ObjectId(session.user.id),
      userType: session.user.userType,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Ajout des champs spécifiques selon le type de signalement
    if (reportType === 'disparition') {
      reportData.description = description;
      reportData.contact = contact;
    } else if (reportType === 'maltraitance') {
      if (description) {
        reportData.description = description;
      }
      if (uploadedVideo) {
        reportData.video = uploadedVideo;
      }
    }

    // Insertion dans la base de données
    const result = await db.collection('reports').insertOne(reportData);

    if (!result.insertedId) {
      return NextResponse.json(
        { success: false, message: 'Failed to create report' },
        { status: 500 }
      );
    }

    // Réponse de succès
    return NextResponse.json(
      {
        success: true,
        message: 'Report created successfully',
        reportId: result.insertedId.toString(),
        data: {
          reportType: reportData.reportType,
          location: reportData.location,
          dateIncident: reportData.dateIncident,
          photosCount: uploadedPhotos.length,
          hasVideo: !!uploadedVideo
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating report:', error);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// API GET pour récupérer les signalements (optionnel)
export async function GET(request) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Récupération des paramètres de requête
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type');
    const wilaya = searchParams.get('wilaya');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Connexion à la base de données
    const db = await connectDB();

    // Construction du filtre de recherche
    const filter = {};
    if (reportType && ['disparition', 'maltraitance'].includes(reportType)) {
      filter.reportType = reportType;
    }
    if (wilaya) {
      filter['location.wilaya'] = wilaya;
    }

    // Récupération des signalements avec pagination
    const reports = await db.collection('reports')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Comptage total pour la pagination
    const totalReports = await db.collection('reports').countDocuments(filter);

    // Conversion des ObjectId en chaînes
    const formattedReports = reports.map(report => ({
      ...report,
      _id: report._id.toString(),
      userId: report.userId.toString()
    }));

    return NextResponse.json(
      {
        success: true,
        data: formattedReports,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalReports / limit),
          totalReports: totalReports,
          hasNextPage: page < Math.ceil(totalReports / limit),
          hasPrevPage: page > 1
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching reports:', error);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}