// api/reports/get-disappearances/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '../../../config/mongodb';

// API GET spécialisée pour récupérer uniquement les signalements de disparition
export async function GET(request) {
  try {
    // Récupération des paramètres de requête
    const { searchParams } = new URL(request.url);
    const wilaya = searchParams.get('wilaya');
    const commune = searchParams.get('commune');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Connexion à la base de données
    const db = await connectDB();

    // Construction du filtre de recherche - uniquement les disparitions
    const filter = {
      reportType: 'disparition'
    };

    // Filtres optionnels
    if (wilaya) {
      filter['location.wilaya'] = wilaya;
    }
    if (commune) {
      filter['location.commune'] = commune;
    }

    // Récupération des signalements de disparition avec pagination
    const reports = await db.collection('reports')
      .find(filter)
      .sort({ createdAt: -1 }) // Les plus récents en premier
      .skip(skip)
      .limit(limit)
      .toArray();

    // Comptage total pour la pagination
    const totalReports = await db.collection('reports').countDocuments(filter);
    const totalPages = Math.ceil(totalReports / limit);

    // Formatage des données pour l'affichage
    const formattedReports = reports.map(report => ({
      id: report._id.toString(),
      reportType: report.reportType,
      location: report.location,
      dateIncident: report.dateIncident,
      description: report.description,
      contact: report.contact,
      photos: report.photos || [],
      userId: report.userId.toString(),
      userType: report.userType,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      // Champs calculés pour l'affichage
      disappearanceDate: report.dateIncident,
      publishDate: report.createdAt
    }));

    // Réponse avec données et pagination
    return NextResponse.json(
      {
        success: true,
        data: formattedReports,
        pagination: {
          page: page,
          limit: limit,
          totalPages: totalPages,
          totalReports: totalReports,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching disappearance reports:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur lors de la récupération des signalements de disparition',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}