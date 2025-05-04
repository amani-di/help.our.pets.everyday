'use client';

import { useState, useEffect } from 'react';
import MissingAnimalCard from '../component/DisappearAnimalCard';
import Link from 'next/link';
import styles from '../styles/disappearances.module.css';

// This would be replaced with an actual API call in production
import missingData from './missing.json';

export default function DisappearancesPage() {
  const [missingReports, setMissingReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 6;
  
  useEffect(() => {
    // In a real implementation, fetch data from your MongoDB API
    // For now, we're using the static JSON data
    try {
      // Filter to show only disappearance reports
      const disappearanceReports = missingData.reports.filter(
        report => report.reportType === 'disappearance'
      );
      setMissingReports(disappearanceReports);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load missing animal reports');
      setIsLoading(false);
    }
  }, []);
  
  // Get current reports based on pagination
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = missingReports.slice(indexOfFirstReport, indexOfLastReport);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  if (isLoading) return <div className={styles.loadingContainer}>Loading reports...</div>;
  if (error) return <div className={styles.errorContainer}>{error}</div>;
  
  return (
    <div className={styles.disappear}>
      <div className={styles.disappearContainer}>
        <h1 className={styles.disappearTitle}>Missing Animal Reports</h1>
        <p className={styles.disappearDescription}>
          Help us reunite lost animals with their families. Browse through recent disappearance reports and contact owners if you have any information.
        </p>
        
        {/* Add a button to report a new disappearance */}
        <div className={styles.actionButtonContainer}>
          <Link href="../report" className={styles.reportButton}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Report Missing Animal
          </Link>
        </div>
        
        <div className={styles.disappearReportsList}>
          {currentReports.length > 0 ? (
            currentReports.map((report) => (
              <MissingAnimalCard key={report.id} report={report} />
            ))
          ) : (
            <div className={styles.noReportsContainer}>
              <p>No missing animal reports at this time.</p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {missingReports.length > reportsPerPage && (
          <div className={styles.paginationButtons}>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={styles.viewMoreButton}
            >
              <span className={styles.buttonIcon}>←</span> Previous
            </button>
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(missingReports.length / reportsPerPage)}
              className={styles.viewMoreButton}
            >
              Next <span className={styles.buttonIcon}>→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}