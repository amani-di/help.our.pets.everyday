 'use client';

import { useState, useEffect } from 'react';
import MissingAnimalCard from '../component/MissingAnimalCard';
import styles from '../styles/disappearances.module.css';
import missingData from './missing.json';

export default function DisappearancesPage() {
  const [missingAnimals, setMissingAnimals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 6;

  useEffect(() => {
    // Load data from the static JSON file
    try {
      setMissingAnimals(missingData.missingAnimals);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load missing animal reports');
      setIsLoading(false);
    }
  }, []);

  // Get current reports based on pagination
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = missingAnimals.slice(indexOfFirstReport, indexOfLastReport);

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

        <div className={styles.disappearReportsList}>
          {currentReports.map((animal) => (
            <MissingAnimalCard key={animal.id} animal={animal} />
          ))}
        </div>

        {/* Pagination */}
        {missingAnimals.length > reportsPerPage && (
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
              disabled={currentPage === Math.ceil(missingAnimals.length / reportsPerPage)}
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