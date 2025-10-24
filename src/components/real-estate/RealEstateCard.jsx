import { Link } from 'react-router-dom';
import PropertyTypeBadge from './PropertyTypeBadge';
import styles from './styles.module.css';

export default function RealEstateCard({ property }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price).replace('€', '') + ' €';
  };

  const mainImage = property.images?.length > 0 
    ? property.images[0] 
    : '/default-property.jpg';

  const listingTypeText = {
    SALE: 'For Sale',
    RENT: 'For Rent'
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
        />
        
        {/* Top Badges Container */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-2">
          <PropertyTypeBadge type={property.propertyType} />
          
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
        
        {/* Location */}
        <div className={styles.location}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{property.city}, {property.state}</span>
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