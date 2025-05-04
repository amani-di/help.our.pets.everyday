 'use client';

import React, { useState } from 'react';
import styles from '../../styles/donformulaire.module.css';

function DonFormulaire() {
  const [donData, setDonData] = useState({
    type: '',
    nom: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDonData({
      ...donData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Données du don soumises:', donData);
    // le code pour envoyer les données à votre backend
    alert('Thank you for your generosity! Your donation has been shared with the community and will help animals in need.');
    
    // Réinitialiser le formulaire
    setDonData({
      type: '',
      nom: '',
      message: ''
    });
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
          <label> Description:</label>
          <textarea
            name="message"
            value={donData.message}
            onChange={handleChange}
            placeholder="Let us know more about your donation or leave a kind word of support!"
          />
        </div>
        
        <button type="submit" className={`${styles.btn} ${styles.btnSubmit}`}>Send my donation</button>
      </form>
    </div>
  );
}

export default DonFormulaire;