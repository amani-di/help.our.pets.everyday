'use client'
import React, { useState, useEffect } from 'react';
import styles from '../styles/animalcatalog.module.css'; 
import animal from './animal.json';

const AnimalCatalog = () => {
  // État pour stocker les données des animaux
  const [animals, setAnimals] = useState([]);
  // État pour stocker les filtres
  const [filters, setFilters] = useState({
    species: 'all',
    age: 'all',
    size: 'all',
    searchTerm: ''
  });
  // État pour indiquer le chargement
  const [loading, setLoading] = useState(true);
  // État pour gérer les animaux favoris
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setAnimals(animal);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setLoading(false);
      }
    };

    fetchData();
    
    // Load favorites from localStorage
    try {
      const storedFavorites = localStorage.getItem('animalFavorites');
      if (storedFavorites) {
        const favoritesArray = JSON.parse(storedFavorites);
        // Convert array to object for easier lookup
        const favoritesObj = {};
        favoritesArray.forEach(animal => {
          favoritesObj[animal.id] = true;
        });
        setFavorites(favoritesObj);
      }
    } catch (error) {
      console.error("Error loading favorites from localStorage:", error);
    }
  }, []);

  // Handler pour les changements de filtres
  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value
    }));
  };

  // Handler pour la recherche
  const handleSearch = (e) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      searchTerm: e.target.value
    }));
  };

  // Gérer les favoris
  const toggleFavorite = (id) => {
    // Update state
    setFavorites(prev => {
      const newFavorites = {
        ...prev,
        [id]: !prev[id]
      };
      
      // Update localStorage
      try {
        // Get the current animal data
        const animal = animals.find(a => a.id === id);
        
        // Get current favorites from localStorage
        const storedFavorites = localStorage.getItem('animalFavorites');
        let favoritesArray = storedFavorites ? JSON.parse(storedFavorites) : [];
        
        if (newFavorites[id]) {
          // Add to favorites if not already there
          if (!favoritesArray.some(a => a.id === id)) {
            favoritesArray.push(animal);
          }
        } else {
          // Remove from favorites
          favoritesArray = favoritesArray.filter(a => a.id !== id);
        }
        
        // Save back to localStorage
        localStorage.setItem('animalFavorites', JSON.stringify(favoritesArray));
        
        // Dispatch event for other components to listen for
        window.dispatchEvent(new Event('storage'));
      } catch (error) {
        console.error("Error updating favorites in localStorage:", error);
      }
      
      return newFavorites;
    });
  };

  const getAgeRanges = (species) => {
    switch (species.toLowerCase()) {
      case 'cat':
        return {
          young: { min: 0, max: 6 },
          adult: { min: 7, max: 10 },
          senior: { min: 11, max: Infinity }
        };
      case 'dog':
        return {
          young: { min: 0, max: 5 },
          adult: { min: 6, max: 8 },
          senior: { min: 9, max: Infinity }
        };
      default:
        return {
          young: { min: 0, max: 5 },
          adult: { min: 6, max: 10 },
          senior: { min: 11, max: Infinity }
        };
    }
  };

  // Déterminer la catégorie d'âge d'un animal
  const getAgeCategory = (animal) => {
    const ageNum = parseInt(animal.age);
    const ranges = getAgeRanges(animal.species);
    
    if (ageNum >= ranges.young.min && ageNum <= ranges.young.max) return 'young';
    if (ageNum >= ranges.adult.min && ageNum <= ranges.adult.max) return 'adult';
    if (ageNum >= ranges.senior.min) return 'senior';
    
    return 'unknown'; // Au cas où
  };

  // Filtrer les animaux selon les critères
  const filteredAnimals = animals.filter(animal => {
    // Filtre par espèce
    if (filters.species !== 'all' && animal.species !== filters.species) return false;
    
    // Filtre par âge en utilisant la fonction getAgeCategory
    if (filters.age !== 'all' && getAgeCategory(animal) !== filters.age) return false;
    
    // Filtre par taille
    if (filters.size !== 'all' && animal.size !== filters.size) return false;
    
    // Recherche par terme
    if (filters.searchTerm && !animal.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    
    return true;
  });

  // Extraire les options uniques pour les filtres
  const speciesOptions = ['all', ...new Set(animals.map(animal => animal.species))];
  const sizeOptions = [...new Set(animals.map(animal => animal.size))];

  return (
    <div className={styles.animalCatalog}>
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1>Animal Catalog</h1>
          <div className={styles.adoptionInfo}>
            <h2>Responsible Adoption</h2>
            <p>
              Adopting an animal is a long-term commitment that requires love, patience and responsibility. 
              Each animal deserves a loving home where it will be cared for and respected. Before adopting, 
              Make sure you are prepared to offer the necessary time, space and resources to ensure the well-being 
              of your new friend. Together, we can create Happy adoptions that last a lifetime.
            </p>
          </div>
        </div>
      </div>
      
      <div className={styles.mainContent}>
        <div className={styles.sidebar}>
          <h3>Filter by</h3>
          <div className={styles.filterGroup}>
            <label htmlFor="species-filter">Species:</label>
            <select 
              id="species-filter" 
              value={filters.species} 
              onChange={(e) => handleFilterChange('species', e.target.value)}
            >
              <option value="all">all species</option>
              {speciesOptions.filter(species => species !== 'all').map(species => (
                <option key={species} value={species}>{species}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label htmlFor="age-filter">Age:</label>
            <select id="age-filter" value={filters.age} onChange={(e) => handleFilterChange('age', e.target.value)}>
              <option value="all">All ages</option>
              <option value="young">Young</option>
              <option value="adult">Adult</option>
              <option value="senior">Senior</option>
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label htmlFor="size-filter">Size:</label>
            <select 
              id="size-filter" 
              value={filters.size} 
              onChange={(e) => handleFilterChange('size', e.target.value)}
            >
              <option value="all">All sizes</option>
              {sizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          
          <div className={`${styles.filterGroup} ${styles.search}`}>
            <label htmlFor="search-input">Search:</label>
            <input 
              id="search-input"
              type="text" 
              placeholder="Search by name..." 
              value={filters.searchTerm} 
              onChange={handleSearch}
            />
          </div>
        </div>
        
        <div className={styles.contentArea}>
          {loading ? (
            <div className={styles.loading}>Loading data...</div>
          ) : (
            <>
              {/* Species filter horizontal bar */}
              <div className={styles.speciesFilterBar}>
                {speciesOptions.map(species => (
                  <button
                    key={species}
                    className={`${styles.speciesFilterButton} ${filters.species === species ? styles.active : ''}`}
                    onClick={() => handleFilterChange('species', species)}
                  >
                    {species === 'all' ? 'All species' : species}
                  </button>
                ))}
              </div>
              
              <div className={styles.animalsGrid}>
                {filteredAnimals.length > 0 ? (
                  filteredAnimals.map(animal => (
                    <div key={animal.id} className={styles.animalCard}>
                      <div className={styles.animalImage}>
                        <img src={animal.image} alt={animal.name} />
                        <button 
                          className={`${styles.favoriteBtn} ${favorites[animal.id] ? styles.active : ''}`}
                          onClick={() => toggleFavorite(animal.id)}
                          aria-label={favorites[animal.id] ? "Remove from favorites" : "Add to favorites"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={favorites[animal.id] ? "red" : "none"} stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                      <div className={styles.animalInfo}>
                        <h3>{animal.name}</h3>
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
                        <p>{animal.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noResults}>No animals match your search criteria.</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimalCatalog;