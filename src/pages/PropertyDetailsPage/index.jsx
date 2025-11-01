import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/api/api';
import { AuthContext } from '../../context/AuthContext';
import ContactModal from '../../components/ContactModal';
import { 
  FaMapMarkerAlt, 
  FaArrowLeft, 
  FaRulerCombined,
  FaUser,
  FaExpand,
  FaChevronLeft,
  FaChevronRight,
  FaFire,
  FaBuilding,
  FaHome,
  FaCalendarAlt
} from 'react-icons/fa';
import { GiCommercialAirplane } from 'react-icons/gi';
import { MdApartment, MdLandscape } from 'react-icons/md';
import { BsHouseDoor, BsCalendarDate } from 'react-icons/bs';

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, userProfile } = useContext(AuthContext);
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Contact modal state
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  // Check if user can contact (has complete profile)
  const canContactOwner = isAuthenticated && userProfile?.firstName && userProfile?.phone;

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
        
        const response = await API.realEstates.getById(id);
        
        if (!response.data) {
          throw new Error('Property not found');
        }
        
        setProperty(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Handle contact owner
  const handleContactOwner = async () => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: `/property/${id}`,
          message: 'Молимо пријавите се да бисте контактирали власника'
        }
      });
      return;
    }

    if (!canContactOwner) {
      navigate('/profile', {
        state: {
          from: `/property/${id}`,
          message: 'Молимо попуните ваш профил да бисте контактирали власника',
          requireProfile: true
        }
      });
      return;
    }

    setShowContactModal(true);
  };

  // Send contact message
  const sendContactMessage = async () => {
    if (!contactMessage.trim()) {
      alert('Молимо унесите поруку');
      return;
    }

    setContactLoading(true);
    try {
      await API.contact.send({
        propertyId: id,
        message: contactMessage,
        ownerEmail: property.ownerEmail
      });
      
      alert('Порука је успешно послата!');
      setShowContactModal(false);
      setContactMessage('');
    } catch (error) {
      alert('Грешка при слању поруке. Покушајте поново.');
    } finally {
      setContactLoading(false);
    }
  };

  // Close contact modal
  const handleCloseContactModal = () => {
    setShowContactModal(false);
    setContactMessage('');
  };

  // Format room count display
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

  // Format floor display
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

  // Format heating type for display
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

  // Format property condition for display
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

  // Calculate property age
  const getPropertyAge = (constructionYear) => {
    if (!constructionYear) return null;
    const currentYear = new Date().getFullYear();
    return currentYear - constructionYear;
  };

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
      setCurrentImageIndex(prev => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    } else if (movedBy > threshold) {
      setCurrentImageIndex(prev => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }

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

    slider.addEventListener('touchstart', handleStart, { passive: false });
    slider.addEventListener('touchmove', handleMove, { passive: false });
    slider.addEventListener('touchend', handleEnd);

    slider.addEventListener('mousedown', handleStart);
    slider.addEventListener('mousemove', handleMove);
    slider.addEventListener('mouseup', handleEnd);
    slider.addEventListener('mouseleave', handleEnd);

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
      case 'APARTMENT': return <MdApartment className="w-4 h-4" />;
      case 'HOUSE': return <BsHouseDoor className="w-4 h-4" />;
      case 'LAND': return <MdLandscape className="w-4 h-4" />;
      case 'COMMERCIAL': return <GiCommercialAirplane className="w-4 h-4" />;
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

  // Enhanced contact information display
  const renderContactInfo = () => {
    if (!property.ownerEmail) return null;

    return (
      <div className="bg-gray-50 p-6 rounded-2xl mb-6 border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          {property.ownerName ? 'Контакт информације' : 'Власник некретнине'}
        </h2>
        
        <div className="space-y-4">
          {property.ownerName && (
            <div className="flex items-center">
              <FaUser className="text-gray-500 mr-4 w-6 h-6" />
              <div>
                <p className="font-medium text-gray-900">{property.ownerName}</p>
                <p className="text-gray-600 text-sm">Власник</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center">
            <svg className="text-gray-500 mr-4 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">{property.ownerEmail}</p>
              <p className="text-gray-600 text-sm">Е-маил</p>
            </div>
          </div>

          {property.ownerPhone && (
            <div className="flex items-center">
              <svg className="text-gray-500 mr-4 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">{property.ownerPhone}</p>
                <p className="text-gray-600 text-sm">Телефон</p>
              </div>
            </div>
          )}
        </div>

        {/* Contact buttons with profile check */}
        <div className="mt-6 space-y-3">
          <button 
            onClick={handleContactOwner}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isAuthenticated ? 'Пријавите се за контакт' :
             !canContactOwner ? 'Попуните профил за контакт' :
             'Контактирајте власника'}
          </button>

          {isAuthenticated && !canContactOwner && (
            <div className="text-center">
              <p className="text-sm text-amber-600">
                ⭐ Попуните име и телефон у профилу да бисте контактирали власника
              </p>
            </div>
          )}
        </div>
      </div>
    );
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
        Назад на резултате
      </button>

      {/* Property Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{property.title}</h1>
        
        {/* Enhanced Location Display */}
        <div className="flex items-center text-gray-600 mb-4">
          <FaMapMarkerAlt className="mr-2 text-red-500" />
          <span className="text-lg">
            {property.municipality || property.address}
            {property.city && `, ${property.city}`}
            {property.state && `, ${property.state}`}
            {property.zipCode && ` ${property.zipCode}`}
          </span>
        </div>
        
        {/* Enhanced Property Badges */}
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
            {getPropertyTypeIcon()}
            {property.propertyType?.toLowerCase().replace(/_/g, ' ') || 'Unknown'}
          </span>
          <span className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
            {property.listingType === 'FOR_SALE' ? 'За продају' : 'За изнајмљивање'}
          </span>
          {property.sizeInSqMt && (
            <span className="inline-flex items-center bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold">
              <FaRulerCombined className="mr-1" />
              {property.sizeInSqMt} m²
            </span>
          )}
          {/* Room Count Badge */}
          {property.roomCount && (
            <span className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
              <FaHome className="mr-1" />
              {formatRoomCount(property.roomCount)}
            </span>
          )}
          {/* Floor Badge */}
          {(property.floor !== undefined && property.totalFloors !== undefined) && (
            <span className="inline-flex items-center bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-semibold">
              <FaBuilding className="mr-1" />
              {formatFloor(property.floor, property.totalFloors)}
            </span>
          )}
          {/* Construction Year Badge */}
          {property.constructionYear && (
            <span className="inline-flex items-center bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold">
              <FaCalendarAlt className="mr-1" />
              Год. {property.constructionYear}
              {getPropertyAge(property.constructionYear) && (
                <span className="ml-1 opacity-75">
                  ({getPropertyAge(property.constructionYear)} год.)
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Image Gallery */}
      <ImageGallery />

      {/* Fullscreen Gallery Modal */}
      <FullscreenGallery />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Price Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl mb-6 border border-blue-100">
            <h2 className="text-2xl font-bold mb-2">
              {property.listingType === 'FOR_SALE' ? 'Цена продаје' : 'Месечна кирија'}:{' '}
              <span className="text-blue-600">
                {formatPrice(property.price)}
              </span>
            </h2>
            {property.listingType === 'FOR_RENT' && (
              <p className="text-gray-600">Може бити потребан депозит</p>
            )}
          </div>

          {/* Enhanced Property Details Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Детаљи о некретнини</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Details */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <FaHome className="text-gray-500 mr-3 w-5 h-5" />
                  <div>
                    <p className="text-sm text-gray-500">Број соба</p>
                    <p className="font-medium text-gray-900">
                      {formatRoomCount(property.roomCount) || 'Није наведено'}
                    </p>
                  </div>
                </div>
                
                {(property.floor !== undefined && property.totalFloors !== undefined) && (
                  <div className="flex items-center">
                    <FaBuilding className="text-gray-500 mr-3 w-5 h-5" />
                    <div>
                      <p className="text-sm text-gray-500">Спрат</p>
                      <p className="font-medium text-gray-900">
                        {formatFloor(property.floor, property.totalFloors)}
                      </p>
                    </div>
                  </div>
                )}
                
                {property.constructionYear && (
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-gray-500 mr-3 w-5 h-5" />
                    <div>
                      <p className="text-sm text-gray-500">Година изградње</p>
                      <p className="font-medium text-gray-900">
                        {property.constructionYear}
                        {getPropertyAge(property.constructionYear) && (
                          <span className="text-gray-600 ml-2">
                            ({getPropertyAge(property.constructionYear)} година)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                {property.heatingType && (
                  <div className="flex items-center">
                    <FaFire className="text-gray-500 mr-3 w-5 h-5" />
                    <div>
                      <p className="text-sm text-gray-500">Грејање</p>
                      <p className="font-medium text-gray-900">
                        {formatHeatingType(property.heatingType)}
                      </p>
                    </div>
                  </div>
                )}
                
                {property.propertyCondition && (
                  <div className="flex items-center">
                    <svg className="text-gray-500 mr-3 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Стање</p>
                      <p className="font-medium text-gray-900">
                        {formatPropertyCondition(property.propertyCondition)}
                      </p>
                    </div>
                  </div>
                )}
                
                {property.sizeInSqMt && (
                  <div className="flex items-center">
                    <FaRulerCombined className="text-gray-500 mr-3 w-5 h-5" />
                    <div>
                      <p className="text-sm text-gray-500">Површина</p>
                      <p className="font-medium text-gray-900">{property.sizeInSqMt} m²</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Опис</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {property.description || 'Нема описа.'}
            </p>
          </div>

          {/* Features */}
          {property.features?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Карактеристике</h2>
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

          {/* Contact Information */}
          {renderContactInfo()}
        </div>

        {/* Right Column - Key Details */}
        <div>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Информације о огласу</h2>
            
            <div className="space-y-4">
              {/* Basic Details */}
              <div className="flex items-center">
                <div className="text-gray-500 mr-3 w-5 h-5 flex items-center justify-center">
                  {getPropertyTypeIcon()}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Тип некретнине</p>
                  <p className="font-medium text-gray-900">{property.propertyType?.toLowerCase().replace(/_/g, ' ') || 'Unknown'}</p>
                </div>
              </div>
            
              <div className="flex items-center">
                <svg className="text-gray-500 mr-3 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Тип огласа</p>
                  <p className="font-medium text-gray-900">{property.listingType === 'FOR_SALE' ? 'За продају' : 'За изнајмљивање'}</p>
                </div>
              </div>
            
              {/* Enhanced Details */}
              {property.roomCount && (
                <div className="flex items-center">
                  <FaHome className="text-gray-500 mr-3 w-5 h-5" />
                  <div>
                    <p className="text-sm text-gray-500">Број соба</p>
                    <p className="font-medium text-gray-900">{formatRoomCount(property.roomCount)}</p>
                  </div>
                </div>
              )}
            
              {/* Size */}
              {property.sizeInSqMt && (
                <div className="flex items-center">
                  <FaRulerCombined className="text-gray-500 mr-3 w-5 h-5" />
                  <div>
                    <p className="text-sm text-gray-500">Површина</p>
                    <p className="font-medium text-gray-900">{property.sizeInSqMt} m²</p>
                  </div>
                </div>
              )}
              
              {/* Heating Type */}
              {property.heatingType && (
                <div className="flex items-center">
                  <FaFire className="text-gray-500 mr-3 w-5 h-5" />
                  <div>
                    <p className="text-sm text-gray-500">Грејање</p>
                    <p className="font-medium text-gray-900">{formatHeatingType(property.heatingType)}</p>
                  </div>
                </div>
              )}
              
              {/* Date Information */}
              <div className="flex items-center">
                <BsCalendarDate className="text-gray-500 mr-3 w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-500">Објављено</p>
                  <p className="font-medium text-gray-900">{formatDate(property.createdAt)}</p>
                </div>
              </div>
            
              {property.updatedAt && (
                <div className="flex items-center">
                  <BsCalendarDate className="text-gray-500 mr-3 w-5 h-5" />
                  <div>
                    <p className="text-sm text-gray-500">Ажурирано</p>
                    <p className="font-medium text-gray-900">{formatDate(property.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Contact Button */}
            <button 
              onClick={handleContactOwner}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg"
            >
              {!isAuthenticated ? 'Пријавите се за контакт' :
               !canContactOwner ? 'Попуните профил за контакт' :
               'Контактирајте власника'}
            </button>

            {/* Schedule Tour Button */}
            <button className="w-full mt-3 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg">
              Закажите обилазак
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
          <p className="font-medium text-lg">Локација некретнине</p>
          <p className="mt-1">
            {property.municipality || property.address}, {property.city}, {property.state} {property.zipCode}
          </p>
          <p className="mt-3 text-sm">
            {property.latitude && property.longitude 
              ? `Координате: ${property.latitude.toFixed(6)}, ${property.longitude.toFixed(6)}`
              : 'Мапа ће бити приказана овде'
            }
          </p>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal
        show={showContactModal}
        onClose={handleCloseContactModal}
        onSubmit={sendContactMessage}
        loading={contactLoading}
        message={contactMessage}
        setMessage={setContactMessage}
        userProfile={userProfile}
        property={property}
      />
    </div>
  );
}