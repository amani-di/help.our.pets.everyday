'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/favoritepets.module.css';

const FavoritePets = () => {
  // State for storing favorite animals
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load favorites from localStorage on component mount
    const loadFavorites = () => {
      try {
        const storedFavorites = localStorage.getItem('animalFavorites');
        if (storedFavorites) {
          const parsedFavorites = JSON.parse(storedFavorites);
          setFavorites(parsedFavorites);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error loading favorites:", error);
        setLoading(false);
      }
    };

    loadFavorites();

    // Set up event listener for favorites changes
    const handleStorageChange = (e) => {
      if (e.key === 'animalFavorites') {
        loadFavorites();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Function to remove animal from favorites
  const removeFromFavorites = (id) => {
    const updatedFavorites = favorites.filter(animal => animal.id !== id);
    setFavorites(updatedFavorites);
    localStorage.setItem('animalFavorites', JSON.stringify(updatedFavorites));
  };

  return (
    <div className={styles.favoritesContainer}>
      <h1 className={styles.favoritesTitle}>My Favorite Pets</h1>
      
      {loading ? (
        <div className={styles.loading}>Loading your favorites...</div>
      ) : favorites.length > 0 ? (
        <div className={styles.favoritesGrid}>
          {favorites.map(animal => (
            <div key={animal.id} className={styles.favoriteCard}>
              <div className={styles.cardImageContainer}>
                <img 
                  src={animal.image} 
                  alt={animal.name} 
                  className={styles.cardImage}
                />
                <button 
                  className={styles.favoriteBtn}
                  onClick={() => removeFromFavorites(animal.id)}
                  aria-label="Remove from favorites"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.animalName}>{animal.name}</h3>
                <div className={styles.infoRow}>
                  <p><strong>Species:</strong> {animal.species}</p>
                  <p className={styles.gender}>
                    <strong>Gender:</strong> 
                    <span className={styles.genderIcon}>
                      {animal.gender === 'Male' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="blue" strokeWidth="2">
                          <circle cx="10.5" cy="10.5" r="7.5" />
                          <line x1="18" y1="18" x2="22" y2="22" />
                          <line x1="22" y1="15" x2="22" y2="22" />
                          <line x1="15" y1="22" x2="22" y2="22" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="rgb(216, 15, 156)" strokeWidth="2">
                          <circle cx="12" cy="8" r="7" />
                          <line x1="12" y1="15" x2="12" y2="22" />
                          <line x1="9" y1="19" x2="15" y2="19" />
                        </svg>
                      )}
                      {animal.gender}
                    </span>
                  </p>
                </div>
                <p><strong>Age:</strong> {animal.age} years</p>
                <p><strong>Size:</strong> {animal.size}</p>
                <p className={styles.animalDescription}>{animal.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateContent}>
            <h2 className={styles.emptyStateTitle}>Your favorites list is empty.</h2>
            <p className={styles.emptyStateDescription}>Browse our catalog to find pets you love!</p>
            <Link href="/AnimalCatalog" className={styles.viewCatalogBtn}>
              View Catalog
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritePets;