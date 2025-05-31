// components/Maltraitance.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, User, Calendar, MapPin, Video, Camera } from 'lucide-react';
import styles from '../styles/maltraitanceCard.module.css';

export default function AbuseReportCard({ report }) {
  const [imageError, setImageError] = useState(false);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get first photo for display
  const primaryPhoto = report.photos && report.photos.length > 0 ? report.photos[0] : null;

  return (
    <div className={styles.card}>
      {/* Card header */}
      <div className={styles.cardHeader}>
        <div className={styles.reportBadge}>
          <span className={styles.abuseIcon}>⚠️</span>
          Animal Abuse Report
        </div>
        <div className={styles.reportDate}>
          <Calendar size={16} className={styles.calendarIcon} />
          <div className={styles.dateTimeContainer}>
            <span className={styles.dateText}>Reported on {formatDate(report.createdAt)}</span>
            <span className={styles.timeText}>at {formatTime(report.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className={styles.cardBody}>
        {/* Photo section */}
        <div className={styles.photoSection}>
          {primaryPhoto && !imageError ? (
            <div className={styles.photoContainer}>
              <img 
                src={primaryPhoto.url} 
                alt="Animal abuse report"
                className={styles.primaryPhoto}
                onError={() => setImageError(true)}
              />
              {report.photos.length > 1 && (
                <div className={styles.photoCount}>
                  <Camera size={14} />
                  +{report.photos.length - 1} photo{report.photos.length > 2 ? 's' : ''}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.noPhotoPlaceholder}>
              <Camera size={24} className={styles.noPhotoIcon} />
              <span>No photo available</span>
            </div>
          )}
        </div>

        {/* Main information */}
        <div className={styles.infoSection}>
          {/* Location */}
          <div className={styles.locationInfo}>
            <h3 className={styles.locationTitle}>
              <MapPin size={18} className={styles.locationIcon} />
              {report.location.commune}, {report.location.wilaya}
            </h3>
            <p className={styles.neighborhoodText}>
              Neighborhood: {report.location.neighborhood}
            </p>
          </div>

          {/* Incident date */}
          <div className={styles.incidentInfo}>
            <div className={styles.incidentDate}>
              <Calendar size={16} className={styles.incidentIcon} />
              <div className={styles.incidentDetails}>
                <span className={styles.incidentLabel}>Incident Date:</span>
                <span className={styles.incidentValue}>
                  {formatDate(report.dateIncident)}
                </span>
              </div>
            </div>
          </div>

          {/* Description (if available) */}
          {report.description && (
            <div className={styles.descriptionInfo}>
              <h4 className={styles.descriptionTitle}>Description:</h4>
              <p className={styles.descriptionText}>
                {report.description.length > 150 
                  ? `${report.description.substring(0, 150)}...` 
                  : report.description
                }
              </p>
            </div>
          )}

          {/* Video indicator */}
          {report.video && (
            <div className={styles.videoIndicator}>
              <Video size={16} className={styles.videoIcon} />
              <span className={styles.videoText}>Video available</span>
            </div>
          )}
        </div>
      </div>

      {/* Card footer - Contact information */}
      <div className={styles.cardFooter}>
        <div className={styles.contactSection}>
          <h4 className={styles.contactTitle}>
            <User size={16} className={styles.userIcon} />
            Reporter Information:
          </h4>
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <User size={16} className={styles.contactIcon} />
              <span className={styles.contactText}>{report.userInfo.name}</span>
            </div>
            <div className={styles.contactItem}>
              <Mail size={16} className={styles.contactIcon} />
              <span className={styles.contactText}>{report.userInfo.email}</span>
            </div>
            {report.userInfo.phone !== 'Non spécifié' && report.userInfo.phone !== 'Not specified' && (
              <div className={styles.contactItem}>
                <Phone size={16} className={styles.contactIcon} />
                <span className={styles.contactText}>{report.userInfo.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.cardActions}>
          <Link 
            href={`/AbuseReports/${report._id}`}
             
            className={styles.viewDetailsButton}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}