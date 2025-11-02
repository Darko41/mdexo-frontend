import { Link } from 'react-router-dom';
import PropertyTypeBadge from './PropertyTypeBadge';
import styles from './styles.module.css';
import { getPropertyImageUrl, handleImageError } from '../../utils/imageUtils';

export default function RealEstateCard({ property }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price).replace('€', '') + ' €';
  };

  // 🆕 NEW: Format room count display
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

  // 🆕 NEW: Format floor display
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

  // 🆕 NEW: Calculate property age
  const getPropertyAge = (constructionYear) => {
    if (!constructionYear) return null;
    const currentYear = new Date().getFullYear();
    return currentYear - constructionYear;
  };

  // 🆕 NEW: Format heating type for display
  const formatHeatingType = (heatingType) => {
    const heatingTypes = {
      CENTRAL: 'Централно',
      DISTRICT: 'Даљинско',
      ELECTRIC: 'Електрично',
      GAS: 'Гасно',
      HEAT_PUMP: 'Топлотна пумпа',
      SOLAR: 'Соларно',
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

  const mainImage = getPropertyImageUrl(property);

  const listingTypeText = {
    SALE: 'За продају',
    RENT: 'За изнајмљивање',
    FOR_SALE: 'За продају',
    FOR_RENT: 'За изнајмљивање',
    FOR_LEASE: 'За изнајмљивање'
  };

  // 🆕 NEW: Prepare additional info for PropertyTypeBadge
  const additionalInfo = {
    roomCount: property.roomCount,
    floor: property.floor,
    totalFloors: property.totalFloors,
    constructionYear: property.constructionYear,
    propertyAge: getPropertyAge(property.constructionYear),
    propertyCondition: property.propertyCondition,
    heatingType: property.heatingType
  };

  return (
    <div className={`${styles.card} h-full flex flex-col`}>
      {/* Image Section */}
      <Link 
        to={`/property/${property.propertyId}`}
        className={`${styles.imageContainer} h-48 block`}
      >
        <img
		  src={mainImage}
		  className={styles.image}
		  loading="lazy"
		  alt={property.title}
		  onError={(e) => handleImageError(e)}
		/>
        
        {/* Top Badges Container */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-2">
          <PropertyTypeBadge 
            type={property.propertyType} 
            additionalInfo={additionalInfo}
          />
          
          <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
            {listingTypeText[property.listingType]}
          </div>
        </div>
        
        {/* Price Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <span className="text-white font-bold text-lg block">
            {formatPrice(property.price)}
          </span>
        </div>
      </Link>
      
      {/* Content Section */}
      <div className={`${styles.content} flex-grow flex flex-col`}>
        {/* Property Title */}
        <Link 
          to={`/property/${property.propertyId}`}
          className={`${styles.title} hover:text-blue-600 transition-colors line-clamp-2`}
        >
          {property.title}
        </Link>
        
        {/* 🆕 NEW: Property Details Row */}
        <div className="flex flex-wrap gap-2 mb-2">
          {/* Room Count */}
          {property.roomCount && (
            <div className="flex items-center text-gray-700 text-sm bg-blue-50 px-2 py-1 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>{formatRoomCount(property.roomCount)}</span>
            </div>
          )}
          
          {/* Floor Information */}
          {(property.floor !== undefined && property.totalFloors !== undefined) && (
            <div className="flex items-center text-gray-700 text-sm bg-green-50 px-2 py-1 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>{formatFloor(property.floor, property.totalFloors)}</span>
            </div>
          )}
          
          {/* Construction Year */}
          {property.constructionYear && (
            <div className="flex items-center text-gray-700 text-sm bg-amber-50 px-2 py-1 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Год. {property.constructionYear}</span>
            </div>
          )}
        </div>
        
        {/* 🆕 NEW: Additional Property Details */}
        <div className="flex flex-wrap gap-1 mb-3">
          {/* Heating Type */}
          {property.heatingType && (
            <span className="inline-flex items-center bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded" title="Тип грејања">
              {formatHeatingType(property.heatingType)}
            </span>
          )}
          
          {/* Property Condition */}
          {property.propertyCondition && (
            <span className="inline-flex items-center bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded" title="Стање некретнине">
              {formatPropertyCondition(property.propertyCondition)}
            </span>
          )}
        </div>
        
        {/* Location - Updated to show municipality if available */}
        <div className={styles.location}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>
            {property.municipality || property.city}
            {property.city && property.municipality !== property.city && `, ${property.city}`}
            {property.state && `, ${property.state}`}
          </span>
        </div>
        
        {/* Size */}
        {property.sizeInSqMt && (
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v18H3z" />
            </svg>
            <span>{property.sizeInSqMt} m²</span>
          </div>
        )}
        
        {/* Features */}
        {property.features?.length > 0 && (
          <div className={styles.features}>
            {property.features.slice(0, 4).map((feature, index) => (
              <span key={index} className={styles.featureTag}>
                {feature}
              </span>
            ))}
            {property.features.length > 4 && (
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                +{property.features.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Footer Button */}
      <div className="p-4 border-t border-gray-100">
        <Link
          to={`/property/${property.propertyId}`}
          className={styles.detailsButton}
        >
          Више детаља
        </Link>
      </div>
    </div>
  );
}