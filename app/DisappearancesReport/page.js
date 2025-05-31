'use client';  
import { useState, useEffect } from 'react'; 
import MissingAnimalCard from '../component/DisappearAnimalCard'; 
import Link from 'next/link'; 
import styles from '../styles/disappearances.module.css'; 

export default function DisappearancesPage() { 
  const [missingReports, setMissingReports] = useState([]);   
  const [isLoading, setIsLoading] = useState(true);   
  const [error, setError] = useState(null);   
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [filters, setFilters] = useState({
    wilaya: '',
    commune: ''
  });
  const reportsPerPage = 6;      
  
  const fetchReports = async (page = 1, filterParams = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Construction de l'URL avec les paramètres
      const params = new URLSearchParams({
        page: page.toString(),
        limit: reportsPerPage.toString(),
        ...filterParams
      });

      const response = await fetch(`/api/reports/get-disappearances?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setMissingReports(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalReports(data.pagination.totalReports);
        setCurrentPage(data.pagination.page);
      } else {
        throw new Error(data.message || 'Failed to load disappearance reports');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Failed to load disappearance reports');
      setMissingReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Appliquer les filtres lors du chargement initial
    const activeFilters = {};
    if (filters.wilaya) activeFilters.wilaya = filters.wilaya;
    if (filters.commune) activeFilters.commune = filters.commune;
    
    fetchReports(currentPage, activeFilters);
  }, [currentPage, filters]);
  
  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1); // Reset à la première page lors du changement de filtre
  };

  const clearFilters = () => {
    setFilters({ wilaya: '', commune: '' });
    setCurrentPage(1);
  };

  // Générer les numéros de page pour la pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };
  
  if (isLoading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}></div>
      <p>Loading reports...</p>
    </div>
  );
  
  if (error) return (
    <div className={styles.errorContainer}>
      <h3>Error</h3>
      <p>{error}</p>
      <button 
        onClick={() => fetchReports(currentPage, filters)}
        className={styles.retryButton}
      >
        Retry
      </button>
    </div>
  );
  
  return (     
    <div className={styles.disappear}>       
      <div className={styles.disappearContainer}>         
        <h1 className={styles.disappearTitle}>Missing Animal Reports</h1>         
        <p className={styles.disappearDescription}>
          Help us find lost animals and reunite them with their families. 
          Browse recent reports and contact owners if you have any information.
        </p>
        
        {/* Bouton pour signaler une nouvelle disparition */}         
        <div className={styles.actionButtonContainer}>           
          <Link href="../report" className={styles.reportButton}>             
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">               
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />             
            </svg>             
            Report a Missing Animal           
          </Link>         
        </div>

        {/* Filtres de recherche */}
        <div className={styles.filtersContainer}>
          <div className={styles.filterGroup}>
            <label htmlFor="wilaya-filter">Province:</label>
            <select 
              id="wilaya-filter"
              value={filters.wilaya} 
              onChange={(e) => handleFilterChange('wilaya', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All provinces</option>
              <option value="Alger">Algiers</option>
              <option value="Oran">Oran</option>
              <option value="Constantine">Constantine</option>
              <option value="Annaba">Annaba</option>
              {/* Ajouter d'autres wilayas selon vos besoins */}
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label htmlFor="commune-filter">City:</label>
            <input 
              type="text"
              id="commune-filter"
              value={filters.commune}
              onChange={(e) => handleFilterChange('commune', e.target.value)}
              placeholder="City name"
              className={styles.filterInput}
            />
          </div>
          
          {(filters.wilaya || filters.commune) && (
            <button onClick={clearFilters} className={styles.clearFiltersButton}>
              Clear filters
            </button>
          )}
        </div>

        {/* Statistiques */}
        {totalReports > 0 && (
          <div className={styles.statsContainer}>
            <p className={styles.statsText}>
              {totalReports} report{totalReports > 1 ? 's' : ''} found
              {(filters.wilaya || filters.commune) && ' with applied filters'}
            </p>
          </div>
        )}
        
        <div className={styles.disappearReportsList}>           
          {missingReports.length > 0 ? (             
            missingReports.map((report) => (               
              <MissingAnimalCard key={report.id} report={report} />            
            ))
          ) : (            
            <div className={styles.noReportsContainer}>               
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.49 1.021-5.946 2.65m0 0l-1.554.923" />
              </svg>
              <h3>No reports found</h3>
              <p>
                {(filters.wilaya || filters.commune) 
                  ? 'No disappearance reports match your search criteria.'
                  : 'No disappearance reports at the moment.'
                }
              </p>
              {(filters.wilaya || filters.commune) && (
                <button onClick={clearFilters} className={styles.clearFiltersButton}>
                  View all reports
                </button>
              )}
            </div>
          )}        
        </div>
        
        {/* Pagination améliorée */}         
        {missingReports.length > 0 && totalPages > 1 && (           
          <div className={styles.paginationContainer}>
            <div className={styles.paginationInfo}>
              Page {currentPage} of {totalPages}
            </div>
            
            <div className={styles.paginationButtons}>             
              <button               
                onClick={() => paginate(1)}               
                disabled={currentPage === 1}               
                className={styles.paginationButton}
                title="First page"
              >               
                ««
              </button>
              
              <button               
                onClick={() => paginate(currentPage - 1)}               
                disabled={currentPage === 1}               
                className={styles.paginationButton}
                title="Previous page"
              >               
                ‹
              </button>
              
              {getPageNumbers().map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => paginate(pageNum)}
                  className={`${styles.paginationButton} ${pageNum === currentPage ? styles.active : ''}`}
                >
                  {pageNum}
                </button>
              ))}
              
              <button               
                onClick={() => paginate(currentPage + 1)}               
                disabled={currentPage === totalPages}              
                className={styles.paginationButton}
                title="Next page"
              >               
                ›
              </button>
              
              <button               
                onClick={() => paginate(totalPages)}               
                disabled={currentPage === totalPages}              
                className={styles.paginationButton}
                title="Last page"
              >               
                »»
              </button>           
            </div>         
          </div>
        )}       
      </div>     
    </div>  
  ); 
}