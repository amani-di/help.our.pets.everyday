'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AbuseReportCard from '../component/MaltraitanceCard';
import styles from '../styles/abuseReports.module.css';

// List of Algerian wilayas for filtering
const algerianWilayas = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", 
  "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", 
  "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", 
  "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", 
  "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", 
  "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", 
  "Ghardaïa", "Relizane", "El M'ghair", "El Menia", "Ouled Djellal", "Bordj Baji Mokhtar", 
  "Béni Abbès", "Timimoun", "Touggourt", "Djanet", "In Salah", "In Guezzam"
];

export default function AbuseReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReports: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Filters
  const [filters, setFilters] = useState({
    wilaya: '',
    page: 1,
    limit: 12
  });

  // Access verification - only for associations
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/signuplogin');
      return;
    }
    
    if (session.user.userType !== 'association') {
      router.push('/unauthorized');
      return;
    }
  }, [session, status, router]);

  // Function to fetch reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams();
      if (filters.wilaya) queryParams.append('wilaya', filters.wilaya);
      queryParams.append('page', filters.page.toString());
      queryParams.append('limit', filters.limit.toString());
      
      const response = await fetch(`/api/reports/maltraitance?${queryParams}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error loading reports');
      }
      
      setReports(data.data);
      setPagination(data.pagination);
      
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load reports on mount and when filters change
  useEffect(() => {
    if (session && session.user.userType === 'association') {
      fetchReports();
    }
  }, [filters, session]);

  // Handle wilaya filter change
  const handleWilayaChange = (e) => {
    setFilters({
      ...filters,
      wilaya: e.target.value,
      page: 1 // Reset to first page
    });
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (status === 'loading' || (session && session.user.userType === 'association' && loading && reports.length === 0)) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  // If no access
  if (!session || session.user.userType !== 'association') {
    return null; // The useEffect handles redirection
  }

  return (
    <div className={styles.abuseReportsPage}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>
            <span className={styles.titleIcon}>⚠️</span>
            Animal Abuse Reports
          </h1>
          <p className={styles.pageDescription}>
            View animal abuse reports for your intervention
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersSection}>
        <div className={styles.filtersContainer}>
          <div className={styles.filterGroup}>
            <label htmlFor="wilayaFilter" className={styles.filterLabel}>
              Filter by Wilaya:
            </label>
            <select
              id="wilayaFilter"
              value={filters.wilaya}
              onChange={handleWilayaChange}
              className={styles.filterSelect}
            >
              <option value="">All wilayas</option>
              {algerianWilayas.map((wilaya, index) => (
                <option key={index} value={wilaya}>
                  {wilaya}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.resultsInfo}>
            <span className={styles.resultsCount}>
              {pagination.totalReports} report{pagination.totalReports !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>
      </div>

      {/* Error messages */}
      {error && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>❌</span>
          {error}
          <button onClick={fetchReports} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      {/* Main content */}
      <div className={styles.mainContent}>
        {loading ? (
          <div className={styles.loadingGrid}>
            {[...Array(6)].map((_, index) => (
              <div key={index} className={styles.cardSkeleton}></div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <h3 className={styles.emptyTitle}>No reports found</h3>
            <p className={styles.emptyDescription}>
              {filters.wilaya 
                ? `No abuse reports in ${filters.wilaya} wilaya`
                : 'No abuse reports at the moment'
              }
            </p>
            {filters.wilaya && (
              <button 
                onClick={() => setFilters({...filters, wilaya: '', page: 1})}
                className={styles.clearFiltersButton}
              >
                View all reports
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Reports grid */}
            <div className={styles.reportsGrid}>
              {reports.map((report) => (
                <AbuseReportCard key={report._id} report={report} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className={styles.paginationContainer}>
                <div className={styles.pagination}>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className={`${styles.paginationButton} ${!pagination.hasPrevPage ? styles.disabled : ''}`}
                  >
                    ← Previous
                  </button>
                  
                  <div className={styles.paginationInfo}>
                    <span className={styles.paginationText}>
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className={`${styles.paginationButton} ${!pagination.hasNextPage ? styles.disabled : ''}`}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}