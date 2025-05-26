'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from '../../styles/donformulaire.module.css';

// Modal d'authentification
function AuthModal({ isOpen, onClose, onSignup }) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3>Authentication Required</h3>
        <p>You need to be logged in to make a donation.</p>
        <div className={styles.modalButtons}>
          <button 
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={onSignup}
          >
            Sign Up / Login
          </button>
          <button 
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function DonFormulaire() {
  const [donData, setDonData] = useState({
    type: '',
    nom: '',
    message: '',
  });
  
  const [photos, setPhotos] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const fileInputRef = useRef(null);

  // Charger les types de don depuis l'API
  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      const response = await fetch('/api/type');
      const data = await response.json();
      
      if (data.success) {
        setTypes(data.data);
      } else {
        console.error('Erreur lors du chargement des types:', data.message);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des types:', error);
    }
  };

  // Vérifier si l'utilisateur est authentifié
  const checkAuthentication = () => {
    // Vérifier le token dans le localStorage ou sessionStorage
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    
    return { isAuthenticated: !!(token && userId), userId };
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier l'authentification
    const { isAuthenticated, userId } = checkAuthentication();
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    // Vérifier si au moins 1 photo est requise
    if (photos.length < 1) {
      alert('Veuillez ajouter au moins une photo pour votre don.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Préparer FormData pour l'envoi
      const formData = new FormData();
      formData.append('type', donData.type);
      formData.append('nom', donData.nom);
      formData.append('message', donData.message);
      formData.append('userId', userId);
      
      // Ajouter les photos
      photos.forEach(photo => {
        formData.append('photos', photo.file);
      });
      
      // Envoyer à l'API
      const response = await fetch('/api/don', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Thank you for your generosity! Your donation has been shared with the community and will help animals in need.');
        
        // Réinitialiser le formulaire
        setDonData({
          type: '',
          nom: '',
          message: ''
        });
        setPhotos([]);
        
        // Réinitialiser l'input file
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        if (result.requireAuth) {
          setShowAuthModal(true);
        } else {
          alert(`Erreur: ${result.message}`);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      alert('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
    }
    
    setLoading(false);
  };

  const handleSignupRedirect = () => {
    setShowAuthModal(false);
    // Rediriger vers la page de connexion/inscription
    window.location.href = '/signuplogin';
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  return (
    <>
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
              disabled={loading}
            >
              <option value="">Sélectionnez un type</option>
              {types.map((type) => (
                <option key={type._id} value={type.nomType}>
                  {type.nomType}
                </option>
              ))}
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
              disabled={loading}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Description:</label>
            <textarea
              name="message"
              value={donData.message}
              onChange={handleChange}
              placeholder="Let us know more about your donation or leave a kind word of support!"
              disabled={loading}
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
                      disabled={loading}
                    >
                      ×
                    </button>
                    <span className={styles.photoName}>{photo.name}</span>
                  </div>
                ))}
                
                {photos.length < 2 && (
                  <div 
                    className={`${styles.photoPlaceholder} ${loading ? styles.disabled : ''}`}
                    onClick={() => !loading && fileInputRef.current.click()}
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
                disabled={loading}
              />
              
              <div className={styles.photoUploadInfo}>
                <p>Required: 1 photo(s) minimum - Maximum: 2 photo(s)</p>
                <button 
                  type="button" 
                  className={styles.uploadBtn}
                  onClick={() => fileInputRef.current.click()}
                  disabled={loading}
                >
                  Browse...
                </button>
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            className={`${styles.btn} ${styles.btnSubmit}`}
            disabled={photos.length < 1 || loading}
          >
            {loading ? 'Sending...' : 'Send my donation'}
          </button>
        </form>
      </div>
      
      {/* Modal d'authentification */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        onSignup={handleSignupRedirect}
      />
    </>
  );
}

export default DonFormulaire;