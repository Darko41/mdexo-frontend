import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RealEstateCard } from "../components/real-estate";
import API from '../utils/api/api.js';
import { AuthContext } from '../context/AuthContext';

export default function RentingPage() {
  const [realEstates, setRealEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Use AuthContext to check authentication
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await API.realEstates.searchForRent();
        setRealEstates(response.data.content || []);
      } catch (error) {
        console.error("Error fetching rental properties:", {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data
        });
        setError("Failed to fetch rental properties. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

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
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: '/create-listing',
          message: 'Please log in to create a property listing'
        }
      });
    } else {
      navigate('/create-listing');
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (authLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2">Loading...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2">Loading rental properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Rental Properties</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={handleRetry} 
            className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const featuredProperties = realEstates.slice(0, 10);

  return (
    <section className="w-full py-8 px-4 max-w-7xl mx-auto">
      
      {/* Featured Rental Properties Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-6">Featured Rental Properties</h2>
        
        {featuredProperties.length > 0 ? (
          <div className="relative">
            <div className="flex gap-6 overflow-hidden">
              {featuredProperties.map((estate) => (
                <div 
                  key={estate.propertyId || estate.id}
                  className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 transition-transform duration-300"
                  style={{
                    transform: `translateX(${-currentIndex * 100}%)`
                  }}
                >
                  <RealEstateCard property={estate} />
                </div>
              ))}
            </div>

            {featuredProperties.length > 5 && (
              <>
                <button
                  onClick={goToPrev}
                  disabled={currentIndex === 0}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 focus:outline-none transition-colors ${
                    currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  aria-label="Previous properties"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goToNext}
                  disabled={currentIndex >= featuredProperties.length - 5}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 focus:outline-none transition-colors ${
                    currentIndex >= featuredProperties.length - 5 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  aria-label="Next properties"
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
                  Browse All Rentals
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-lg text-gray-600 mb-4">No rental properties available at the moment.</p>
            <p className="text-gray-500">Check back later for new rental listings.</p>
          </div>
        )}
      </div>

      {/* Advertisement CTA Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-8 md:p-12 text-center">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            {isAuthenticated ? 'Ready to list your rental property?' : 'Want to list your rental property with us?'}
          </h3>
          <p className="text-lg mb-6">
            {isAuthenticated 
              ? 'Create your rental listing now and reach thousands of potential tenants.'
              : 'Join thousands of satisfied landlords who have successfully rented their properties through our platform. Get more visibility, qualified tenants, and faster rentals.'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleCreateListingClick}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={authLoading}
            >
              {authLoading ? 'Loading...' : (isAuthenticated ? 'Create Rental Listing' : 'Create Your Rental Listing')}
            </button>
            
            <Link to="/how-it-works">
              <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-8 border border-gray-300 rounded-lg transition-colors">
                Learn How It Works
              </button>
            </Link>
          </div>
          
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="font-bold text-purple-600">8,000+</div>
              <div>Monthly Renters</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="font-bold text-purple-600">85%</div>
              <div>Satisfaction Rate</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="font-bold text-purple-600">15 Days</div>
              <div>Average Rental Time</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="font-bold text-purple-600">24/7</div>
              <div>Support Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* For Existing Users - Only show if not authenticated */}
      {!isAuthenticated && !authLoading && (
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
      )}
    </section>
  );
}