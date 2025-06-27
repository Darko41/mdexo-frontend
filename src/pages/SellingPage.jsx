import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from '../utils/api/api.js';

export default function SellingPage() {
  const [realEstates, setRealEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);

  const isDevelopment = import.meta.env.MODE === 'development';

  // Fetch data when the component mounts
  useEffect(() => {
  const fetchRealEstates = async () => {
    try {
      const response = await API.realEstates.searchAll();
      setRealEstates(response.data.content || []);
    } catch (error) {
      console.error("Error fetching real estate data:", {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data
      });
      setError("Failed to fetch real estate data.");
    } finally {
      setLoading(false);
    }
  };

  fetchRealEstates();
}, []);

  // Touch and mouse event handlers for swipe functionality
  useEffect(() => {
    if (!sliderRef.current || realEstates.length === 0) return;

    const slider = sliderRef.current;

    const getPositionX = (e) => {
      return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    };

    const handleStart = (e) => {
      setIsDragging(true);
      setStartPos(getPositionX(e));
      setPrevTranslate(currentTranslate);
      slider.style.cursor = 'grabbing';
      slider.style.transition = 'none';
    };

    const handleMove = (e) => {
      if (!isDragging) return;
      const currentPosition = getPositionX(e);
      const diff = currentPosition - startPos;
      setCurrentTranslate(prevTranslate + diff);
    };

    const handleEnd = () => {
      setIsDragging(false);
      const movedBy = currentTranslate - prevTranslate;

      // If moved significantly to left, go to next
      if (movedBy < -50 && currentIndex < realEstates.length - 5) {
        goToNext();
      }
      // If moved significantly to right, go to previous
      else if (movedBy > 50 && currentIndex > 0) {
        goToPrev();
      }

      // Reset translate
      setCurrentTranslate(0);
      slider.style.cursor = 'grab';
      slider.style.transition = 'transform 0.3s ease-out';
    };

    // Add event listeners for touch
    slider.addEventListener('touchstart', handleStart);
    slider.addEventListener('touchmove', handleMove);
    slider.addEventListener('touchend', handleEnd);

    // Add event listeners for mouse
    slider.addEventListener('mousedown', handleStart);
    slider.addEventListener('mousemove', handleMove);
    slider.addEventListener('mouseup', handleEnd);
    slider.addEventListener('mouseleave', handleEnd);

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
  }, [currentIndex, isDragging, prevTranslate, realEstates.length, startPos]);

  const goToNext = () => {
    if (currentIndex < realEstates.length - 5) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleCreateListingClick = () => {
    navigate('/create-listing');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2">Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <section className="w-full py-8 px-4 max-w-7xl mx-auto">
      {/* Featured Properties Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-6">Featured Properties</h2>
        
        {realEstates.length > 0 ? (
          <div className="relative">
            <div 
              ref={sliderRef}
              className="flex gap-6 overflow-hidden cursor-grab"
              style={{
                transform: `translateX(${-currentIndex * 25}%)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out'
              }}
            >
              {realEstates.map((estate) => (
                <div 
                  key={estate.id} 
                  className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 transition-transform duration-300 hover:scale-105"
                >
                  <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={estate.imageUrl || 'https://via.placeholder.com/300'} 
                        alt={estate.title} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                        <span className="text-white font-semibold">${estate.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="p-4 flex-grow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{estate.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{estate.city}, {estate.state}</p>
                      <p className="text-gray-700 text-sm mb-3 line-clamp-2">{estate.description}</p>
                      <div className="flex justify-between text-sm text-gray-500 mt-auto">
                        <span>{estate.bedrooms || 'N/A'} beds</span>
                        <span>{estate.bathrooms || 'N/A'} baths</span>
                        <span>{estate.sqft || 'N/A'} sqft</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {realEstates.length > 5 && (
              <>
                <button
                  onClick={goToPrev}
                  disabled={currentIndex === 0}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 focus:outline-none ${
                    currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  aria-label="Previous"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goToNext}
                  disabled={currentIndex >= realEstates.length - 5}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 focus:outline-none ${
                    currentIndex >= realEstates.length - 5 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  aria-label="Next"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            <div className="text-center mt-8">
              <Link to="/real-estates">
                <button className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300">
                  Browse All Properties
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-lg">No properties available at the moment.</p>
          </div>
        )}
      </div>

      {/* Advertisement CTA Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 md:p-12 text-center">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Want to list your property with us?</h3>
          <p className="text-lg mb-6">
            Join thousands of satisfied sellers who have successfully marketed their properties through our platform.
            Get more visibility, serious buyers, and faster sales.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleCreateListingClick}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Create Your Listing Now
            </button>
            
            <Link to="/how-it-works">
              <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-8 border border-gray-300 rounded-lg transition-colors">
                Learn How It Works
              </button>
            </Link>
          </div>
          
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="font-bold text-blue-600">10,000+</div>
              <div>Monthly Visitors</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="font-bold text-blue-600">90%</div>
              <div>Satisfaction Rate</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="font-bold text-blue-600">30 Days</div>
              <div>Average Sale Time</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="font-bold text-blue-600">24/7</div>
              <div>Support Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* For Existing Users */}
      <div className="mt-12 text-center">
        <p className="mb-4">Already have an account?</p>
        <div className="flex justify-center gap-4">
          <Link to="/login">
            <button className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300">
              Sign In
            </button>
          </Link>
          <Link to="/signup">
            <button className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 transition duration-300">
              Register
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}