import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/api/api';
import { 
  FaMapMarkerAlt, 
  FaArrowLeft, 
  FaRulerCombined,
  FaUser,
  FaUsers,
  FaExpand,
  FaChevronLeft,
  FaChevronRight
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Gallery slider state
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  const animationIDRef = useRef(null);
  const sliderRef = useRef(null);

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

  // Touch and mouse event handlers for gallery swipe
  const getPositionX = useCallback((e) => {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
  }, []);

  const handleStart = useCallback((e) => {
    if (!property?.images || property.images.length <= 1) return;
    
    setIsDragging(true);
    setStartPos(getPositionX(e));
    setPrevTranslate(currentTranslate);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grabbing';
      sliderRef.current.style.transition = 'none';
    }
  }, [getPositionX, currentTranslate, property?.images]);

  const handleMove = useCallback((e) => {
    if (!isDragging || !property?.images || property.images.length <= 1) return;
    
    e.preventDefault();
    
    const currentPosition = getPositionX(e);
    const diff = currentPosition - startPos;
    
    const maxTranslate = 100;
    const boundedDiff = Math.max(Math.min(diff, maxTranslate), -maxTranslate);
    
    setCurrentTranslate(prevTranslate + boundedDiff);
  }, [isDragging, getPositionX, startPos, prevTranslate, property?.images]);

  const handleEnd = useCallback(() => {
    if (!isDragging || !property?.images || property.images.length <= 1) return;
    setIsDragging(false);
    
    const movedBy = currentTranslate - prevTranslate;
    const threshold = 50;

    if (movedBy < -threshold) {
      // Swipe left - go to next
      setCurrentImageIndex(prev => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    } else if (movedBy > threshold) {
      // Swipe right - go to previous
      setCurrentImageIndex(prev => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }

    // Reset translate
    setCurrentTranslate(0);
    setPrevTranslate(0);

    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
      sliderRef.current.style.transition = 'transform 0.3s ease-out';
    }
  }, [isDragging, currentTranslate, prevTranslate, property?.images]);

  // Animation for smooth dragging
  const animation = useCallback(() => {
    if (sliderRef.current && isDragging) {
      sliderRef.current.style.transform = `translateX(calc(${-currentImageIndex * 100}% + ${currentTranslate}px))`;
      animationIDRef.current = requestAnimationFrame(animation);
    }
  }, [currentImageIndex, currentTranslate, isDragging]);

  // Handle animation frame
  useEffect(() => {
    if (isDragging) {
      animationIDRef.current = requestAnimationFrame(animation);
    } else {
      if (animationIDRef.current) {
        cancelAnimationFrame(animationIDRef.current);
        animationIDRef.current = null;
      }
    }

    return () => {
      if (animationIDRef.current) {
        cancelAnimationFrame(animationIDRef.current);
      }
    };
  }, [isDragging, animation]);

  // Event listeners for gallery
  useEffect(() => {
    if (!sliderRef.current || !property?.images || property.images.length <= 1) return;

    const slider = sliderRef.current;

    // Add event listeners
    slider.addEventListener('touchstart', handleStart, { passive: false });
    slider.addEventListener('touchmove', handleMove, { passive: false });
    slider.addEventListener('touchend', handleEnd);

    slider.addEventListener('mousedown', handleStart);
    slider.addEventListener('mousemove', handleMove);
    slider.addEventListener('mouseup', handleEnd);
    slider.addEventListener('mouseleave', handleEnd);

    // Prevent image drag
    const images = slider.querySelectorAll('img');
    images.forEach(img => {
      img.addEventListener('dragstart', (e) => e.preventDefault());
    });

    return () => {
      slider.removeEventListener('touchstart', handleStart);
      slider.removeEventListener('touchmove', handleMove);
      slider.removeEventListener('touchend', handleEnd);

      slider.removeEventListener('mousedown', handleStart);
      slider.removeEventListener('mousemove', handleMove);
      slider.removeEventListener('mouseup', handleEnd);
      slider.removeEventListener('mouseleave', handleEnd);
    };
  }, [property?.images, handleStart, handleMove, handleEnd]);

  // Keyboard navigation for fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isFullscreen || !property?.images) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          goToPrev();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          setIsFullscreen(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, property?.images]);

  const goToNext = useCallback(() => {
    if (!property?.images) return;
    setCurrentImageIndex(prev => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  }, [property?.images]);

  const goToPrev = useCallback(() => {
    if (!property?.images) return;
    setCurrentImageIndex(prev => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  }, [property?.images]);

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

  // Enhanced Image Gallery Component
  const ImageGallery = () => {
    if (!property.images || property.images.length === 0) {
      return (
        <div className="mb-8 bg-gray-100 rounded-2xl h-80 md:h-96 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium">No images available</p>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-8">
        {/* Main Image Slider */}
        <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden bg-gray-100 mb-4">
          <div
            ref={sliderRef}
            className="flex h-full cursor-grab active:cursor-grabbing transition-transform duration-300"
            style={{
              transform: `translateX(calc(${-currentImageIndex * 100}% + ${currentTranslate}px))`,
              transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {property.images.map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full h-full"
              >
                <img
                  src={image}
                  alt={`${property.title} - Image ${index + 1}`}
                  className="w-full h-full object-cover select-none"
                  draggable="false"
                  onError={(e) => {
                    e.target.src = '/default-property.jpg';
                  }}
                />
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {property.images.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
                aria-label="Previous image"
              >
                <FaChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
                aria-label="Next image"
              >
                <FaChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
            {currentImageIndex + 1} / {property.images.length}
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
            aria-label="View fullscreen"
          >
            <FaExpand className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnail Strip */}
        {property.images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-4 px-1 -mx-1">
            {property.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  currentImageIndex === index 
                    ? 'border-blue-500 scale-105 shadow-md' 
                    : 'border-gray-300 hover:border-gray-400 hover:scale-102'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-property.jpg';
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Fullscreen Gallery Modal
  const FullscreenGallery = () => {
    if (!isFullscreen) return null;

    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        {/* Close Button */}
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 text-white p-3 rounded-full hover:bg-white/20 transition-colors z-10"
          aria-label="Close fullscreen"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Main Image */}
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={property.images[currentImageIndex]}
            alt={`${property.title} - Image ${currentImageIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />

          {/* Navigation Arrows */}
          {property.images.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-4 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Previous image"
              >
                <FaChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-4 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Next image"
              >
                <FaChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-base font-medium">
            {currentImageIndex + 1} / {property.images.length}
          </div>
        </div>

        {/* Thumbnail Strip */}
        {property.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 overflow-x-auto max-w-90vw">
            {property.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border transition-all ${
                  currentImageIndex === index ? 'border-white scale-110' : 'border-gray-500'
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
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors group"
      >
        <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Results
      </button>

      {/* Property Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{property.title}</h1>
        <div className="flex items-center text-gray-600 mb-4">
          <FaMapMarkerAlt className="mr-2 text-red-500" />
          <span className="text-lg">{property.address}, {property.city}, {property.state} {property.zipCode}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
            {getPropertyTypeIcon()}
            {property.propertyType?.toLowerCase().replace(/_/g, ' ') || 'Unknown'}
          </span>
          <span className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
            {property.listingType === 'FOR_SALE' ? 'For Sale' : 'For Rent'}
          </span>
          {property.sizeInSqMt && (
            <span className="inline-flex items-center bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold">
              <FaRulerCombined className="mr-1" />
              {property.sizeInSqMt} m²
            </span>
          )}
        </div>
      </div>

      {/* Image Gallery */}
      <ImageGallery />

      {/* Fullscreen Gallery Modal */}
      <FullscreenGallery />

      {/* Rest of your existing content remains the same */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Price Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl mb-6 border border-blue-100">
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
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {property.description || 'No description provided.'}
            </p>
          </div>

          {/* Features */}
          {property.features?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Features & Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.features.map((feature, index) => (
                  <div key={index} className="flex items-center group">
                    <svg className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Owner Information */}
          {property.ownerEmail && (
            <div className="bg-gray-50 p-6 rounded-2xl mb-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Property Owner</h2>
              <div className="flex items-center">
                <FaUser className="text-gray-500 mr-4 w-6 h-6" />
                <div>
                  <p className="font-medium text-gray-900">{property.ownerEmail}</p>
                  <p className="text-gray-600 text-sm">Contact for more information</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Key Details */}
        <div>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Property Details</h2>
            
            <div className="space-y-4">
              {/* Basic Details */}
              <div className="flex items-center">
                {getPropertyTypeIcon()}
                <div>
                  <p className="text-sm text-gray-500">Property Type</p>
                  <p className="font-medium text-gray-900">{property.propertyType?.toLowerCase().replace(/_/g, ' ') || 'Unknown'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <svg className="text-gray-500 mr-3 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Listing Type</p>
                  <p className="font-medium text-gray-900">{property.listingType === 'FOR_SALE' ? 'For Sale' : 'For Rent'}</p>
                </div>
              </div>

              {/* Size */}
              {property.sizeInSqMt && (
                <div className="flex items-center">
                  <FaRulerCombined className="text-gray-500 mr-3 w-5 h-5" />
                  <div>
                    <p className="text-sm text-gray-500">Size</p>
                    <p className="font-medium text-gray-900">{property.sizeInSqMt} m²</p>
                  </div>
                </div>
              )}
              
              {/* Date Information */}
              <div className="flex items-center">
                <BsCalendarDate className="text-gray-500 mr-3 w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-500">Listed On</p>
                  <p className="font-medium text-gray-900">{formatDate(property.createdAt)}</p>
                </div>
              </div>

              {property.updatedAt && (
                <div className="flex items-center">
                  <BsCalendarDate className="text-gray-500 mr-3 w-5 h-5" />
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium text-gray-900">{formatDate(property.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Contact Button */}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg">
              Contact Agent
            </button>

            {/* Schedule Tour Button */}
            <button className="w-full mt-3 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg">
              Schedule a Tour
            </button>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="mt-12 bg-gray-100 rounded-2xl overflow-hidden" style={{ height: '400px' }}>
        <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="font-medium text-lg">Property Location</p>
          <p className="mt-1">{property.address}, {property.city}, {property.state} {property.zipCode}</p>
          <p className="mt-3 text-sm">Map integration would display here</p>
        </div>
      </div>
    </div>
  );
}