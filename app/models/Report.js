// models/Report.js
import { ObjectId } from 'mongodb';

/**
 * Schéma du modèle Report pour MongoDB
 * Collection: 'reports'
 */

// Structure du document Report
export const ReportSchema = {
  // Type de signalement
  reportType: {
    type: 'string',
    required: true,
    enum: ['disparition', 'maltraitance'],
    description: 'Type du signalement: disparition (animal perdu) ou maltraitance (abus d\'animal)'
  },

  // Informations de localisation
  location: {
    wilaya: {
      type: 'string',
      required: true,
      description: 'Province algérienne où s\'est produit l\'incident'
    },
    commune: {
      type: 'string',
      required: true,
      description: 'Commune où s\'est produit l\'incident'
    },
    neighborhood: {
      type: 'string',
      required: true,
      description: 'Quartier ou zone spécifique de l\'incident'
    }
  },

  // Date de l'incident
  dateIncident: {
    type: 'Date',
    required: true,
    description: 'Date à laquelle l\'incident s\'est produit'
  },

  // Photos (obligatoires - min 2, max 3)
  photos: [{
    url: {
      type: 'string',
      required: true,
      description: 'URL sécurisée de l\'image sur Cloudinary'
    },
    publicId: {
      type: 'string',
      required: true,
      description: 'ID public Cloudinary pour la gestion/suppression'
    }
  }],

  // Vidéo (optionnelle - uniquement pour maltraitance)
  video: {
    url: {
      type: 'string',
      description: 'URL sécurisée de la vidéo sur Cloudinary'
    },
    publicId: {
      type: 'string',
      description: 'ID public Cloudinary pour la gestion/suppression'
    }
  },

  // Description (obligatoire pour disparition, optionnelle pour maltraitance)
  description: {
    type: 'string',
    description: 'Description détaillée de l\'animal ou de la situation d\'abus'
  },

  // Contact du propriétaire (obligatoire uniquement pour disparition)
  contact: {
    type: 'string',
    description: 'Informations de contact du propriétaire de l\'animal perdu'
  },

  // Informations sur l'utilisateur qui a créé le signalement
  userId: {
    type: 'ObjectId',
    required: true,
    description: 'ID de l\'utilisateur qui a créé le signalement'
  },

  userType: {
    type: 'string',
    required: true,
    enum: ['owner', 'vet', 'association', 'store'],
    description: 'Type d\'utilisateur qui a créé le signalement'
  },

  // Timestamps
  createdAt: {
    type: 'Date',
    required: true,
    default: () => new Date(),
    description: 'Date de création du signalement'
  },

  updatedAt: {
    type: 'Date',
    required: true,
    default: () => new Date(),
    description: 'Date de dernière modification du signalement'
  }
};

// Fonction de validation pour un signalement de disparition
export function validateDisparitionReport(data) {
  const errors = [];

  if (!data.description || data.description.trim().length === 0) {
    errors.push('Description is required for missing animal reports');
  }

  if (!data.contact || data.contact.trim().length === 0) {
    errors.push('Contact information is required for missing animal reports');
  }

  return errors;
}

// Fonction de validation pour un signalement de maltraitance
export function validateMaltraitanceReport(data) {
  const errors = [];
  
  // Aucune validation spécifique supplémentaire pour maltraitance
  // La description est optionnelle
  // La vidéo est optionnelle
  
  return errors;
}

// Fonction de validation générale d'un signalement
export function validateReport(data) {
  const errors = [];

  // Validation du type de signalement
  if (!data.reportType || !['disparition', 'maltraitance'].includes(data.reportType)) {
    errors.push('Report type must be either "disparition" or "maltraitance"');
  }

  // Validation de la localisation
  if (!data.location) {
    errors.push('Location information is required');
  } else {
    if (!data.location.wilaya || data.location.wilaya.trim().length === 0) {
      errors.push('Wilaya is required');
    }
    if (!data.location.commune || data.location.commune.trim().length === 0) {
      errors.push('Commune is required');
    }
    if (!data.location.neighborhood || data.location.neighborhood.trim().length === 0) {
      errors.push('Neighborhood is required');
    }
  }

  // Validation de la date d'incident
  if (!data.dateIncident) {
    errors.push('Incident date is required');
  } else {
    const incidentDate = new Date(data.dateIncident);
    const now = new Date();
    if (incidentDate > now) {
      errors.push('Incident date cannot be in the future');
    }
  }

  // Validation des photos
  if (!data.photos || !Array.isArray(data.photos) || data.photos.length < 2 || data.photos.length > 3) {
    errors.push('Between 2 and 3 photos are required');
  }

  // Validation de l'utilisateur
  if (!data.userId) {
    errors.push('User ID is required');
  }

  if (!data.userType || !['owner', 'vet', 'association', 'store'].includes(data.userType)) {
    errors.push('Valid user type is required');
  }

  // Validation spécifique selon le type de signalement
  if (data.reportType === 'disparition') {
    errors.push(...validateDisparitionReport(data));
  } else if (data.reportType === 'maltraitance') {
    errors.push(...validateMaltraitanceReport(data));
  }

  return errors;
}

// Fonction pour créer un nouveau signalement
export function createReportDocument(data) {
  const now = new Date();
  
  const report = {
    reportType: data.reportType,
    location: {
      wilaya: data.location.wilaya,
      commune: data.location.commune,
      neighborhood: data.location.neighborhood
    },
    dateIncident: new Date(data.dateIncident),
    photos: data.photos,
    userId: new ObjectId(data.userId),
    userType: data.userType,
    createdAt: now,
    updatedAt: now
  };

  // Ajout conditionnel des champs selon le type de signalement
  if (data.reportType === 'disparition') {
    report.description = data.description;
    report.contact = data.contact;
  } else if (data.reportType === 'maltraitance') {
    if (data.description) {
      report.description = data.description;
    }
    if (data.video) {
      report.video = data.video;
    }
  }

  return report;
}

// Index recommandés pour MongoDB
export const RecommendedIndexes = [
  // Index composé pour les requêtes fréquentes
  { reportType: 1, 'location.wilaya': 1, createdAt: -1 },
  
  // Index pour recherche par utilisateur
  { userId: 1, createdAt: -1 },
  
  // Index pour recherche par type d'utilisateur
  { userType: 1, createdAt: -1 },
  
  // Index pour recherche par localisation
  { 'location.wilaya': 1, 'location.commune': 1 },
  
  // Index pour tri par date
  { createdAt: -1 },
  { dateIncident: -1 }
];

 