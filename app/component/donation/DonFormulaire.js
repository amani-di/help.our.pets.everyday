'use client';

import React, { useState, useRef } from 'react';
import styles from '../../styles/donformulaire.module.css';

function DonFormulaire() {
  const [donData, setDonData] = useState({
    type: '',
    nom: '',
    message: '',
  });
  
  const [photos, setPhotos] = useState([]);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDonData({
      ...donData,
      [name]: value
    });
  };

  // Fonction pour gérer l'upload de photos
  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Limiter le nombre de photos à 2 maximum
    const newPhotos = [...photos];
    const remainingSlots = 2 - newPhotos.length;
    
    if (remainingSlots > 0) {
      const filesToAdd = files.slice(0, remainingSlots);
      
      filesToAdd.forEach(file => {
        // Ajouter uniquement les fichiers image
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            newPhotos.push({
              file: file,
              preview: e.target.result,
              name: file.name
            });
            setPhotos([...newPhotos]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };
  
  // Fonction pour supprimer une photo
  const removePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Vérifier si au moins 1 photo est requise
    if (photos.length < 1) {
      alert('Veuillez ajouter au moins une photo pour votre don.');
      return;
    }
    
    // Préparer les données avec les photos pour l'envoi
    const formDataToSubmit = {
      ...donData,
      photos: photos.map(p => p.file)
    };
    
    console.log('Données du don soumises:', formDataToSubmit);
    // le code pour envoyer les données à votre backend
    alert('Thank you for your generosity! Your donation has been shared with the community and will help animals in need.');
    
    // Réinitialiser le formulaire
    setDonData({
      type: '',
      nom: '',
      message: ''
    });
    setPhotos([]);
  };

  return (
    <div className={styles.formulaire}>
      <h2>Donate Now</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label>Type de don:</label>
          <select
            name="type"
            value={donData.type}
            onChange={handleChange}
            required
          >
            <option value="">Sélectionnez un type</option>
            <option value="nourriture">Food</option>
            <option value="medicament">Medications</option>
            <option value="materiel_de_soin">Care Supplies</option>
            <option value="materiel">Materiel</option>
            <option value="autre">Other</option>
          </select>
        </div>
        
        <div className={styles.inputGroup}>
          <label>Donation name:</label>
          <input
            type="text"
            name="nom"
            value={donData.nom}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label>Description:</label>
          <textarea
            name="message"
            value={donData.message}
            onChange={handleChange}
            placeholder="Let us know more about your donation or leave a kind word of support!"
          />
        </div>
        
        {/* Système d'upload de photos */}
        <div className={styles.inputGroup}>
          <label>Photos (Obligatoire):</label>
          <div className={styles.photoUploadContainer}>
            <div className={styles.photoPreviewArea}>
              {photos.map((photo, index) => (
                <div key={index} className={styles.photoPreview}>
                  <img src={photo.preview} alt={`Uploaded ${index + 1}`} />
                  <button 
                    type="button" 
                    className={styles.removePhotoBtn}
                    onClick={() => removePhoto(index)}
                  >
                    ×
                  </button>
                  <span className={styles.photoName}>{photo.name}</span>
                </div>
              ))}
              
              {photos.length < 2 && (
                <div 
                  className={styles.photoPlaceholder}
                  onClick={() => fileInputRef.current.click()}
                >
                  <span>+</span>
                  <p>Add Photo</p>
                </div>
              )}
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
              multiple={true}
            />
            
            <div className={styles.photoUploadInfo}>
              <p>Required: 1 photo(s) minimum - Maximum: 2 photo(s)</p>
              <button 
                type="button" 
                className={styles.uploadBtn}
                onClick={() => fileInputRef.current.click()}
              >
                Browse...
              </button>
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          className={`${styles.btn} ${styles.btnSubmit}`}
          disabled={photos.length < 1}
        >
          Send my donation
        </button>
      </form>
    </div>
  );
}

export default DonFormulaire;