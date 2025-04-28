"use client";

import { useState, useEffect } from 'react';
import styles from './serviceLocator.module.css';
import servicesData from './services.json';

// SVG Icons for the component
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
    <line x1="8" y1="2" x2="8" y2="18"></line>
    <line x1="16" y1="6" x2="16" y2="22"></line>
  </svg>
);

const VetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"></path>
    <path d="m9 14 2 2 4-4"></path>
    <path d="M12 6v2"></path>
    <path d="M12 10h.01"></path>
  </svg>
);

const AssociationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 22h4a2 2 0 0 0 2-2v-1a5 5 0 0 0-5-5 3 3 0 1 0 0-6 5 5 0 0 0 5-5v-1a2 2 0 0 0-2-2h-4"></path>
    <path d="M8 22H4a2 2 0 0 1-2-2v-1a5 5 0 0 1 5-5 3 3 0 1 1 0-6 5 5 0 0 1-5-5V2a2 2 0 0 1 2-2h4"></path>
  </svg>
);

const PetShopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 13v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6"></path>
    <path d="M21 5H3a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"></path>
  </svg>
);

export default function ServiceLocator() {
  const [filters, setFilters] = useState({
    veterinarian: true,
    association: true,
    petshop: true
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  
  // Initialize with all services
  useEffect(() => {
    applyFilters();
  }, [filters, searchTerm]);
  
  // Apply filters and search term
  const applyFilters = () => {
    let results = servicesData.services.filter(service => {
      // Type filter
      const typeMatch = filters[service.type];
      
      // Search by wilaya
      const searchMatch = searchTerm === '' || 
        service.wilaya.toLowerCase().includes(searchTerm.toLowerCase());
      
      return typeMatch && searchMatch;
    });
    
    setFilteredServices(results);
  };
  
  // Toggle filter state
  const toggleFilter = (filterType) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };
  
  // Get appropriate icon and style based on service type
  const getServiceIcon = (type) => {
    switch(type) {
      case 'veterinarian':
        return <VetIcon />;
      case 'association':
        return <AssociationIcon />;
      case 'petshop':
        return <PetShopIcon />;
      default:
        return null;
    }
  };
  
  const getCardClass = (type) => {
    let baseClass = styles.resultCard;
    switch(type) {
      case 'veterinarian':
        return `${baseClass} ${styles.vetCard}`;
      case 'association':
        return `${baseClass} ${styles.assocCard}`;
      case 'petshop':
        return `${baseClass} ${styles.shopCard}`;
      default:
        return baseClass;
    }
  };
  
  const getIconClass = (type) => {
    let baseClass = styles.resultIcon;
    switch(type) {
      case 'veterinarian':
        return `${baseClass} ${styles.vetIcon}`;
      case 'association':
        return `${baseClass} ${styles.assocIcon}`;
      case 'petshop':
        return `${baseClass} ${styles.shopIcon}`;
      default:
        return baseClass;
    }
  };
  
  const getFilterClass = (type) => {
    let baseClass;
    switch(type) {
      case 'veterinarian':
        baseClass = `${styles.filterButton} ${styles.vetFilter}`;
        break;
      case 'association':
        baseClass = `${styles.filterButton} ${styles.assocFilter}`;
        break;
      case 'petshop':
        baseClass = `${styles.filterButton} ${styles.shopFilter}`;
        break;
      default:
        baseClass = styles.filterButton;
    }
    
    return filters[type] ? `${baseClass} ${styles.active}` : baseClass;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Find Pet Services in Algeria</h1>
      <p className={styles.description}>
        Find veterinarians, animal associations, and pet shops across Algeria
      </p>
      
      <div className={styles.mainContent}>
        <div className={styles.sidebar}>
          <form onSubmit={handleSearchSubmit}>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Search by wilaya (province)..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={handleSearchChange}
                list="wilayasList"
              />
              <datalist id="wilayasList">
                {servicesData.wilayas.map((wilaya, index) => (
                  <option key={index} value={wilaya} />
                ))}
              </datalist>
              <button type="submit" className={styles.searchButton}>
                <SearchIcon />
              </button>
            </div>
          </form>
          
          <div className={styles.filtersContainer}>
            <button 
              className={getFilterClass('veterinarian')}
              onClick={() => toggleFilter('veterinarian')}
            >
              <VetIcon /> Veterinarians
            </button>
            <button 
              className={getFilterClass('association')}
              onClick={() => toggleFilter('association')}
            >
              <AssociationIcon /> Associations
            </button>
            <button 
              className={getFilterClass('petshop')}
              onClick={() => toggleFilter('petshop')}
            >
              <PetShopIcon /> Pet Shops
            </button>
          </div>
          
          <div className={styles.resultsList}>
            {filteredServices.length > 0 ? (
              filteredServices.map(service => (
                <div key={service.id} className={getCardClass(service.type)}>
                  <div className={getIconClass(service.type)}>
                    {getServiceIcon(service.type)}
                  </div>
                  <div className={styles.resultContent}>
                    <h3 className={styles.resultName}>{service.name}</h3>
                    <p className={styles.resultAddress}>
                      <LocationIcon /> {service.address}
                    </p>
                    <p className={styles.resultWilaya}>
                      <MapIcon /> {service.wilaya}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noResults}>
                <div className={styles.noResultsIcon}>🔍</div>
                <p>No services found matching your criteria</p>
                <p>Try adjusting your filters or search term</p>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.mapContainer}>
          <div className={styles.map}>
            { }
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#64748b',
              width: '80%'
            }}>
              <h3>Map of Algeria</h3>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}