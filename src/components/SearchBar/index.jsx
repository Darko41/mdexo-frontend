import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
      setError("Молимо унесите појам за претрагу или користите напредне филтере");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build search parameters
      const searchParams = new URLSearchParams();
      
      if (searchTerm.trim()) {
        searchParams.append('searchTerm', searchTerm.trim());
      }
      
      // Add advanced filters if they exist
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
	  setError("Претрага није успела. Молимо покушајте поново.");
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
    { value: '', label: 'Сви типови' },
    { value: 'APARTMENT', label: 'Апартман' },
    { value: 'HOUSE', label: 'Кућа' },
    { value: 'CONDO', label: 'Кондо' },
    { value: 'LAND', label: 'Земљиште' },
    { value: 'GARAGE', label: 'Гаража' },
    { value: 'COMMERCIAL', label: 'Комерцијални' },
    { value: 'OTHER', label: 'Остало' }
  ];

  const listingTypes = [
    { value: '', label: 'Сви типови' },
    { value: 'FOR_SALE', label: 'За продају' },
    { value: 'FOR_RENT', label: 'За изнајмљивање' }
  ];

  const roomOptions = [
    { value: '', label: 'Било који' },
    { value: '0.5', label: 'Студио (0.5)' },
    { value: '1', label: '1 соба' },
    { value: '1.5', label: '1.5 собе' },
    { value: '2', label: '2 собе' },
    { value: '2.5', label: '2.5 собе' },
    { value: '3', label: '3 собе' },
    { value: '3.5', label: '3.5 собе' },
    { value: '4', label: '4 собе' },
    { value: '5', label: '5+ соба' }
  ];

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto">
      {/* Main Search Bar */}
      <div className="flex h-12 w-full flex-row items-center rounded-xl border-2 border-blue-800 bg-white mb-2">
        <FaSearch className="ml-3 text-blue-800" />
        <input
          className="ml-2 w-full rounded-xl pl-2 text-left outline-none"
          type="text"
          placeholder="Куцајте за претрагу (наслов, опис, град, адреса, општина...)"
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
          className="px-4 h-full bg-blue-800 text-white rounded-r-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Тражи
        </button>
      </div>

      {/* Advanced Options Toggle */}
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
        >
          {showAdvancedOptions ? 'Сакриј напредне опције' : 'Прикажи напредне опције'}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 ml-1 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`}
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
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Обриши филтере
          </button>
        )}
      </div>

      {/* Advanced Search Options */}
      {showAdvancedOptions && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип некретнине
              </label>
              <select
                name="propertyType"
                value={advancedFilters.propertyType}
                onChange={handleAdvancedFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Listing Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип огласа
              </label>
              <select
                name="listingType"
                value={advancedFilters.listingType}
                onChange={handleAdvancedFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {listingTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Број соба
              </label>
              <select
                name="roomsMin"
                value={advancedFilters.roomsMin}
                onChange={handleAdvancedFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {roomOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Цена до
              </label>
              <input
                type="number"
                name="priceMax"
                value={advancedFilters.priceMax}
                onChange={handleAdvancedFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Максимална цена"
                min="0"
              />
            </div>

          </div>

          {/* Second Row of Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            
            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Град
              </label>
              <input
                type="text"
                name="city"
                value={advancedFilters.city}
                onChange={handleAdvancedFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Унесите град"
              />
            </div>

            {/* Municipality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Општина
              </label>
              <input
                type="text"
                name="municipality"
                value={advancedFilters.municipality}
                onChange={handleAdvancedFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Унесите општину"
              />
            </div>

          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-red-600 text-sm">
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