import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AnimalReport from '@/models/AnimalReport';
import { saveFiles, saveFile } from '@/lib/uploadUtils';

export async function POST(request) {
  try {
    await connectToDatabase();
    
    // Traiter le formulaire multipart
    const formData = await request.formData();
    
    // Extraire les données du formulaire
    const reportType = formData.get('reportType');
    const species = formData.get('species');
    const breed = formData.get('breed');
    const gender = formData.get('gender');
    const disappearanceDate = formData.get('disappearanceDate');
    const abuseDate = formData.get('abuseDate');
    const wilaya = formData.get('wilaya');
    const commune = formData.get('commune');
    const neighborhood = formData.get('neighborhood');
    const ownerContact = formData.get('ownerContact');
    const description = formData.get('description');
    
    // Extraire les fichiers
    const photoFiles = formData.getAll('photos');
    const videoFile = formData.get('video');
    
    // Valider les données minimales requises
    if (!reportType || !wilaya || !commune || !neighborhood || photoFiles.length < 2) {
      return NextResponse.json(
        { error: 'Veuillez remplir tous les champs obligatoires' },
        { status: 400 }
      );
    }
    
    // Valider les données spécifiques au type de rapport
    if (reportType === 'disappearance') {
      if (!species || !breed || !disappearanceDate || !ownerContact) {
        return NextResponse.json(
          { error: 'Veuillez remplir tous les champs obligatoires pour un signalement de disparition' },
          { status: 400 }
        );
      }
    } else if (reportType === 'abuse') {
      if (!abuseDate) {
        return NextResponse.json(
          { error: 'Veuillez remplir tous les champs obligatoires pour un signalement de maltraitance' },
          { status: 400 }
        );
      }
    }
    
    // Enregistrer les photos
    const photoUrls = await saveFiles(photoFiles, 'animal-reports/photos');
    
    // Enregistrer la vidéo si elle existe
    let videoUrl = null;
    if (videoFile && videoFile.size > 0) {
      videoUrl = await saveFile(videoFile, 'animal-reports/videos');
    }
    
    // Créer le document de rapport
    const reportData = {
      reportType,
      wilaya,
      commune,
      neighborhood,
      description,
      photos: photoUrls,
      // Champs spécifiques aux disparitions
      ...(reportType === 'disappearance' && {
        species,
        breed,
        gender,
        disappearanceDate: new Date(disappearanceDate),
        ownerContact
      }),
      // Champs spécifiques aux maltraitances
      ...(reportType === 'abuse' && {
        abuseDate: new Date(abuseDate),
        video: videoUrl
      })
    };
    
    // Enregistrer dans la base de données
    const newReport = new AnimalReport(reportData);
    const savedReport = await newReport.save();
    
    return NextResponse.json(savedReport, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du rapport' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectToDatabase();
    
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type');
    const wilaya = searchParams.get('wilaya');
    
    // Construire la requête
    const query = {};
    if (reportType) query.reportType = reportType;
    if (wilaya) query.wilaya = wilaya;
    
    // Récupérer les rapports
    const reports = await AnimalReport.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des rapports' },
      { status: 500 }
    );
  }
}