 'use client';

import React, { useState } from 'react';
import styles from '../../styles/donformulaire.module.css';

function RefugeFormulaire() {
  const [refugeData, setRefugeData] = useState({
    nom: '',
    adresse: '',
    contact: '',
    telephone: '',
    email: '',
    capacite: '',
    typeAnimaux: [],
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRefugeData({
      ...refugeData,
      [name]: value
    });
  };
  
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    let newTypeAnimaux = [...refugeData.typeAnimaux];
    
    if (checked) {
      newTypeAnimaux.push(value);
    } else {
      newTypeAnimaux = newTypeAnimaux.filter(type => type !== value);
    }
    
    setRefugeData({
      ...refugeData,
      typeAnimaux: newTypeAnimaux
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Shelter data successfully submitted:', refugeData);
    // Ici, ajoutez le code pour envoyer les données à votre backend
    alert('Merci pour votre proposition de refuge ! ');
    
    // Réinitialiser le formulaire
    setRefugeData({
      nom: '',
      adresse: '',
      contact: '',
      telephone: '',
      email: '',
      capacite: '',
      typeAnimaux: [],
      description: ''
    });
  };

  return (
    <div className={styles.formulaire}>
      <h2>Provide a shelter</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label>Name of shelter:</label>
          <input
            type="text"
            name="nom"
            value={refugeData.nom}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label>Address:</label>
          <input
            type="text"
            name="adresse"
            value={refugeData.adresse}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label>Contact:</label>
          <input
            type="text"
            name="contact"
            value={refugeData.contact}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Phone:</label>
          <input
            type="tel"
            name="telephone"
            value={refugeData.telephone}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={refugeData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label>Shelter capacity (Animals number):</label>
          <input
            type="number"
            name="capacite"
            value={refugeData.capacite}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label>Types of animals accepted</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {['Cats', 'Dogs', 'Birds', 'Other'].map(type => (
              <label key={type} style={{ display: 'flex', alignItems: 'center', margin: '5px 15px 5px 0' }}>
                <input
                  type="checkbox"
                  value={type}
                  checked={refugeData.typeAnimaux.includes(type)}
                  onChange={handleCheckboxChange}
                  style={{ marginRight: '5px' }}
                />
                {type}
              </label>
            ))}
          </div>
        </div>
        
        <div className={styles.inputGroup}>
          <label>Shelter Description:</label>
          <textarea
            name="description"
            value={refugeData.description}
            onChange={handleChange}
            placeholder="Describe your shelter, its facilities, and any useful information."
            required
          />
        </div>
        
        <button type="submit" className={`${styles.btn} ${styles.btnSubmit}`}>Register the shelter</button>
      </form>
    </div>
  );
}

export default RefugeFormulaire;