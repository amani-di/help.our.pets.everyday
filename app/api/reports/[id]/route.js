import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AnimalReport from '@/models/AnimalReport';

// Récupérer un rapport spécifique
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const reportId = params.id;
    const report = await AnimalReport.findById(reportId);
    
    if (!report) {
      return NextResponse.json(
        { error: 'Rapport non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération du rapport' },
      { status: 500 }
    );
  }
}

// Mettre à jour un rapport
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    
    const reportId = params.id;
    const data = await request.json();
    
    // Vérifier si le rapport existe
    const report = await AnimalReport.findById(reportId);
    if (!report) {
      return NextResponse.json(
        { error: 'Rapport non trouvé' },
        { status: 404 }
      );
    }
    
    // Mettre à jour et renvoyer le rapport actualisé
    const updatedReport = await AnimalReport.findByIdAndUpdate(
      reportId,
      { ...data, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour du rapport' },
      { status: 500 }
    );
  }
}

// Supprimer un rapport
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    
    const reportId = params.id;
    const deletedReport = await AnimalReport.findByIdAndDelete(reportId);
    
    if (!deletedReport) {
      return NextResponse.json(
        { error: 'Rapport non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Rapport supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression du rapport' },
      { status: 500 }
    );
  }
}