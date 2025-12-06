import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaTimes, FaPlus, FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa';
import API from '../../utils/api/api';
import styles from './styles.module.css';
import { useNavigate } from 'react-router-dom';

const AdvancedSearchModal = ({ 
  isOpen = false, 
  onClose = () => {}, 
  onSearchResults = () => {}, 
  setIsLoading = () => {},
  onError = () => {} 
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
    zipCode: '',
    roomsMin: '',
    roomsMax: '',
    floorMin: '',
    floorMax: '',
    constructionYearMin: '',
    constructionYearMax: '',
    heatingType: '',
    propertyCondition: '',
    municipality: ''
  });

  const [availableFeatures, setAvailableFeatures] = useState([]);
  const [customFeature, setCustomFeature] = useState('');
  const [error, setError] = useState(null);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [featureWarning, setFeatureWarning] = useState('');
  const [featureSearch, setFeatureSearch] = useState('');

  const propertyTypes = ['APARTMENT', 'HOUSE', 'CONDO', 'LAND', 'GARRAGE', 'COMMERCIAL', 'OTHER'];
  const listingTypes = ['SALE', 'RENT'];
  const heatingTypes = ['CENTRAL', 'DISTRICT', 'ELECTRIC', 'GAS', 'HEAT_PUMP', 'SOLAR', 'WOOD_PELLET', 'OIL', 'NONE', 'OTHER'];
  const propertyConditions = ['NEW_CONSTRUCTION', 'RENOVATED', 'MODERNIZED', 'GOOD', 'NEEDS_RENOVATION', 'ORIGINAL', 'LUXURY', 'SHELL', 'OTHER'];

  const navigate = useNavigate();

  const featureSynonyms = {
    'ac': ['air conditioning', 'air conditioner', 'ac', 'a/c'],
    'pool': ['swimming pool', 'pool', 'community pool', 'infinity pool'],
    'parking': ['parking', 'garage', 'carport'],
    'garden': ['garden', 'yard', 'backyard'],
    'fireplace': ['fireplace', 'fire place'],
    'gym': ['gym', 'fitness center', 'fitness'],
  };

  const roomOptions = [
    { value: 0.5, label: 'Студио (0.5)' },
    { value: 1, label: '1 соба' },
    { value: 1.5, label: '1.5 собе' },
    { value: 2, label: '2 собе' },
    { value: 2.5, label: '2.5 собе' },
    { value: 3, label: '3 собе' },
    { value: 3.5, label: '3.5 собе' },
    { value: 4, label: '4 собе' },
    { value: 4.5, label: '4.5 собе' },
    { value: 5, label: '5+ соба' }
  ];

  const ageRanges = [
    { min: 2020, max: 2030, label: 'Нова градња (0-3 године)' },
    { min: 2010, max: 2019, label: 'Модерна (4-13 година)' },
    { min: 1990, max: 2009, label: 'Скорашња (14-33 године)' },
    { min: 1970, max: 1989, label: 'Старија (34-53 године)' },
    { min: 1500, max: 1969, label: 'Историјска (54+ година)' }
  ];

  const normalizeFeature = (feature) => {
    return feature.toLowerCase().trim();
  };

  const findMatchingFeature = (userInput) => {
    const normalizedInput = normalizeFeature(userInput);

    const exactMatch = availableFeatures.find(f =>
      normalizeFeature(f) === normalizedInput
    );
    if (exactMatch) return exactMatch;

    for (const [canonical, synonyms] of Object.entries(featureSynonyms)) {
      if (synonyms.includes(normalizedInput)) {
        const canonicalMatch = availableFeatures.find(f =>
          normalizeFeature(f) === canonical
        );
        if (canonicalMatch) return canonicalMatch;
      }
    }

    const partialMatch = availableFeatures.find(f =>
      normalizeFeature(f).includes(normalizedInput) ||
      normalizedInput.includes(normalizeFeature(f))
    );

    return partialMatch || null;
  };

  const filteredFeatures = availableFeatures.filter(feature =>
    feature.toLowerCase().includes(featureSearch.toLowerCase())
  );

  const initialFeatureCount = 10;
  const visibleFeatures = showAllFeatures
    ? filteredFeatures
    : filteredFeatures.slice(0, initialFeatureCount);

  useEffect(() => {
    const fetchFeatures = async () => {
      if (!isOpen) return;

      setIsLoadingFeatures(true);
      try {
        const response = await API.realEstates.features();

        if (Array.isArray(response.data)) {
          setAvailableFeatures(response.data);
        } else {
          setAvailableFeatures(['Parking', 'Garden', 'Pool', 'Elevator', 'AC']);
        }
      } catch (error) {
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

  const handleAgeRangeChange = (range) => {
    setFilters(prev => ({
      ...prev,
      constructionYearMin: range.min,
      constructionYearMax: range.max
    }));
  };

  const handleRoomCountChange = (roomCount) => {
    setFilters(prev => ({
      ...prev,
      roomsMin: roomCount,
      roomsMax: roomCount === 5 ? 20 : roomCount
    }));
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

      const matchingFeature = findMatchingFeature(userInput);

      let featureToAdd = userInput;
      let warning = '';

      if (matchingFeature && matchingFeature !== userInput) {
        featureToAdd = matchingFeature;
        warning = `Додата карактеристика "${matchingFeature}" (пронађен сличан: "${userInput}")`;
      } else if (!matchingFeature) {
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
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFeatureWarning('');

    try {
      const searchParams = new URLSearchParams();

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

      if (filters.roomsMin) {
        searchParams.append('roomsMin', filters.roomsMin);
      }
      if (filters.roomsMax) {
        searchParams.append('roomsMax', filters.roomsMax);
      }
      if (filters.floorMin) {
        searchParams.append('floorMin', filters.floorMin);
      }
      if (filters.floorMax) {
        searchParams.append('floorMax', filters.floorMax);
      }
      if (filters.constructionYearMin) {
        searchParams.append('constructionYearMin', filters.constructionYearMin);
      }
      if (filters.constructionYearMax) {
        searchParams.append('constructionYearMax', filters.constructionYearMax);
      }
      if (filters.heatingType) {
        searchParams.append('heatingTypes', filters.heatingType);
      }
      if (filters.propertyCondition) {
        searchParams.append('propertyConditions', filters.propertyCondition);
      }
      if (filters.municipality) {
        searchParams.append('municipality', filters.municipality);
      }

      filters.features.forEach(f => {
        searchParams.append('features', f);
      });

      const queryString = searchParams.toString();

      navigate(`/search?${queryString}`);
      onClose();

    } catch (error) {
      const errorMsg = "Search failed. Please check your filters.";
      setError(errorMsg);
      onError(errorMsg);
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
      zipCode: '',
      roomsMin: '',
      roomsMax: '',
      floorMin: '',
      floorMax: '',
      constructionYearMin: '',
      constructionYearMax: '',
      heatingType: '',
      propertyCondition: '',
      municipality: ''
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

        <div className={styles.scrollableContent}>
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

              {/* Room Count */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Број соба</h3>
                <div className={styles.roomCountSection}>
                  <div className={styles.roomCountButtons}>
                    {roomOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleRoomCountChange(option.value)}
                        className={`${styles.roomCountButton} ${
                          filters.roomsMin === option.value ? styles.roomCountActive : ''
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <div className={styles.roomRangeInputs}>
                    <div className={styles.rangeInput}>
                      <label className={styles.label}>Од</label>
                      <input
                        type="number"
                        name="roomsMin"
                        value={filters.roomsMin}
                        onChange={handleFilterChange}
                        className={styles.input}
                        min="0.5"
                        max="20"
                        step="0.5"
                        placeholder="0.5"
                      />
                    </div>
                    <div className={styles.rangeInput}>
                      <label className={styles.label}>До</label>
                      <input
                        type="number"
                        name="roomsMax"
                        value={filters.roomsMax}
                        onChange={handleFilterChange}
                        className={styles.input}
                        min="0.5"
                        max="20"
                        step="0.5"
                        placeholder="20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floor Information */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Спрат</h3>
                <div className={styles.floorRange}>
                  <div className={styles.rangeInput}>
                    <label className={styles.label}>Најнижи спрат</label>
                    <input
                      type="number"
                      name="floorMin"
                      value={filters.floorMin}
                      onChange={handleFilterChange}
                      className={styles.input}
                      min="-5"
                      max="200"
                      placeholder="-5 (подрум)"
                    />
                  </div>
                  <div className={styles.rangeInput}>
                    <label className={styles.label}>Највиши спрат</label>
                    <input
                      type="number"
                      name="floorMax"
                      value={filters.floorMax}
                      onChange={handleFilterChange}
                      className={styles.input}
                      min="0"
                      max="200"
                      placeholder="200"
                    />
                  </div>
                </div>
              </div>

              {/* Construction Year & Age */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Година изградње & Старост</h3>
                <div className={styles.ageSection}>
                  <div className={styles.ageRangeButtons}>
                    {ageRanges.map((range, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleAgeRangeChange(range)}
                        className={`${styles.ageRangeButton} ${
                          filters.constructionYearMin === range.min ? styles.ageRangeActive : ''
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                  <div className={styles.yearRangeInputs}>
                    <div className={styles.rangeInput}>
                      <label className={styles.label}>Од године</label>
                      <input
                        type="number"
                        name="constructionYearMin"
                        value={filters.constructionYearMin}
                        onChange={handleFilterChange}
                        className={styles.input}
                        min="1500"
                        max="2030"
                        placeholder="1500"
                      />
                    </div>
                    <div className={styles.rangeInput}>
                      <label className={styles.label}>До године</label>
                      <input
                        type="number"
                        name="constructionYearMax"
                        value={filters.constructionYearMax}
                        onChange={handleFilterChange}
                        className={styles.input}
                        min="1500"
                        max="2030"
                        placeholder="2030"
                      />
                    </div>
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
                        {type === 'CONDO' && 'Кондо'}
                        {type === 'LAND' && 'Земљиште'}
                        {type === 'GARRAGE' && 'Гаража'}
                        {type === 'COMMERCIAL' && 'Комерцијални'}
                        {type === 'OTHER' && 'Остало'}
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

              {/* Heating Type */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Грејање</h3>
                <div className={styles.selectGroup}>
                  <select
                    name="heatingType"
                    value={filters.heatingType}
                    onChange={handleFilterChange}
                    className={styles.select}
                  >
                    <option value="">Сви типови грејања</option>
                    {heatingTypes.map(type => (
                      <option key={type} value={type}>
                        {type === 'CENTRAL' && 'Централно грејање'}
                        {type === 'DISTRICT' && 'Даљинско грејање'}
                        {type === 'ELECTRIC' && 'Електрично грејање'}
                        {type === 'GAS' && 'Гасно грејање'}
                        {type === 'HEAT_PUMP' && 'Топлотна пумпа'}
                        {type === 'SOLAR' && 'Соларно грејање'}
                        {type === 'WOOD_PELLET' && 'Пелет'}
                        {type === 'OIL' && 'Нафта'}
                        {type === 'NONE' && 'Без грејања'}
                        {type === 'OTHER' && 'Остало'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Property Condition */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Стање некретнине</h3>
                <div className={styles.selectGroup}>
                  <select
                    name="propertyCondition"
                    value={filters.propertyCondition}
                    onChange={handleFilterChange}
                    className={styles.select}
                  >
                    <option value="">Сва стања</option>
                    {propertyConditions.map(condition => (
                      <option key={condition} value={condition}>
                        {condition === 'NEW_CONSTRUCTION' && 'Нова градња'}
                        {condition === 'RENOVATED' && 'Реновирано'}
                        {condition === 'MODERNIZED' && 'Модернизовано'}
                        {condition === 'GOOD' && 'Добро стање'}
                        {condition === 'NEEDS_RENOVATION' && 'Потребно реновирање'}
                        {condition === 'ORIGINAL' && 'Оригинално стање'}
                        {condition === 'LUXURY' && 'Луксузно'}
                        {condition === 'SHELL' && 'Груба градња'}
                        {condition === 'OTHER' && 'Остало'}
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
                      <br/>
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

                {/* Municipality for privacy */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Општина</label>
                  <input
                    type="text"
                    name="municipality"
                    value={filters.municipality}
                    onChange={handleFilterChange}
                    className={styles.input}
                    placeholder="Унесите општину"
                  />
                </div>

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
                  placeholder="Унесите кључне речи"
                />
              </div>
            </div>
          </form>
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
              type="button"
              onClick={handleSubmit}
              className={styles.primaryButton}
              disabled={isLoadingFeatures}
            >
              {isLoadingFeatures ? 'Учитавање...' : 'Примени филтере'}
            </button>
          </div>
        </div>
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

export default AdvancedSearchModal;