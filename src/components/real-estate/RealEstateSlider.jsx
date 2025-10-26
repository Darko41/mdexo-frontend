import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import API from '../../utils/api/api.js';

export default function RealEstateSlider({ realEstates: propRealEstates }) {
  const [realEstates, setRealEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  const animationIDRef = useRef(null);
  const [visibleCards, setVisibleCards] = useState(1);
  const [imageCache, setImageCache] = useState(new Map()); // Cache image URLs

  // Calculate visible cards based on screen size
  const calculateVisibleCards = useCallback(() => {
    if (typeof window === 'undefined') return 1;
    
    const width = window.innerWidth;
    if (width < 480) return 1;  // Very small phones
    if (width < 640) return 1.5; // Small phones - show 1.5 cards for hint of next
    if (width < 768) return 2;   // Phones
    if (width < 1024) return 3;  // Tablets
    if (width < 1280) return 4;  // Small desktop
    return 5; // Large desktop
  }, []);

  // Update visible cards on resize
  useEffect(() => {
    const handleResize = () => {
      setVisibleCards(calculateVisibleCards());
    };

    handleResize(); // Initial calculation
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateVisibleCards]);

  // Fetch data when the component mounts or when propRealEstates changes
  useEffect(() => {
    if (propRealEstates) {
      setRealEstates(propRealEstates);
      setLoading(false);
      return;
    }

    const fetchRealEstates = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.realEstates.search();
        setRealEstates(response.data.content || []);
      } catch (error) {
        setError("Failed to fetch real estate data.");
        console.error("Error fetching real estate data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealEstates();
  }, [propRealEstates]);

  const goToNext = useCallback(() => {
    const maxIndex = Math.max(0, realEstates.length - Math.floor(visibleCards));
    if (currentIndex < maxIndex) {
      setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
      setCurrentTranslate(0);
      setPrevTranslate(0);
    }
  }, [currentIndex, realEstates.length, visibleCards]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setCurrentTranslate(0);
      setPrevTranslate(0);
    }
  }, [currentIndex]);

  // Animation for smooth dragging
  const animation = useCallback(() => {
    if (sliderRef.current && isDragging) {
      sliderRef.current.style.transform = `translateX(calc(${-currentIndex * (100 / visibleCards)}% + ${currentTranslate}px))`;
      animationIDRef.current = requestAnimationFrame(animation);
    }
  }, [currentIndex, currentTranslate, isDragging, visibleCards]);

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

  const getPositionX = useCallback((e) => {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
  }, []);

  const handleStart = useCallback((e) => {
    setIsDragging(true);
    setStartPos(getPositionX(e));
    setPrevTranslate(currentTranslate);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grabbing';
      sliderRef.current.style.transition = 'none';
    }
  }, [getPositionX, currentTranslate]);

  const handleMove = useCallback((e) => {
    if (!isDragging) return;
    
    // Prevent default to stop page scroll on touch devices
    e.preventDefault();
    
    const currentPosition = getPositionX(e);
    const diff = currentPosition - startPos;
    
    // Calculate boundaries to prevent overscroll
    const maxTranslate = 100; // Maximum drag distance in pixels
    const boundedDiff = Math.max(Math.min(diff, maxTranslate), -maxTranslate);
    
    setCurrentTranslate(prevTranslate + boundedDiff);
  }, [isDragging, getPositionX, startPos, prevTranslate]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const movedBy = currentTranslate - prevTranslate;
    const threshold = 50; // Reduced threshold for better sensitivity

    // Calculate max index based on visible cards
    const maxIndex = Math.max(0, realEstates.length - Math.floor(visibleCards));

    if (movedBy < -threshold) {
      // Swipe left - go to next
      if (currentIndex < maxIndex) {
        goToNext();
      } else {
        // Snap back if at the end
        setCurrentTranslate(prevTranslate);
      }
    } else if (movedBy > threshold) {
      // Swipe right - go to previous
      if (currentIndex > 0) {
        goToPrev();
      } else {
        // Snap back if at the start
        setCurrentTranslate(prevTranslate);
      }
    } else {
      // Not enough movement - snap back
      setCurrentTranslate(prevTranslate);
    }

    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
      sliderRef.current.style.transition = 'transform 0.3s ease-out';
    }
  }, [isDragging, currentTranslate, prevTranslate, goToNext, goToPrev, currentIndex, realEstates.length, visibleCards]);

  // Touch and mouse event handlers for swipe functionality
  useEffect(() => {
    if (!sliderRef.current || realEstates.length === 0) return;

    const slider = sliderRef.current;

    // Add event listeners for touch with passive: false to prevent page scroll
    slider.addEventListener('touchstart', handleStart, { passive: false });
    slider.addEventListener('touchmove', handleMove, { passive: false });
    slider.addEventListener('touchend', handleEnd);

    // Add event listeners for mouse
    slider.addEventListener('mousedown', handleStart);
    slider.addEventListener('mousemove', handleMove);
    slider.addEventListener('mouseup', handleEnd);
    slider.addEventListener('mouseleave', handleEnd);

    // Prevent image drag behavior
    const images = slider.querySelectorAll('img');
    images.forEach(img => {
      img.addEventListener('dragstart', (e) => e.preventDefault());
    });

    return () => {
      // Clean up touch listeners
      slider.removeEventListener('touchstart', handleStart);
      slider.removeEventListener('touchmove', handleMove);
      slider.removeEventListener('touchend', handleEnd);

      // Clean up mouse listeners
      slider.removeEventListener('mousedown', handleStart);
      slider.removeEventListener('mousemove', handleMove);
      slider.removeEventListener('mouseup', handleEnd);
      slider.removeEventListener('mouseleave', handleEnd);
    };
  }, [realEstates.length, handleStart, handleMove, handleEnd]);

  // Calculate card width based on visible cards
  const getCardWidth = useCallback(() => {
    return 100 / visibleCards;
  }, [visibleCards]);

  // Reset translate when currentIndex changes (not during drag)
  useEffect(() => {
    if (!isDragging) {
      setCurrentTranslate(0);
      setPrevTranslate(0);
    }
  }, [currentIndex, isDragging]);

  // Get a unique key for each estate
  const getEstateKey = (estate, index) => {
    return estate.propertyId || estate.id || `estate-${index}`;
  };

  // Improved image URL getter with caching to prevent blinking
  const getImageUrl = useCallback((estate, index) => {
    const estateKey = getEstateKey(estate, index);
    
    // Return cached URL if exists
    if (imageCache.has(estateKey)) {
      return imageCache.get(estateKey);
    }

    let imageUrl;

    // Determine the image URL
    if (estate.imageUrl) {
      imageUrl = estate.imageUrl;
    } else if (estate.images && estate.images.length > 0) {
      imageUrl = estate.images[0];
    } else if (import.meta.env.MODE === 'development') {
      // Use a FIXED random image per property to prevent blinking
      // This ensures the same image is always returned for the same property
      const randomSeed = estate.propertyId || estate.id || index;
      imageUrl = `https://picsum.photos/300/200?random=${randomSeed}`;
    } else {
      imageUrl = '/default-property.jpg';
    }

    // Cache the URL
    setImageCache(prev => new Map(prev).set(estateKey, imageUrl));
    
    return imageUrl;
  }, [imageCache]);

  // Handle image error with caching
  const handleImageError = useCallback((e, estateKey) => {
    const fallbackUrl = '/default-property.jpg';
    
    // Only set fallback if not already set to prevent infinite loops
    if (e.target.src !== fallbackUrl) {
      // Cache the fallback URL
      setImageCache(prev => new Map(prev).set(estateKey, fallbackUrl));
      e.target.src = fallbackUrl;
    }
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  const maxIndex = Math.max(0, realEstates.length - Math.floor(visibleCards));
  const canGoNext = currentIndex < maxIndex;
  const canGoPrev = currentIndex > 0;

  return (
    <section className="w-full py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-900">Featured Properties</h2>

        <div className="relative">
          {/* Slider Container with overflow hidden to prevent page scroll */}
          <div className="overflow-hidden">
            <div
              ref={sliderRef}
              className="flex cursor-grab active:cursor-grabbing transition-transform duration-300"
              style={{
                transform: `translateX(calc(${-currentIndex * (100 / visibleCards)}% + ${currentTranslate}px))`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out'
              }}
            >
              {realEstates.map((estate, index) => {
                const estateKey = getEstateKey(estate, index);
                const imageUrl = getImageUrl(estate, index);
                
                return (
                  <div
                    key={estateKey}
                    className="flex-shrink-0 px-2"
                    style={{ width: `${getCardWidth()}%` }}
                  >
                    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col group hover:scale-105">
                      <div className="relative h-36 sm:h-40 md:h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={imageUrl}
                          alt={estate.title || 'Property image'}
                          className="w-full h-full object-cover select-none"
                          loading="lazy"
                          draggable="false"
                          onError={(e) => handleImageError(e, estateKey)}
                        />
                        <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-semibold shadow">
                          {estate.listingType === 'FOR_RENT' ? 'For Rent' : 'For Sale'}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                          <span className="text-white font-semibold text-sm">
                            {estate.price?.toLocaleString() || '0'} €
                          </span>
                        </div>
                      </div>
                      <div className="p-3 flex-grow flex flex-col">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 line-clamp-1">
                          {estate.title || 'Untitled Property'}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-1">
                          {estate.city || 'Unknown'}, {estate.state || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-700 mb-2 line-clamp-2 hidden sm:block">
                          {estate.description || 'No description available'}
                        </p>
                        <div className="flex justify-between text-xs text-gray-500 mt-auto">
                          <span>{estate.bedrooms || 'N/A'} beds</span>
                          <span>{estate.bathrooms || 'N/A'} baths</span>
                          <span>{estate.sizeInSqMt || 'N/A'} m²</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          {canGoPrev && (
            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 focus:outline-none z-10 transition-all duration-300 hover:scale-110"
              aria-label="Previous properties"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {canGoNext && (
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 focus:outline-none z-10 transition-all duration-300 hover:scale-110"
              aria-label="Next properties"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/real-estates">
            <button className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-8 rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300 shadow-lg hover:shadow-xl font-medium text-sm hover:scale-105">
              View All Properties
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}