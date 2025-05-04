import mongoose from 'mongoose';

const AnimalReportSchema = new mongoose.Schema({
  reportType: {
    type: String,
    enum: ['disappearance', 'abuse'],
    required: true
  },
  
  // Champs communs
  wilaya: { type: String, required: true },
  commune: { type: String, required: true },
  neighborhood: { type: String, required: true },
  description: { type: String },
  photos: [{ type: String, required: true }], // URLs des photos
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'pending', enum: ['pending', 'investigating', 'resolved'] },
  
  // Champs pour les disparitions
  species: { type: String },
  breed: { type: String },
  gender: { 
    type: String, 
    enum: ['male', 'female']
  },
  disappearanceDate: { type: Date },
  ownerContact: { type: String },
  
  // Champs pour les maltraitances
  abuseDate: { type: Date },
  video: { type: String } // URL de la vidéo
});

// Middleware de validation conditionnelle
AnimalReportSchema.pre('validate', function(next) {
  if (this.reportType === 'disappearance') {
    // Vérifier les champs requis pour les disparitions
    if (!this.species || !this.breed || !this.disappearanceDate || !this.ownerContact) {
      return next(new Error('Missing required fields for disappearance report'));
    }
  } else if (this.reportType === 'abuse') {
    // Vérifier les champs requis pour les maltraitances
    if (!this.abuseDate) {
      return next(new Error('Missing required fields for abuse report'));
    }
  }
  next();
});

export default mongoose.models.AnimalReport || mongoose.model('AnimalReport', AnimalReportSchema);