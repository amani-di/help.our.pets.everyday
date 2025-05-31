'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MapPin, Calendar, Clock, User, Mail, Phone, Camera, Video, AlertTriangle } from 'lucide-react';
import styles from '../../styles/reportDetail.module.css';

// Stable date formatting function between server and client
function formatDate(dateString) {
  const date = new Date(dateString);
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function ReportDetail() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const { id } = params;
  
  // State for report data
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for image management
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState({});

  // Access verification - only for associations
  useEffect(() => {
    if (session && session.user?.userType !== 'association') {
      router.push('/unauthorized');
      return;
    }
  }, [session, router]);
  
  // Load report data from API
  useEffect(() => {
    const fetchReportData = async () => {
      if (!id || !session) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/reports/maltraitance/${id}`);
        
        if (!response.ok) {
          throw new Error('Error loading report');
        }
        
        const reportData = await response.json();
        setReport(reportData.data);
        
      } catch (err) {
        console.error('Error loading report:', err);
        setError(err.message);
        if (err.message.includes('not found')) {
          router.push('/reports/maltraitance');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [id, session, router]);
  
  // Function to handle image navigation
  const nextImage = () => {
    if (report?.photos && report.photos.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === report.photos.length - 1 ? 0 : prevIndex + 1
      );
    }
  };
  
  const prevImage = () => {
    if (report?.photos && report.photos.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? report.photos.length - 1 : prevIndex - 1
      );
    }
  };

  const handleImageError = (index) => {
    setImageError(prev => ({
      ...prev,
      [index]: true
    }));
  };

  // Loading component
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading report details...</p>
        </div>
      </div>
    );
  }

  // Error component
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Report not found</div>
      </div>
    );
  }

  // Constants for calculated props
  const mainImage = report.photos && report.photos.length > 0 ? report.photos[currentImageIndex]?.url : null;
  const hasMultipleImages = report.photos && report.photos.length > 1;

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumbs}>
        <Link href="/AbuseReports">
          Animal Abuse Reports
        </Link>
        <span> &gt; </span>
        <span>Report Details</span>
      </div>
      
      <div className={styles.reportDetailContainer}>
        {/* Media section (photos/videos) */}
        <div className={styles.mediaGallery}>
          {mainImage && !imageError[currentImageIndex] ? (
            <div className={styles.mainImage}>
              <img 
                src={mainImage} 
                alt={`Animal abuse report - Image ${currentImageIndex + 1}`}
                onError={() => handleImageError(currentImageIndex)}
              />
              {hasMultipleImages && (
                <>
                  <button className={`${styles.navButton} ${styles.prevButton}`} onClick={prevImage}>
                    &lt;
                  </button>
                  <button className={`${styles.navButton} ${styles.nextButton}`} onClick={nextImage}>
                    &gt;
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className={styles.noMediaPlaceholder}>
              <Camera size={48} className={styles.noMediaIcon} />
              <span>No image available</span>
            </div>
          )}
          
          {/* Thumbnails */}
          {hasMultipleImages && (
            <div className={styles.thumbnails}>
              {report.photos.map((photo, index) => (
                <div 
                  key={index} 
                  className={`${styles.thumbnail} ${index === currentImageIndex ? styles.activeThumbnail : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  {!imageError[index] ? (
                    <img 
                      src={photo.url} 
                      alt={`Thumbnail ${index + 1}`}
                      onError={() => handleImageError(index)}
                    />
                  ) : (
                    <div className={styles.thumbnailError}>
                      <Camera size={16} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Video indicator */}
          {report.video && (
            <div className={styles.videoSection}>
              <div className={styles.videoIndicator}>
                <Video size={24} className={styles.videoIcon} />
                <div className={styles.videoInfo}>
                  <h3>Video available</h3>
                  <p>A video has been provided with this report</p>
                  {report.video.url && (
                    <a 
                      href={report.video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.videoLink}
                    >
                      Watch video
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Report information */}
        <div className={styles.reportInfo}>
          <div className={styles.reportHeader}>
            <div className={styles.reportBadge}>
              <AlertTriangle size={16} />
              Animal Abuse Report
            </div>
            <h1 className={styles.reportTitle}>
              Report in {report.location.commune}
            </h1>
            <div className={styles.location}>
              <MapPin size={16} />
              <span>{report.location.neighborhood}, {report.location.commune}, {report.location.wilaya}</span>
            </div>
          </div>
          
          {/* Important dates */}
          <div className={styles.reportDates}>
            <div className={styles.dateTimeContainer}>
              <div className={styles.dateInfo}>
                <div className={styles.dateValue}>
                  {formatDate(report.dateIncident)}
                </div>
                <div className={styles.dateLabel}>Incident date</div>
              </div>
              <div className={styles.timeInfo}>
                <div className={styles.timeValue}>
                  {formatDate(report.createdAt)} at {formatTime(report.createdAt)}
                </div>
                <div className={styles.timeLabel}>Reported on</div>
              </div>
            </div>
          </div>
          
          {/* Description */}
          {report.description && (
            <div className={styles.reportDescription}>
              <h2>Incident description</h2>
              <p>{report.description}</p>
            </div>
          )}
          
          {/* Reporter contact information */}
          <div className={styles.reporterInfo}>
            <h2>Reporter information</h2>
            <div className={styles.contactCard}>
              <div className={styles.contactItem}>
                <User size={18} className={styles.contactIcon} />
                <div className={styles.contactDetails}>
                  <span className={styles.contactLabel}>Name:</span>
                  <span className={styles.contactValue}>{report.userInfo.name}</span>
                </div>
              </div>
              
              <div className={styles.contactItem}>
                <Mail size={18} className={styles.contactIcon} />
                <div className={styles.contactDetails}>
                  <span className={styles.contactLabel}>Email:</span>
                  <span className={styles.contactValue}>
                    <a href={`mailto:${report.userInfo.email}`}>
                      {report.userInfo.email}
                    </a>
                  </span>
                </div>
              </div>
              
              {report.userInfo.phone && report.userInfo.phone !== 'Non spécifié' && report.userInfo.phone !== 'Not specified' && (
                <div className={styles.contactItem}>
                  <Phone size={18} className={styles.contactIcon} />
                  <div className={styles.contactDetails}>
                    <span className={styles.contactLabel}>Phone:</span>
                    <span className={styles.contactValue}>
                      <a href={`tel:${report.userInfo.phone}`}>
                        {report.userInfo.phone}
                      </a>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className={styles.actionButtons}>
            <a href={`mailto:${report.userInfo.email}`}>
              <button className={styles.contactButton}>
                <Mail size={16} />
                Contact reporter
              </button>
            </a>
            {report.userInfo.phone && report.userInfo.phone !== 'Non spécifié' && (
              <a href={`tel:${report.userInfo.phone}`}>
                <button className={styles.phoneButton}>
                  <Phone size={16} />
                  Call
                </button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}