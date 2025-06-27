import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import styles from './styles.module.css';
import { useNavigate } from 'react-router-dom';

const AdvancedSearchModal = ({ 
  isOpen, 
  onClose, 
  onSearchResults, 
  setIsLoading 
}) => {
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    propertyType: '',
    listingType: '',
    features: [],
    searchTerm: '',
    city: ''
  });

  const [error, setError] = useState(null);

  const propertyTypes = ['APARTMENT', 'HOUSE', 'LAND', 'COMMERCIAL'];
  const listingTypes = ['SALE', 'RENT'];
  const availableFeatures = ['Parking', 'Garden', 'Pool', 'Elevator', 'AC'];
  
  const navigate = useNavigate();
  
  

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFeatureToggle = (feature) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  try {
    const searchParams = new URLSearchParams();
    
    // Add all active filters
    if (filters.searchTerm.trim()) searchParams.append('searchTerm', filters.searchTerm.trim());
    if (filters.priceMin) searchParams.append('priceMin', filters.priceMin);
    if (filters.priceMax) searchParams.append('priceMax', filters.priceMax);
    if (filters.propertyType) searchParams.append('propertyType', filters.propertyType);
    if (filters.listingType) searchParams.append('listingType', filters.listingType);
    if (filters.city) searchParams.append('city', filters.city);
    filters.features.forEach(f => searchParams.append('features', f));

    // Navigate to search page
    navigate(`/search?${searchParams.toString()}`);
    onClose();

  } catch (error) {
    console.error("Search error:", error);
    setError("Search failed. Please check your filters.");
  } finally {
    setIsLoading(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Напредна претрага</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <div className={styles.priceRange}>
              <div className={styles.priceInput}>
                <label className={styles.label}>Минимална цена</label>
                <input
                  type="number"
                  name="priceMin"
                  value={filters.priceMin}
                  onChange={handleFilterChange}
                  className={styles.input}
                  min="0"
                />
              </div>
              <div className={styles.priceInput}>
                <label className={styles.label}>Максимална цена</label>
                <input
                  type="number"
                  name="priceMax"
                  value={filters.priceMax}
                  onChange={handleFilterChange}
                  className={styles.input}
                  min="0"
                />
              </div>
            </div>
            
            <div className={styles.selectGroup}>
              <label className={styles.label}>Тип некретнине</label>
              <select
                name="propertyType"
                value={filters.propertyType}
                onChange={handleFilterChange}
                className={styles.select}
              >
                <option value="">Сви типови</option>
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.selectGroup}>
              <label className={styles.label}>Тип огласа</label>
              <select
                name="listingType"
                value={filters.listingType}
                onChange={handleFilterChange}
                className={styles.select}
              >
                <option value="">Сви типови</option>
                {listingTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.featuresGroup}>
              <label className={styles.label}>Карактеристике</label>
              <div className={styles.featuresContainer}>
                {availableFeatures.map(feature => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => handleFeatureToggle(feature)}
                    className={`${styles.featureButton} ${
                      filters.features.includes(feature) 
                        ? styles.featureActive 
                        : ''
                    }`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Претрага по локацији</label>
              <input
                type="text"
                name="searchTerm"
                value={filters.searchTerm}
                onChange={handleFilterChange}
                className={styles.input}
                placeholder="Унесите град или локацију"
              />
            </div>
          </div>
          
          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              className={styles.secondaryButton}
            >
              Откажи
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
            >
              Примени филтере
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AdvancedSearchModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSearchResults: PropTypes.func.isRequired,
  setIsLoading: PropTypes.func.isRequired,
};

export default AdvancedSearchModal;