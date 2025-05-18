'use client'
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../styles/animaldetail.module.css';

const AnimalDetail = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.animalid;
  
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    // Check if ID is available (important for SSR)
    if (!id) return;

    const fetchAnimalData = async () => {
      try {
        setLoading(true);
        
        // API call to get animal data by ID
        const response = await fetch(`/api/animals/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const { success, data } = await response.json();
        
        if (success && data) {
          // Prepare images for display in carousel
          const images = [];
          
          // Process photos based on their format (string or object with URL)
          if (data.photos && data.photos.length > 0) {
            data.photos.forEach(photo => {
              if (typeof photo === 'string') {
                images.push(photo);
              } else if (photo.url) {
                images.push(photo.url);
              }
            });
          } else if (data.image) {
            // Fallback to main image if that's all we have
            images.push(data.image);
          } 
          
          // Limit to 5 images max
          const limitedImages = images.slice(0, 5);
          
          // Create animal object with formatted data
          const formattedAnimal = {
            ...data,
            name: data.animalName || data.name,
            species: data.animalType || data.species,
            images: limitedImages
          };
          
          setAnimal(formattedAnimal);
          
          // Check if animal is in favorites (stored in localStorage)
          if (typeof window !== 'undefined') {
            const storedFavorites = localStorage.getItem('animalFavorites');
            if (storedFavorites) {
              const favoritesObj = JSON.parse(storedFavorites);
              setIsFavorite(!!favoritesObj[id]);
            }
          }
        } else {
          throw new Error('Animal not found');
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setError(`Unable to load animal details: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimalData();
    
    // Set up event listener for favorites changes from other components
    const handleStorageChange = (e) => {
      if (e.key === 'animalFavorites' || e.type === 'storage') {
        // Reload favorite status
        const storedFavorites = localStorage.getItem('animalFavorites');
        if (storedFavorites) {
          const favoritesObj = JSON.parse(storedFavorites);
          setIsFavorite(!!favoritesObj[id]);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [id]);

  const toggleFavorite = () => {
    if (!animal) return;
    
    // Get current favorites
    const storedFavorites = localStorage.getItem('animalFavorites') || '{}';
    const favorites = JSON.parse(storedFavorites);
    
    // Toggle favorite status for this animal
    const newFavoriteState = !isFavorite;
    favorites[id] = newFavoriteState;
    
    // Save updated favorites
    localStorage.setItem('animalFavorites', JSON.stringify(favorites));
    setIsFavorite(newFavoriteState);
    
    // Trigger storage event for other components to update
    window.dispatchEvent(new Event('storage'));
  };

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handlePrevImage = () => {
    if (!animal || !animal.images.length) return;
    setSelectedImageIndex((prevIndex) => 
      prevIndex === 0 ? animal.images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    if (!animal || !animal.images.length) return;
    setSelectedImageIndex((prevIndex) => 
      prevIndex === animal.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleContactOwner = () => {
    // Check if animal exists first
    if (!animal) {
      console.log("No animal found");
      return;
    }
    
    console.log("Attempting to email owner:", animal.ownerEmail);
    
    // Explicitly check if owner email exists
    if (animal.ownerEmail) {
      // Create formatted email subject
      const emailSubject = `Interest in adopting ${animal.name}`;
      
      // Create formatted email body
      const emailBody = `
     Hello,

     I am interested in adopting ${animal.name}, the ${animal.gender === 'Male' ? 'male' : 'female'} ${animal.species} who is ${animal.age} years old.

     I would like more information about ${animal.name} and possibly arrange a meeting to get to know them.

      Could you please let me know:
      - The adoption conditions
      - If ${animal.name} gets along well with other animals
      - ${animal.name}'s specific habits and needs

      Thank you in advance for your response, and I remain available to discuss further.

      Best regards,
      [Your name] `;
      
      // Encode parameters for mailto URL
      const encodedSubject = encodeURIComponent(emailSubject);
      const encodedBody = encodeURIComponent(emailBody);
      
      // Open mail client with template
      const mailtoUrl = `mailto:${animal.ownerEmail}?subject=${encodedSubject}&body=${encodedBody}`;
      console.log("Opening email client with URL:", mailtoUrl);
      
      // Use a new way to open the mail client
      try {
        window.location.href = mailtoUrl;
      } catch (error) {
        console.error("Error opening email client:", error);
        alert("An error occurred while opening your email client. Please try again or copy the address: " + animal.ownerEmail);
      }
    } else {
      // Alert message if no email available
      console.log("No email found for animal:", animal);
      alert("Sorry, no email address is available for this contact. Please use our contact form.");
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading animal details...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!animal) {
    return <div className={styles.notFound}>Animal not found</div>;
  }
  
  return (
    <div className={styles.animalDetailContainer}>  
      <div className={styles.animalDetailCard}>
        <div className={styles.animalImageGallery}>
          <div className={styles.mainImageContainer}>
            <img 
              src={animal.images[selectedImageIndex]} 
              alt={`${animal.name} - Photo ${selectedImageIndex + 1}`} 
              className={styles.mainImage} 
            />
            
            {/* Navigation buttons */}
            {animal.images.length > 1 && (
              <div className={styles.galleryNavigation}>
                <button 
                  className={`${styles.navButton} ${styles.navButtonPrev}`}
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button 
                  className={`${styles.navButton} ${styles.navButtonNext}`}
                  onClick={handleNextImage}
                  aria-label="Next image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Image counter */}
            {animal.images.length > 1 && (
              <div className={styles.imageCounter}>
                {selectedImageIndex + 1} / {animal.images.length}
              </div>
            )}
            
            <button 
              className={`${styles.favoriteBtn} ${isFavorite ? styles.active : ''}`}
              onClick={toggleFavorite}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFavorite ? "red" : "none"} stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
          
          {animal.images.length > 1 && (
            <div className={styles.thumbnailsContainer}>
              {animal.images.map((img, index) => (
                <div
                  key={index}
                  className={`${styles.thumbnail} ${selectedImageIndex === index ? styles.activeThumbnail : ''}`}
                  onClick={() => handleImageClick(index)}
                >
                  <img 
                    src={img} 
                    alt={`${animal.name} - Thumbnail ${index + 1}`} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className={styles.animalInfoContainer}>
          <h1 className={styles.animalName}>{animal.name}</h1>
          
          <div className={styles.animalDetailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Species:</span>
              <span className={styles.detailValue}>{animal.species}</span>
            </div>
            
            {animal.race && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Breed:</span>
                <span className={styles.detailValue}>{animal.race}</span>
              </div>
            )}
            
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Gender:</span>
              <span className={styles.detailValue}>
                <span className={styles.genderIcon}>
                  {(animal.gender === 'male' || animal.gender === 'Male') ? (
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
              </span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Age:</span>
              <span className={styles.detailValue}>{animal.age} years</span>
            </div>
            
            {animal.size && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Size:</span>
                <span className={styles.detailValue}>{animal.size}</span>
              </div>
            )}
          </div>
          
          <div className={styles.animalDescription}>
            <h2>About {animal.name}</h2>
            <p>{animal.description}</p>
          </div>
          
          <div className={styles.adoptionSection}>
            <h2>Interested in adoption?</h2>
            <p>If you wish to adopt {animal.name}, please contact {animal.ownerName ? `${animal.ownerName}` : 'us'} to organize a meeting</p>
            
            {animal.ownerPhone && (
              <div className={styles.contactInfo}>
                <span className={styles.contactLabel}>Phone:</span>
                <span className={styles.contactValue}>{animal.ownerPhone}</span>
              </div>
            )}
            
            <div className={styles.actionButtons}>
              <button className={styles.contactButton} onClick={handleContactOwner}>
                {animal.ownerEmail ? 'Contact by email' : 'Contact'}
              </button>
              
              <Link href="/AnimalCatalog" className={styles.backToCatalog}>
                Back to catalog
              </Link>
              
              <Link href="/FavoritePets" className={styles.viewFavorites}>
                View my favorites
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalDetail;