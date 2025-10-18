import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaTimes, FaPlus, FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import styles from './styles.module.css';
import { useNavigate } from 'react-router-dom';

const AdvancedSearchModal = ({ 
  isOpen, 
  onClose, 
  onSearchResults, 
  setIsLoading,
  onError 
}) => {
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    propertyType: '',
    listingType: '',
    features: [],
    searchTerm: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [availableFeatures, setAvailableFeatures] = useState([]);
  const [customFeature, setCustomFeature] = useState('');
  const [error, setError] = useState(null);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [featureWarning, setFeatureWarning] = useState('');
  const [featureSearch, setFeatureSearch] = useState('');

  const propertyTypes = ['APARTMENT', 'HOUSE', 'LAND', 'COMMERCIAL'];
  const listingTypes = ['SALE', 'RENT'];
  
  const navigate = useNavigate();

  // Common feature synonyms and variations
  const featureSynonyms = {
    'ac': ['air conditioning', 'air conditioner', 'ac', 'a/c'],
    'pool': ['swimming pool', 'pool', 'community pool', 'infinity pool'],
    'parking': ['parking', 'garage', 'carport'],
    'garden': ['garden', 'yard', 'backyard'],
    'fireplace': ['fireplace', 'fire place'],
    'gym': ['gym', 'fitness center', 'fitness'],
  };

  // Normalize feature name for matching
  const normalizeFeature = (feature) => {
    return feature.toLowerCase().trim();
  };

  // Find matching feature in database
  const findMatchingFeature = (userInput) => {
    const normalizedInput = normalizeFeature(userInput);
    
    // First, check if exact match exists
    const exactMatch = availableFeatures.find(f => 
      normalizeFeature(f) === normalizedInput
    );
    if (exactMatch) return exactMatch;
    
    // Check synonyms
    for (const [canonical, synonyms] of Object.entries(featureSynonyms)) {
      if (synonyms.includes(normalizedInput)) {
        const canonicalMatch = availableFeatures.find(f =>
          normalizeFeature(f) === canonical
        );
        if (canonicalMatch) return canonicalMatch;
      }
    }
    
    // Check partial matches
    const partialMatch = availableFeatures.find(f =>
      normalizeFeature(f).includes(normalizedInput) ||
      normalizedInput.includes(normalizeFeature(f))
    );
    
    return partialMatch || null;
  };

  // Filter features based on search
  const filteredFeatures = availableFeatures.filter(feature =>
    feature.toLowerCase().includes(featureSearch.toLowerCase())
  );

  const initialFeatureCount = 10;
  const visibleFeatures = showAllFeatures 
    ? filteredFeatures 
    : filteredFeatures.slice(0, initialFeatureCount);

  // Fetch available features from backend when modal opens
  useEffect(() => {
    const fetchFeatures = async () => {
      if (!isOpen) return;
      
      setIsLoadingFeatures(true);
      try {
        const response = await axios.get('http://localhost:8080/api/real-estates/features');
        console.log('Features response:', response.data);
        
        if (Array.isArray(response.data)) {
          setAvailableFeatures(response.data);
        } else {
          console.error('Expected array but got:', response.data);
          setAvailableFeatures(['Parking', 'Garden', 'Pool', 'Elevator', 'AC']);
        }
      } catch (error) {
        console.error('Failed to fetch features:', error);
        setAvailableFeatures(['Parking', 'Garden', 'Pool', 'Elevator', 'AC', 'Garage', 'Basement', 'Fireplace']);
        setError('Failed to load features. Using default features.');
      } finally {
        setIsLoadingFeatures(false);
      }
    };
    
    fetchFeatures();
  }, [isOpen]);

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

  const addCustomFeature = () => {
    if (customFeature.trim() && !filters.features.includes(customFeature.trim())) {
      const userInput = customFeature.trim();
      
      // Try to find a matching feature in the database
      const matchingFeature = findMatchingFeature(userInput);
      
      let featureToAdd = userInput;
      let warning = '';
      
      if (matchingFeature && matchingFeature !== userInput) {
        // Found a match with different name
        featureToAdd = matchingFeature;
        warning = `Додата карактеристика "${matchingFeature}" (пронађен сличан: "${userInput}")`;
      } else if (!matchingFeature) {
        // No match found
        warning = `"${userInput}" није пронађен у бази. Претрага може да не пронађе резултате.`;
      }
      
      if (warning) {
        setFeatureWarning(warning);
        setTimeout(() => setFeatureWarning(''), 5000);
      }
      
      setFilters(prev => ({
        ...prev,
        features: [...prev.features, featureToAdd]
      }));
      setCustomFeature('');
    }
  };

  const handleCustomFeatureKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomFeature();
    }
  };

  const removeFeature = (featureToRemove) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== featureToRemove)
    }));
    if (featureWarning.includes(featureToRemove)) {
      setFeatureWarning('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFeatureWarning('');

    try {
      const searchParams = new URLSearchParams();
      
      // Add all active filters with proper encoding
      if (filters.searchTerm.trim()) {
        searchParams.append('searchTerm', filters.searchTerm.trim());
      }
      if (filters.priceMin) {
        searchParams.append('priceMin', filters.priceMin);
      }
      if (filters.priceMax) {
        searchParams.append('priceMax', filters.priceMax);
      }
      if (filters.propertyType) {
        searchParams.append('propertyType', filters.propertyType);
      }
      if (filters.listingType) {
        searchParams.append('listingType', filters.listingType);
      }
      if (filters.city) {
        searchParams.append('city', filters.city);
      }
      if (filters.state) {
        searchParams.append('state', filters.state);
      }
      if (filters.zipCode) {
        searchParams.append('zipCode', filters.zipCode);
      }
      
      // Append features without brackets
      filters.features.forEach(f => {
        searchParams.append('features', f);
      });

      const queryString = searchParams.toString();
      console.log('Search query:', queryString);
      
      // Navigate to search page
      navigate(`/search?${queryString}`);
      onClose();

    } catch (error) {
      console.error("Search error:", error);
      const errorMsg = "Search failed. Please check your filters.";
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      priceMin: '',
      priceMax: '',
      propertyType: '',
      listingType: '',
      features: [],
      searchTerm: '',
      city: '',
      state: '',
      zipCode: ''
    });
    setCustomFeature('');
    setFeatureSearch('');
    setError(null);
    setFeatureWarning('');
    setShowAllFeatures(false);
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
        
        {featureWarning && (
          <div className={styles.warningMessage}>
            {featureWarning}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            {/* Price Range */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Цена</h3>
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
                    placeholder="мин."
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
                    placeholder="макс."
                  />
                </div>
              </div>
            </div>
            
            {/* Property Type */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Тип некретнине</h3>
              <div className={styles.selectGroup}>
                <select
                  name="propertyType"
                  value={filters.propertyType}
                  onChange={handleFilterChange}
                  className={styles.select}
                >
                  <option value="">Сви типови</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'APARTMENT' && 'Апартман'}
                      {type === 'HOUSE' && 'Кућа'}
                      {type === 'LAND' && 'Земљиште'}
                      {type === 'COMMERCIAL' && 'Комерцијални'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Listing Type */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Тип огласа</h3>
              <div className={styles.selectGroup}>
                <select
                  name="listingType"
                  value={filters.listingType}
                  onChange={handleFilterChange}
                  className={styles.select}
                >
                  <option value="">Сви типови</option>
                  {listingTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'SALE' && 'Продаја'}
                      {type === 'RENT' && 'Изнајмљивање'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Features */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Карактеристике</h3>
              
              {isLoadingFeatures ? (
                <div className={styles.loadingFeatures}>
                  Учитавање карактеристика...
                </div>
              ) : (
                <>
                  {/* Feature Search */}
                  <div className={styles.featureSearchContainer}>
                    <div className={styles.searchInputWrapper}>
                      <FaSearch className={styles.searchIcon} />
                      <input
                        type="text"
                        placeholder="Претражи карактеристике..."
                        value={featureSearch}
                        onChange={(e) => setFeatureSearch(e.target.value)}
                        className={styles.featureSearchInput}
                      />
                    </div>
                    {featureSearch && (
                      <button
                        type="button"
                        onClick={() => setFeatureSearch('')}
                        className={styles.clearSearchButton}
                      >
                        Обриши
                      </button>
                    )}
                  </div>
                  
                  {/* Features List */}
                  <div className={styles.featuresContainer}>
                    {Array.isArray(visibleFeatures) && visibleFeatures.map(feature => (
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
                        {filters.features.includes(feature) && ' ✓'}
                      </button>
                    ))}
                    
                    {filteredFeatures.length === 0 && featureSearch && (
                      <div className={styles.noResults}>
                        Није пронађена карактеристика "{featureSearch}"
                      </div>
                    )}
                  </div>
                  
                  {/* Show More/Less Button */}
                  {filteredFeatures.length > initialFeatureCount && (
                    <button
                      type="button"
                      onClick={() => setShowAllFeatures(!showAllFeatures)}
                      className={styles.showMoreButton}
                    >
                      {showAllFeatures ? (
                        <>
                          <FaChevronUp className={styles.buttonIcon} />
                          Прикажи мање
                        </>
                      ) : (
                        <>
                          <FaChevronDown className={styles.buttonIcon} />
                          Прикажи још {filteredFeatures.length - initialFeatureCount} карактеристика
                        </>
                      )}
                    </button>
                  )}
                  
                  {/* Custom Feature Input */}
                  <div className={styles.customFeature}>
                    <label className={styles.label}>Додај своју карактеристику</label>
                    <div className={styles.featureInputRow}>
                      <input
                        type="text"
                        value={customFeature}
                        onChange={(e) => setCustomFeature(e.target.value)}
                        className={styles.input}
                        placeholder="Унеси карактеристику која недостаје"
                        onKeyPress={handleCustomFeatureKeyPress}
                      />
                      <button
                        type="button"
                        onClick={addCustomFeature}
                        className={styles.addButton}
                        disabled={!customFeature.trim()}
                      >
                        <FaPlus />
                      </button>
                    </div>
                    <div className={styles.customFeatureHint}>
                      Ако не пронађете карактеристику, унесите је овде
                    </div>
                  </div>
                  
                  {/* Selected Features */}
                  {filters.features.length > 0 && (
                    <div className={styles.selectedFeatures}>
                      <label className={styles.label}>Изабране карактеристике:</label>
                      <div className={styles.selectedFeaturesList}>
                        {filters.features.map(feature => (
                          <span key={feature} className={styles.selectedFeatureTag}>
                            {feature}
                            <button
                              type="button"
                              onClick={() => removeFeature(feature)}
                              className={styles.removeFeatureButton}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Location */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Локација</h3>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Град</label>
                <input
                  type="text"
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  className={styles.input}
                  placeholder="Унесите град"
                />
              </div>

              <div className={styles.locationRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Држава</label>
                  <input
                    type="text"
                    name="state"
                    value={filters.state}
                    onChange={handleFilterChange}
                    className={styles.input}
                    placeholder="Држава"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Поштански број</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={filters.zipCode}
                    onChange={handleFilterChange}
                    className={styles.input}
                    placeholder="Поштански број"
                  />
                </div>
              </div>
            </div>

            {/* General Search */}
            <div className={styles.inputGroup}>
			  <label className={styles.label}>
			    Општа претрага
			    <span className={styles.hint}> (наслов, опис, град, адреса)</span>
			  </label>
			  <input
			    type="text"
			    name="searchTerm"
			    value={filters.searchTerm}
			    onChange={handleFilterChange}
			    className={styles.input}
			    placeholder="Унесите кључне речи, адресу, опис..."
			  />
			</div>
          </div>
          
          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={clearFilters}
              className={styles.clearButton}
            >
              Обриши све филтере
            </button>
            <div className={styles.actionButtons}>
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
                disabled={isLoadingFeatures}
              >
                {isLoadingFeatures ? 'Учитавање...' : 'Примени филтере'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

AdvancedSearchModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSearchResults: PropTypes.func,
  setIsLoading: PropTypes.func.isRequired,
  onError: PropTypes.func
};

AdvancedSearchModal.defaultProps = {
  onSearchResults: () => {},
  onError: () => {}
};

export default AdvancedSearchModal;