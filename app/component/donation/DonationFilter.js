"use client";
import styles from '../../styles/donations.module.css';

const DonationFilter = ({ activeFilter, onFilterChange }) => {
    const filterTypes = [
        { id: 'all', label: 'All Donations' },
        { id: 'food', label: 'Food' },
        { id: 'material', label: 'Material' },
        { id: 'medications', label: 'Medications' },
        { id: 'care-supplies', label: 'Care Supplies' },
        { id: 'shelter', label: 'Shelter' }
    ];
  
    return (
        <div className={styles.filterContainer}>
            {filterTypes.map(filter => (
                <button 
                    key={filter.id}
                    className={`styles.filterBtn  ${activeFilter === filter.id ? 'active' : ''}`} 
                   // className={styles.filterBtn}
                    onClick={() => onFilterChange(filter.id)}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
};

export default DonationFilter;