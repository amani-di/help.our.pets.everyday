'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/disappearances.module.css';

export default function MissingAnimalCard({ report }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sightingForm, setSightingForm] = useState({
    name: '',
    contact: '',
    location: '',
    date: '',
    details: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Calculate days missing
  const calculateDaysMissing = (disappearanceDate) => {
    if (!disappearanceDate) return 'N/A';
    const diffTime = Math.abs(new Date() - new Date(disappearanceDate));
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days;
  };

  // Get the main photo URL
  const getPhotoUrl = () => {
    if (report.photos && report.photos.length > 0) {
      // Si c'est un objet avec url
      if (typeof report.photos[0] === 'object' && report.photos[0].url) {
        return report.photos[0].url;
      }
      // Si c'est directement une string
      if (typeof report.photos[0] === 'string') {
        return report.photos[0];
      }
    }
    return '/placeholder-pet.jpg';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSightingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitSighting = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Ici vous pouvez ajouter la logique pour soumettre le signalement d'observation
      // Par exemple, appeler une API pour envoyer les informations au propriétaire
      console.log('Sighting report:', {
        reportId: report.id,
        sighting: sightingForm
      });

      // Simuler un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('Your sighting report has been sent successfully!');
      setIsModalOpen(false);
      setSightingForm({
        name: '',
        contact: '',
        location: '',
        date: '',
        details: ''
      });
    } catch (error) {
      console.error('Error sending report:', error);
      alert('Error sending the report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const daysMissing = calculateDaysMissing(report.disappearanceDate || report.dateIncident);

  return (
    <>
      <div className={styles.disappearReportCard}>
        <div className={styles.cardImageContainer}>
          <Image 
            src={getPhotoUrl()} 
            alt={`Missing animal - ${report.location?.commune || 'Unknown location'}`}
            className={styles.cardImage}
            width={300}
            height={300}
            priority
            onError={(e) => {
              e.target.src = '/placeholder-pet.jpg';
            }}
          />
          <div className={styles.reportBadge}>Missing</div>
          {daysMissing > 30 && (
            <div className={styles.urgentBadge}>Urgent</div>
          )}
        </div>
        
        <div className={styles.cardContent}>
          <div className={styles.locationHeader}>
            <h2 className={styles.cardTitle}>Missing Animal</h2>
            <div className={styles.speciesTag}>
              <span>Report</span>
            </div>
          </div>
          
          <p className={styles.location}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {report.location?.neighborhood && (
              <span>{report.location.neighborhood}, </span>
            )}
            {report.location?.commune || 'Unknown city'}, {report.location?.wilaya || 'Unknown province'}
          </p>

          {/* Description */}
          {report.description && (
            <div className={styles.description}>
              <p>{report.description.length > 100 
                ? `${report.description.substring(0, 100)}...` 
                : report.description}
              </p>
            </div>
          )}
          
          <div className={styles.reportStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {formatDate(report.disappearanceDate || report.dateIncident)}
              </span>
              <span className={styles.statLabel}>Disappearance Date</span>
            </div>
            
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {daysMissing !== 'N/A' ? `${daysMissing} day${daysMissing > 1 ? 's' : ''}` : 'N/A'}
              </span>
              <span className={styles.statLabel}>Days Elapsed</span>
            </div>
            
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {formatDate(report.publishDate || report.createdAt)}
              </span>
              <span className={styles.statLabel}>Report Date</span>
            </div>
          </div>

          {/* Photos supplémentaires */}
          {report.photos && report.photos.length > 1 && (
            <div className={styles.additionalPhotos}>
              <span className={styles.photoCount}>
                +{report.photos.length - 1} additional photo{report.photos.length > 2 ? 's' : ''}
              </span>
            </div>
          )}
          
          <div className={styles.cardFooter}>
            <div className={styles.reportDate}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Reported on: {formatDate(report.publishDate || report.createdAt)}
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)} 
              className={styles.contactButton}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              I saw this animal
            </button>
          </div>
        </div>
      </div>

      {/* Modal de contact */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Report a Sighting</h3>
              <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.reportInfo}>
                <p><strong>Animal missing from:</strong> {report.location?.commune}, {report.location?.wilaya}</p>
                <p><strong>Missing since:</strong> {formatDate(report.disappearanceDate || report.dateIncident)}</p>
                {report.description && (
                  <p><strong>Description:</strong> {report.description}</p>
                )}
              </div>

              <form onSubmit={handleSubmitSighting} className={styles.sightingForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Your Name *</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name"
                    value={sightingForm.name}
                    onChange={handleInputChange}
                    required 
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="contact">Contact (Email or Phone) *</label>
                  <input 
                    type="text" 
                    id="contact" 
                    name="contact"
                    value={sightingForm.contact}
                    onChange={handleInputChange}
                    placeholder="email@example.com or 0123456789" 
                    required 
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="location">Where did you see this animal? *</label>
                  <input 
                    type="text" 
                    id="location" 
                    name="location"
                    value={sightingForm.location}
                    onChange={handleInputChange}
                    placeholder="Specific address or location"
                    required 
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="date">When did you see this animal? *</label>
                  <input 
                    type="date" 
                    id="date" 
                    name="date"
                    value={sightingForm.date}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    required 
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="details">Additional Details</label>
                  <textarea 
                    id="details" 
                    name="details"
                    value={sightingForm.details}
                    onChange={handleInputChange}
                    placeholder="Animal condition, behavior, accompanied by someone, etc."
                    rows={4}
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className={styles.formActions}>
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className={styles.cancelButton}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}