 "use client";

import Image from 'next/image';
import Link from 'next/link';
import styles from '../../styles/donations.module.css';

const DonationCard = ({ donation }) => {
    const { id, title, description, date, type, image } = donation;
    
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
    const isShelter = type === 'shelter';
    
    return (
        <div className={styles.card}>
            <div className={styles.cardImg}>
                <Image 
                    src={`/images/${image}`} 
                    alt={title} 
                    width={300} 
                    height={200} 
                    style={{ objectFit: "cover" }} 
                />
            </div>
            <div className={styles.cardContent}>
                <span className={styles.cardType}>{formattedType}</span>
                <h3 className={styles.cardTitle}>{title}</h3>
                <p className={styles.cardDescription}>{description}</p>
                
                {isShelter && (
                    <div className={styles.shelterInfo}>
                        {donation.address && (
                            <p className={styles.shelterAddress}>
                                <span className={styles.infoLabel}>Address:</span> {donation.address}
                            </p>
                        )}
                        {donation.capacity && (
                            <p className={styles.shelterCapacity}>
                                <span className={styles.infoLabel}>Capacity:</span> {donation.capacity} animals
                            </p>
                        )}
                        {donation.acceptedAnimals && (
                            <p className={styles.shelterAnimals}>
                                <span className={styles.infoLabel}>Accepts:</span> {donation.acceptedAnimals}
                            </p>
                        )}
                    </div>
                )}
                <p className={styles.cardDate}>Added: {date}</p>
                
                <Link href={`/donations/${id}`} className={styles.viewDetailsLink}>
                    View Details →
                </Link>
            </div>
        </div>
    );
};

export default DonationCard;