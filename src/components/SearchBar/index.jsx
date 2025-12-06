import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

const SearchBar = ({ onSearchResults, setIsLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    propertyType: '',
    listingType: '',
    roomsMin: '',
    roomsMax: '',
    priceMin: '',
    priceMax: '',
    city: '',
    municipality: ''
  });
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchTerm.trim() && !hasAdvancedFilters()) {
      setError("Molimo unesite pojam za pretragu ili koristite napredne filtere");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();

      if (searchTerm.trim()) {
        searchParams.append('searchTerm', searchTerm.trim());
      }

      if (advancedFilters.propertyType) {
        searchParams.append('propertyType', advancedFilters.propertyType);
      }
      if (advancedFilters.listingType) {
        searchParams.append('listingType', advancedFilters.listingType);
      }
      if (advancedFilters.roomsMin) {
        searchParams.append('roomsMin', advancedFilters.roomsMin);
      }
      if (advancedFilters.roomsMax) {
        searchParams.append('roomsMax', advancedFilters.roomsMax);
      }
      if (advancedFilters.priceMin) {
        searchParams.append('priceMin', advancedFilters.priceMin);
      }
      if (advancedFilters.priceMax) {
        searchParams.append('priceMax', advancedFilters.priceMax);
      }
      if (advancedFilters.city) {
        searchParams.append('city', advancedFilters.city);
      }
      if (advancedFilters.municipality) {
        searchParams.append('municipality', advancedFilters.municipality);
      }

      const queryString = searchParams.toString();
      navigate(`/search?${queryString}`);

    } catch (error) {
      setError("Pretraga nije uspela. Molimo pokušajte ponovo.");
    } finally {
      setIsLoading(false);
    }
  };

  const hasAdvancedFilters = () => {
    return Object.values(advancedFilters).some(value => value !== '');
  };

  const handleAdvancedFilterChange = (e) => {
    const { name, value } = e.target;
    setAdvancedFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      propertyType: '',
      listingType: '',
      roomsMin: '',
      roomsMax: '',
      priceMin: '',
      priceMax: '',
      city: '',
      municipality: ''
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const propertyTypes = [
    { value: '', label: 'Svi tipovi' },
    { value: 'APARTMENT', label: 'Apartman' },
    { value: 'HOUSE', label: 'Kuća' },
    { value: 'CONDO', label: 'Kondominijum' },
    { value: 'LAND', label: 'Zemljište' },
    { value: 'GARAGE', label: 'Garaža' },
    { value: 'COMMERCIAL', label: 'Komercijalni' },
    { value: 'OTHER', label: 'Ostalo' }
  ];

  const listingTypes = [
    { value: '', label: 'Svi tipovi' },
    { value: 'FOR_SALE', label: 'Prodaja' },
    { value: 'FOR_RENT', label: 'Izdavanje' }
  ];

  const roomOptions = [
    { value: '', label: 'Bilo koji' },
    { value: '0.5', label: 'Garsonjera (0.5)' },
    { value: '1', label: '1 soba' },
    { value: '1.5', label: '1.5 soba' },
    { value: '2', label: '2 sobe' },
    { value: '2.5', label: '2.5 sobe' },
    { value: '3', label: '3 sobe' },
    { value: '3.5', label: '3.5 sobe' },
    { value: '4', label: '4 sobe' },
    { value: '5', label: '5+ soba' }
  ];

  return (
    <div className={styles.searchContainer}>
      {/* Main Search Bar */}
      <div className={styles.mainSearchBar}>
        <div className={styles.searchIconWrapper}>
          <FaSearch className={styles.searchIcon} />
        </div>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Pretražite po naslovu, opisu, gradu, adresi, opštini..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSearch}
          disabled={!searchTerm.trim() && !hasAdvancedFilters()}
          className={styles.searchButton}
        >
          Pretraži
        </button>
      </div>

      {/* Advanced Options Toggle */}
      <div className={styles.advancedToggleContainer}>
        <button
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className={styles.advancedToggleButton}
        >
          {showAdvancedOptions ? 'Sakrij dodatne filtere' : 'Prikaži dodatne filtere'}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`${styles.chevronIcon} ${showAdvancedOptions ? styles.rotated : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {hasAdvancedFilters() && (
          <button
            onClick={clearAdvancedFilters}
            className={styles.clearFiltersButton}
          >
            Obriši filtere
          </button>
        )}
      </div>

      {/* Advanced Search Options */}
      {showAdvancedOptions && (
        <div className={styles.advancedOptionsContainer}>
          <div className={styles.advancedFiltersGrid}>

            {/* Property Type */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                Tip nekretnine
              </label>
              <select
                name="propertyType"
                value={advancedFilters.propertyType}
                onChange={handleAdvancedFilterChange}
                className={styles.filterSelect}
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Listing Type */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                Tip oglasa
              </label>
              <select
                name="listingType"
                value={advancedFilters.listingType}
                onChange={handleAdvancedFilterChange}
                className={styles.filterSelect}
              >
                {listingTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Count */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                Broj soba
              </label>
              <select
                name="roomsMin"
                value={advancedFilters.roomsMin}
                onChange={handleAdvancedFilterChange}
                className={styles.filterSelect}
              >
                {roomOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                Cena do
              </label>
              <input
                type="number"
                name="priceMax"
                value={advancedFilters.priceMax}
                onChange={handleAdvancedFilterChange}
                className={styles.filterInput}
                placeholder="Maksimalna cena"
                min="0"
              />
            </div>

          </div>

          {/* Second Row of Advanced Filters */}
          <div className={styles.secondRowFilters}>

            {/* City */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                Grad
              </label>
              <input
                type="text"
                name="city"
                value={advancedFilters.city}
                onChange={handleAdvancedFilterChange}
                className={styles.filterInput}
                placeholder="Unesite grad"
              />
            </div>

            {/* Municipality */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                Opština
              </label>
              <input
                type="text"
                name="municipality"
                value={advancedFilters.municipality}
                onChange={handleAdvancedFilterChange}
                className={styles.filterInput}
                placeholder="Unesite opštinu"
              />
            </div>

          </div>
        </div>
      )}

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
    </div>
  );
};

SearchBar.propTypes = {
  onSearchResults: PropTypes.func.isRequired,
  setIsLoading: PropTypes.func.isRequired,
};

export default SearchBar;