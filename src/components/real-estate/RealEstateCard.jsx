import { Link } from 'react-router-dom';
import PropertyTypeBadge from './PropertyTypeBadge';

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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={mainImage}
          alt={property.title} // Restored alt text for accessibility
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Top Badges Container - With icon + text */}
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
      </div>
      
      {/* Content Section - With visible title */}
      <div className="p-4 flex-grow flex flex-col">
        {/* Property Title - Visible below image */}
        <h3 className="text-xl font-bold mb-2 line-clamp-2">
          {property.title}
        </h3>
        
        {/* Location */}
        <div className="flex items-center text-gray-600 text-sm mb-2">
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
          <div className="flex flex-wrap gap-1 mt-2">
            {property.features.slice(0, 4).map((feature, index) => (
              <span 
                key={index}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
              >
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
          to={`/properties/${property.propertyId}`}
          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
        >
          Више детаља
        </Link>
      </div>
    </div>
  );
}