import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSlidersH, FaArrowLeft, FaHome, FaBuilding, FaFire, FaCalendarAlt, FaRulerCombined } from 'react-icons/fa';
import API from '../../utils/api/api';
import { RealEstateCard, RealEstateCardSkeleton } from '../../components/real-estate';
import AdvancedSearchModal from "../../components/AdvancedSearchModal";

export default function SearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({});
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

  useEffect(() => {
    // Parse query parameters from URL including new fields
    const params = new URLSearchParams(location.search);
    const searchData = {
      searchTerm: params.get('searchTerm') || '',
      priceMin: params.get('priceMin') || null,
      priceMax: params.get('priceMax') || null,
      propertyType: params.get('propertyType') || null,
      listingType: params.get('listingType') || null,
      features: params.getAll('features') || [],
      city: params.get('city') || null,
      state: params.get('state') || null,
      zipCode: params.get('zipCode') || null,
      
      // 🆕 NEW: Additional search parameters
      roomCount: params.get('roomCount') || null,
      roomCountMin: params.get('roomCountMin') || null,
      roomCountMax: params.get('roomCountMax') || null,
      floor: params.get('floor') || null,
      floorMin: params.get('floorMin') || null,
      floorMax: params.get('floorMax') || null,
      totalFloors: params.get('totalFloors') || null,
      totalFloorsMin: params.get('totalFloorsMin') || null,
      totalFloorsMax: params.get('totalFloorsMax') || null,
      constructionYear: params.get('constructionYear') || null,
      constructionYearMin: params.get('constructionYearMin') || null,
      constructionYearMax: params.get('constructionYearMax') || null,
      heatingType: params.get('heatingType') || null,
      propertyCondition: params.get('propertyCondition') || null,
      sizeInSqMt: params.get('sizeInSqMt') || null,
      sizeInSqMtMin: params.get('sizeInSqMtMin') || null,
      sizeInSqMtMax: params.get('sizeInSqMtMax') || null
    };
    setSearchParams(searchData);
    fetchSearchResults(searchData);
  }, [location.search]);

  const fetchSearchResults = async (params) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clean up params (remove null/empty values)
      const cleanParams = Object.fromEntries(
        Object.entries(params)
          .filter(([_, value]) => value !== null && value !== '' && !(Array.isArray(value) && value.length === 0))
          .map(([key, value]) => [key, Array.isArray(value) ? value : value.toString()])
      );

      // Using the API service
      const response = await API.realEstates.search(cleanParams);
      
      // Axios wraps the response data in response.data
      setResults(response.data.content || []);
    } catch (err) {
	  setError('Došlo je do greške pri pretrazi. Pokušajte ponovo.');
	} finally {
	  setLoading(false);
	}
	  };

  const handleAdvancedSearchResults = (results) => {
    setResults(results);
    setError(null);
  };

  const handleAdvancedSearchError = (error) => {
    setError("Došlo je do greške pri напредној претрази. Pokušajte ponovo.");
  };

  // 🆕 NEW: Format room count for display
  const formatRoomCount = (roomCount) => {
    if (!roomCount) return null;
    
    if (roomCount === 0.5) {
      return 'Студио';
    }
    
    if (Number.isInteger(roomCount)) {
      return `${roomCount} ${roomCount === 1 ? 'соба' : 'собе'}`;
    }
    
    return `${roomCount} собе`;
  };

  // 🆕 NEW: Format floor for display
  const formatFloor = (floor, totalFloors) => {
    if (floor === undefined || totalFloors === undefined) return null;
    
    if (floor === 0) {
      return 'Приземље';
    }
    
    if (floor < 0) {
      return `${Math.abs(floor)}. подрум`;
    }
    
    return `${floor}. спрат од ${totalFloors}`;
  };

  // 🆕 NEW: Format heating type for display
  const formatHeatingType = (heatingType) => {
    const heatingTypes = {
      CENTRAL: 'Централно грејање',
      DISTRICT: 'Даљинско грејање',
      ELECTRIC: 'Електрично грејање',
      GAS: 'Гасно грејање',
      HEAT_PUMP: 'Топлотна пумпа',
      SOLAR: 'Соларно грејање',
      WOOD_PELLET: 'Пелет',
      OIL: 'Нафта',
      NONE: 'Без грејања',
      OTHER: 'Друго'
    };
    
    return heatingTypes[heatingType] || null;
  };

  // 🆕 NEW: Format property condition for display
  const formatPropertyCondition = (condition) => {
    const conditions = {
      NEW_CONSTRUCTION: 'Нова градња',
      RENOVATED: 'Реновирано',
      MODERNIZED: 'Модернизовано',
      GOOD: 'Добро стање',
      NEEDS_RENOVATION: 'Потребно реновирање',
      ORIGINAL: 'Оригинално стање',
      LUXURY: 'Луксузно',
      SHELL: 'Груба градња',
      OTHER: 'Друго'
    };
    
    return conditions[condition] || null;
  };

  // 🆕 NEW: Calculate property age
  const getPropertyAge = (constructionYear) => {
    if (!constructionYear) return null;
    const currentYear = new Date().getFullYear();
    return currentYear - constructionYear;
  };

  // Helper function to display search criteria
  const getSearchCriteriaText = () => {
    const criteria = [];
    
    if (searchParams.searchTerm) {
      criteria.push(`"${searchParams.searchTerm}"`);
    }
    if (searchParams.propertyType) {
      criteria.push(`тип: ${searchParams.propertyType}`);
    }
    if (searchParams.listingType) {
      criteria.push(`оглас: ${searchParams.listingType}`);
    }
    if (searchParams.city) {
      criteria.push(`град: ${searchParams.city}`);
    }
    if (searchParams.features && searchParams.features.length > 0) {
      criteria.push(`карактеристике: ${searchParams.features.join(', ')}`);
    }
    if (searchParams.priceMin || searchParams.priceMax) {
      const priceRange = [];
      if (searchParams.priceMin) priceRange.push(`од ${searchParams.priceMin}€`);
      if (searchParams.priceMax) priceRange.push(`до ${searchParams.priceMax}€`);
      criteria.push(`цена: ${priceRange.join(' - ')}`);
    }

    // 🆕 NEW: Additional search criteria
    if (searchParams.roomCount) {
      criteria.push(`собе: ${formatRoomCount(parseFloat(searchParams.roomCount))}`);
    } else if (searchParams.roomCountMin || searchParams.roomCountMax) {
      const roomRange = [];
      if (searchParams.roomCountMin) roomRange.push(`од ${formatRoomCount(parseFloat(searchParams.roomCountMin))}`);
      if (searchParams.roomCountMax) roomRange.push(`до ${formatRoomCount(parseFloat(searchParams.roomCountMax))}`);
      criteria.push(`собе: ${roomRange.join(' - ')}`);
    }

    if (searchParams.floor || searchParams.floorMin || searchParams.floorMax) {
      const floorRange = [];
      if (searchParams.floor) {
        floorRange.push(`${searchParams.floor}. спрат`);
      } else {
        if (searchParams.floorMin) floorRange.push(`од ${searchParams.floorMin}. спрата`);
        if (searchParams.floorMax) floorRange.push(`до ${searchParams.floorMax}. спрата`);
      }
      if (floorRange.length > 0) {
        criteria.push(`спрат: ${floorRange.join(' - ')}`);
      }
    }

    if (searchParams.constructionYear || searchParams.constructionYearMin || searchParams.constructionYearMax) {
      const yearRange = [];
      if (searchParams.constructionYear) {
        yearRange.push(`${searchParams.constructionYear}. год`);
      } else {
        if (searchParams.constructionYearMin) yearRange.push(`од ${searchParams.constructionYearMin}. год`);
        if (searchParams.constructionYearMax) yearRange.push(`до ${searchParams.constructionYearMax}. год`);
      }
      if (yearRange.length > 0) {
        criteria.push(`година: ${yearRange.join(' - ')}`);
      }
    }

    if (searchParams.heatingType) {
      criteria.push(`грејање: ${formatHeatingType(searchParams.heatingType)}`);
    }

    if (searchParams.propertyCondition) {
      criteria.push(`стање: ${formatPropertyCondition(searchParams.propertyCondition)}`);
    }

    if (searchParams.sizeInSqMt || searchParams.sizeInSqMtMin || searchParams.sizeInSqMtMax) {
      const sizeRange = [];
      if (searchParams.sizeInSqMt) {
        sizeRange.push(`${searchParams.sizeInSqMt} m²`);
      } else {
        if (searchParams.sizeInSqMtMin) sizeRange.push(`од ${searchParams.sizeInSqMtMin} m²`);
        if (searchParams.sizeInSqMtMax) sizeRange.push(`до ${searchParams.sizeInSqMtMax} m²`);
      }
      if (sizeRange.length > 0) {
        criteria.push(`површина: ${sizeRange.join(' - ')}`);
      }
    }

    return criteria.length > 0 ? criteria.join(' • ') : 'Сви огласи';
  };

  // 🆕 NEW: Enhanced RealEstateCard wrapper to pass additional props
  const EnhancedRealEstateCard = ({ property, onClick }) => {
    return (
      <RealEstateCard 
        property={property} 
        onClick={onClick}
        // Pass additional formatting functions as props if needed
        formatRoomCount={formatRoomCount}
        formatFloor={formatFloor}
        formatHeatingType={formatHeatingType}
        formatPropertyCondition={formatPropertyCondition}
        getPropertyAge={getPropertyAge}
      />
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4 text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mr-4"
          >
            Покушај поново
          </button>
          <button 
            onClick={() => navigate('/')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Назад на почетну
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Назад на почетну
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Резултати претраге
              </h1>
              <p className="text-gray-600 text-lg">
                {getSearchCriteriaText()}
              </p>
            </div>
            
            <button
              onClick={() => setIsAdvancedSearchOpen(true)}
              className="flex items-center justify-center bg-white text-blue-600 hover:text-blue-800 text-sm px-4 py-2 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors w-full md:w-auto"
            >
              <FaSlidersH className="mr-2" />
              Напредна претрага
            </button>
          </div>
        </div>

        {/* Results Count */}
        {!loading && results.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-600">
              Пронађено <span className="font-semibold text-blue-600">{results.length}</span> некретнин{results.length === 1 ? 'а' : 'е'}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <RealEstateCardSkeleton key={i} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <FaHome className="mx-auto text-gray-400 text-6xl mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Нема резултата
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Нема некретнина које одговарају вашим критеријумима претраге. 
              Покушајте да измените критеријуме или користите напредну претрагу.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => navigate('/')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Назад на почетну
              </button>
              <button 
                onClick={() => setIsAdvancedSearchOpen(true)}
                className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Напредна претрага
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map(property => (
              <EnhancedRealEstateCard 
                key={property.propertyId || property.id} 
                property={property} 
                onClick={() => navigate(`/property/${property.propertyId || property.id}`)}
              />
            ))}
          </div>
        )}

        {/* Advanced Search Modal */}
        <AdvancedSearchModal
          isOpen={isAdvancedSearchOpen}
          onClose={() => setIsAdvancedSearchOpen(false)}
          onSearchResults={handleAdvancedSearchResults}
          onError={handleAdvancedSearchError}
          setIsLoading={setLoading}
          // 🆕 NEW: Pass additional search parameters to modal
          initialSearchParams={searchParams}
        />
      </div>
    </div>
  );
}