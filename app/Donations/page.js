  "use client";

import { useState, useEffect } from 'react';
import DonationFilter from '../component/donation/DonationFilter';
import DonationCatalog from '../component/donation/DonationCatalog';
import styles from '../styles/donations.module.css';
 

 
const DONATIONS_DATA = [
  {
    id: 'd1',
    title: 'Dog Food Donation',
    description: 'Premium quality dog food for adult dogs. Nutritionally complete and balanced diet for all breeds.',
    date: '2025-04-15',
    type: 'food',
    image: 'dog-food.jpg'
  },
  {
    id: 'd2',
    title: 'Blankets and Beds',
    description: 'Warm blankets and comfortable beds for cats and dogs. Perfect for shelters during cold months.',
    date: '2025-04-10',
    type: 'material',
    image: 'blankets.jpg'
  },
  {
    id: 'd3',
    title: 'Happy Paws Shelter',
    description: 'A shelter dedicated to rescuing abandoned pets and finding them forever homes.',
    date: '2025-04-05',
    type: 'shelter',
    address: '123 Animal Lane, Pet City',
    capacity: 50,
    acceptedAnimals: 'Dogs, Cats, Small Mammals',
    image: 'shelter.jpg'
  },
  {
    id: 'd4',
    title: 'Flea & Tick Medications',
    description: 'Preventative medications for fleas, ticks and other parasites. Suitable for cats and dogs.',
    date: '2025-04-18',
    type: 'medications',
    image: 'meds.jpg'
  },
  {
    id: 'd5',
    title: 'Pet Grooming Supplies',
    description: 'High-quality brushes, shampoos, and other grooming tools for animal care.',
    date: '2025-04-12',
    type: 'care-supplies',
    image: 'grooming.jpg'
  }
];

export default function DonationsPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredDonations, setFilteredDonations] = useState([]);

  // Filtrer les donations quand le filtre actif change
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredDonations(DONATIONS_DATA);
    } else {
      const filtered = DONATIONS_DATA.filter(donation => donation.type === activeFilter);
      setFilteredDonations(filtered);
    }
  }, [activeFilter]);

  return (
    <div className={styles.donationContainer}>
      <h1 className={styles.donationTitle}>Animal Shelter Donations</h1>
      
      <div className={styles.quoteContainer}>
        <p className={styles.quote}>"The greatness of a nation can be judged by the way its animals are treated."</p>
        <p>- Mahatma Gandhi</p>
      </div>

      <DonationFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <DonationCatalog donations={filteredDonations} />

      <div className={styles.viewMmoreContainer}>
        <button className={styles.viewMoreBtn}>View More Donations</button>
      </div>
    </div>
  );
}