"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../../styles/donationDetail.module.css';

export default function DonationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchDonationDetail = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        setError('');

        // Essayer de récupérer depuis l'API des dons d'abord
        let response = await fetch(`/api/don/${params.id}`);
        let result = await response.json();
        let isShelter = false;

        // Si pas trouvé dans les dons, essayer dans les refuges
        if (!result.success) {
          response = await fetch(`/api/refuge/${params.id}`);
          result = await response.json();
          isShelter = true;
        }

        if (!result.success) {
          throw new Error('Item not found');
        }

        // Transformer les données selon le type
        let transformedData;
        if (isShelter) {
          transformedData = {
            id: result.data._id,
            title: result.data.nom,
            description: result.data.description,
            date: new Date(result.data.createdAt).toLocaleDateString('fr-FR'),
            type: 'shelter',
            photos: result.data.photos || [],
            address: {
              cite: result.data.adresse.cite,
              commune: result.data.adresse.commune,
              wilaya: result.data.adresse.wilaya,
              full: `${result.data.adresse.cite}, ${result.data.adresse.commune}, ${result.data.adresse.wilaya}`
            },
            capacity: result.data.capacite,
            acceptedAnimals: result.data.typeAnimaux,
            contact: result.data.contact,
            userInfo: result.data.userInfo,
            originalData: result.data
          };
        } else {
          transformedData = {
            id: result.data._id,
            title: result.data.nom,
            description: result.data.message,
            date: new Date(result.data.createdAt).toLocaleDateString('fr-FR'),
            type: result.data.typeInfo?.nomType?.toLowerCase() || 'other',
            photos: result.data.photos || [],
            typeInfo: result.data.typeInfo,
            userInfo: result.data.userInfo,
            originalData: result.data
          };
        }

        setDonation(transformedData);

      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        setError('Item not found or error loading data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDonationDetail();
  }, [params.id]);

  const nextImage = () => {
    if (donation?.photos && donation.photos.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === donation.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (donation?.photos && donation.photos.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? donation.photos.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <Link href="/Donations" className={styles.backButton}>
            Back to Donations
          </Link>
        </div>
      </div>
    );
  }

  const isShelter = donation.type === 'shelter';
  
  // Amélioration de la logique d'affichage d'image
  const displayImage = donation.photos && donation.photos.length > 0 
    ? donation.photos[currentImageIndex]?.url || donation.photos[0]?.url
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/Donations" className={styles.backLink}>
          ← Back to Donations
        </Link>
        <span className={`${styles.badge} ${isShelter ? styles.shelterBadge : styles.donationBadge}`}>
          {isShelter ? 'Shelter' : donation.typeInfo?.nomType || 'Donation'}
        </span>
      </div>

      <div className={styles.content}>
        <div className={styles.imageSection}>
          {donation.photos && donation.photos.length > 0 ? (
            <div className={styles.imageContainer}>
              <Image
                src={displayImage || '/images/default-donation.jpg'}
                alt={donation.title}
                width={600}
                height={400}
                className={styles.mainImage}
                style={{ objectFit: 'cover' }}
              />
              
              {donation.photos.length > 1 && (
                <>
                  <button 
                    className={`${styles.imageNav} ${styles.prevButton}`}
                    onClick={prevImage}
                  >
                    ‹
                  </button>
                  <button 
                    className={`${styles.imageNav} ${styles.nextButton}`}
                    onClick={nextImage}
                  >
                    ›
                  </button>
                  <div className={styles.imageIndicator}>
                    {currentImageIndex + 1} / {donation.photos.length}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className={styles.noImage}>
              <span>📷</span>
              <p>No image available</p>
            </div>
          )}

          {donation.photos && donation.photos.length > 1 && (
            <div className={styles.thumbnails}>
              {donation.photos.map((photo, index) => (
                <button
                  key={index}
                  className={`${styles.thumbnail} ${index === currentImageIndex ? styles.activeThumbnail : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image
                    src={photo.url}
                    alt={`${donation.title} ${index + 1}`}
                    width={80}
                    height={60}
                    style={{ objectFit: 'cover' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>{donation.title}</h1>
            <p className={styles.date}>Published on {donation.date}</p>
          </div>

          <div className={styles.description}>
            <h3>Description</h3>
            <p>{donation.description}</p>
          </div>

          {isShelter && (
            <div className={styles.shelterDetails}>
              <h3>Shelter Information</h3>
              
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>📍</span>
                  <div>
                    <strong>Full Address</strong>
                    <p>{donation.address.full}</p>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🏠</span>
                  <div>
                    <strong>Capacity</strong>
                    <p>{donation.capacity} animals</p>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🐾</span>
                  <div>
                    <strong>Accepted Animals</strong>
                    <p>{donation.acceptedAnimals?.join(', ') || 'Non spécifié'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className={styles.contactSection}>
            <h3>Contact the Owner</h3>
            <div className={styles.contactCard}>
              {donation.userInfo && (
                <div className={styles.ownerInfo}>
                  <div className={styles.ownerName}>
                    <span className={styles.ownerIcon}>👤</span>
                    <strong>
                      {donation.userInfo.nom && donation.userInfo.prenom 
                        ? `${donation.userInfo.nom} ${donation.userInfo.prenom}`
                        : donation.userInfo.nom || donation.userInfo.prenom || 'Utilisateur'
                      }
                    </strong>
                  </div>
                </div>
              )}

              <div className={styles.contactMethods}>
                {/* Priorité à l'email du contact, puis userInfo */}
                {(donation.contact?.email || donation.userInfo?.email) && (
                  <a 
                    href={`mailto:${donation.contact?.email || donation.userInfo?.email}`}
                    className={styles.contactMethod}
                  >
                    <span className={styles.contactIcon}>✉️</span>
                    <div>
                      <strong>Email</strong>
                      <p>{donation.contact?.email || donation.userInfo?.email}</p>
                    </div>
                  </a>
                )}

                {/* Priorité au téléphone du contact, puis userInfo */}
                {(donation.contact?.telephone || donation.userInfo?.telephone) && (
                  <a 
                    href={`tel:${donation.contact?.telephone || donation.userInfo?.telephone}`}
                    className={styles.contactMethod}
                  >
                    <span className={styles.contactIcon}>📞</span>
                    <div>
                      <strong>Phone</strong>
                      <p>{donation.contact?.telephone || donation.userInfo?.telephone}</p>
                    </div>
                  </a>
                )}
              </div>

              {/* Message si aucun contact disponible */}
              {!donation.contact?.email && 
               !donation.userInfo?.email && 
               !donation.contact?.telephone && 
               !donation.userInfo?.telephone && (
                <p className={styles.noContact}>Contact information not available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}