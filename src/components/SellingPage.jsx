import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SellingPage() {
  const [realEstates, setRealEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const isDevelopment = import.meta.env.MODE === 'development';

  // Fetch data when the component mounts
  useEffect(() => {
    const apiUrl = isDevelopment
      ? "http://localhost:8080/api/real-estates/"
      : "https://mdexo-backend.onrender.com/api/real-estates/";

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setRealEstates(data.content || []);
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch real estate data.");
        console.error("Error fetching real estate data:", error);
        setLoading(false);
      });
  }, [isDevelopment]);

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2">Loading properties...</p>
      </div>
    );
  }

  // Error state UI
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

  // Slider navigation
  const goToNext = () => {
    if (currentIndex < realEstates.length - 5) {
      setCurrentIndex(currentIndex + 3);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 3);
    }
  };

  const handleCreateListingClick = () => {
    navigate('/create-listing');
  };

  return (
    <section className="w-full py-8 px-4 max-w-7xl mx-auto">
      {/* Featured Properties Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-6">Featured Properties</h2>
        
        {realEstates.length > 0 ? (
          <div className="relative">
            <div className="overflow-hidden">
              <div className="flex gap-6 transition-all duration-500">
                {realEstates.slice(currentIndex, currentIndex + 5).map((estate) => (
                  <div key={estate.id} className="min-w-[300px] border rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                    <img
                      src={estate.imageUrl || "/default-image.jpg"}
                      alt={estate.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-xl mb-2">{estate.title}</h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">{estate.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><span className="font-semibold">Price:</span> ${estate.price}</p>
                        <p><span className="font-semibold">Location:</span> {estate.city}, {estate.state}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {realEstates.length > 5 && (
              <>
                <button
                  onClick={goToPrev}
                  disabled={currentIndex === 0}
                  className={`absolute left-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
                >
                  &lt;
                </button>
                <button
                  onClick={goToNext}
                  disabled={currentIndex >= realEstates.length - 5}
                  className={`absolute right-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full ${currentIndex >= realEstates.length - 5 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
                >
                  &gt;
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