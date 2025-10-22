import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/api/api';
import { 
  FaMapMarkerAlt, 
  FaArrowLeft, 
  FaRulerCombined,
  FaUser,
  FaUsers
} from 'react-icons/fa';
import { GiCommercialAirplane } from 'react-icons/gi';
import { MdApartment, MdLandscape } from 'react-icons/md';
import { BsHouseDoor, BsCalendarDate } from 'react-icons/bs';

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  useEffect(() => {
    const fetchProperty = async () => {
		
		if (!id || id === 'undefined') {
	      setError('Invalid property ID');
	      setLoading(false);
	      return;
	    }
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching property with ID:', id);
        
        const response = await API.realEstates.getById(id);
        
        console.log('✅ API Response:', response);
        console.log('✅ Response data:', response.data);
        
        if (!response.data) {
          throw new Error('Property not found');
        }
        
        setProperty(response.data);
      } catch (err) {
        console.error('❌ Failed to fetch property:', {
          url: err.config?.url,
          status: err.response?.status,
          data: err.response?.data,
          fullError: err
        });
        setError(err.response?.data?.message || 'Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const getPropertyTypeIcon = () => {
    if (!property) return null;
    
    switch(property.propertyType) {
      case 'APARTMENT': return <MdApartment className="mr-1" />;
      case 'HOUSE': return <BsHouseDoor className="mr-1" />;
      case 'LAND': return <MdLandscape className="mr-1" />;
      case 'COMMERCIAL': return <GiCommercialAirplane className="mr-1" />;
      default: return null;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price).replace('€', '') + ' €';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-12">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Property</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Property not found state
  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
      >
        <FaArrowLeft className="mr-2" />
        Back to Results
      </button>

      {/* Property Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
        <div className="flex items-center text-gray-600">
          <FaMapMarkerAlt className="mr-1" />
          <span>{property.address}, {property.city}, {property.state} {property.zipCode}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            {getPropertyTypeIcon()}
            {property.propertyType?.toLowerCase().replace(/_/g, ' ') || 'Unknown'}
          </span>
          <span className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
            {property.listingType === 'FOR_SALE' ? 'For Sale' : 'For Rent'}
          </span>
          {property.sizeInSqMt && (
            <span className="inline-flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">
              <FaRulerCombined className="mr-1" />
              {property.sizeInSqMt} m²
            </span>
          )}
        </div>
      </div>

      {/* Image Gallery */}
      {property.images && property.images.length > 0 ? (
        <div className="mb-8">
          <div className="relative h-96 rounded-lg overflow-hidden mb-4">
            <img
              src={property.images[currentImageIndex]}
              alt={`${property.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Navigation arrows */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(prev => 
                    prev === 0 ? property.images.length - 1 : prev - 1
                  )}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                >
                  ‹
                </button>
                <button
                  onClick={() => setCurrentImageIndex(prev => 
                    prev === property.images.length - 1 ? 0 : prev + 1
                  )}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                >
                  ›
                </button>
              </>
            )}
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {property.images.length}
            </div>
          </div>
          
          {/* Thumbnail strip */}
          {property.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                    currentImageIndex === index ? 'border-blue-500 scale-105' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8 bg-gray-100 rounded-lg h-64 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>No images available</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Price Section */}
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {property.listingType === 'FOR_SALE' ? 'Sale Price' : 'Monthly Rent'}:{' '}
              <span className="text-blue-600">
                {formatPrice(property.price)}
              </span>
            </h2>
            {property.listingType === 'FOR_RENT' && (
              <p className="text-gray-600">Security deposit may be required</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {property.description || 'No description provided.'}
            </p>
          </div>

          {/* Features */}
          {property.features?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Features & Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Owner Information */}
          {property.ownerEmail && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h2 className="text-2xl font-bold mb-4">Property Owner</h2>
              <div className="flex items-center">
                <FaUser className="text-gray-500 mr-3 w-5" />
                <div>
                  <p className="font-medium">{property.ownerEmail}</p>
                  <p className="text-gray-600 text-sm">Contact for more information</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Key Details */}
        <div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Property Details</h2>
            
            <div className="space-y-4">
              {/* Basic Details */}
              <div className="flex items-center">
                {getPropertyTypeIcon()}
                <div>
                  <p className="text-sm text-gray-500">Property Type</p>
                  <p className="font-medium">{property.propertyType?.toLowerCase().replace(/_/g, ' ') || 'Unknown'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <svg className="text-gray-500 mr-3 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Listing Type</p>
                  <p className="font-medium">{property.listingType === 'FOR_SALE' ? 'For Sale' : 'For Rent'}</p>
                </div>
              </div>

              {/* Size */}
              {property.sizeInSqMt && (
                <div className="flex items-center">
                  <FaRulerCombined className="text-gray-500 mr-3 w-5" />
                  <div>
                    <p className="text-sm text-gray-500">Size</p>
                    <p className="font-medium">{property.sizeInSqMt} m²</p>
                  </div>
                </div>
              )}
              
              {/* Date Information */}
              <div className="flex items-center">
                <BsCalendarDate className="text-gray-500 mr-3 w-5" />
                <div>
                  <p className="text-sm text-gray-500">Listed On</p>
                  <p className="font-medium">{formatDate(property.createdAt)}</p>
                </div>
              </div>

              {property.updatedAt && (
                <div className="flex items-center">
                  <BsCalendarDate className="text-gray-500 mr-3 w-5" />
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">{formatDate(property.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Contact Button */}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
              Contact Agent
            </button>

            {/* Schedule Tour Button */}
            <button className="w-full mt-3 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3 px-4 rounded-lg transition-colors">
              Schedule a Tour
            </button>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="mt-12 bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
        <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="font-medium">Property Location</p>
          <p>{property.address}, {property.city}, {property.state} {property.zipCode}</p>
          <p className="mt-2 text-sm">Map integration would display here</p>
        </div>
      </div>
    </div>
  );
}