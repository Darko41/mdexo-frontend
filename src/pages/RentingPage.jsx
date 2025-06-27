import { useState, useEffect } from "react";
import API from '../utils/api/api.js';

export default function RentingPage() {
  const [realEstates, setRealEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isDevelopment = import.meta.env.MODE === 'development';

  useEffect(() => {
  const fetchProperties = async () => {
    try {
      const response = await API.realEstates.searchForRent();
      setRealEstates(response.data.content || []);
    } catch (error) {
      console.error("Error fetching rental properties:", {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data
      });
      setError("Failed to fetch real estate data.");
    } finally {
      setLoading(false);
    }
  };

  fetchProperties();
}, []);

  // Loading state UI
  if (loading) {
    return (
      <div className="text-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <section className="w-full py-8">
      <h2 className="text-3xl font-bold text-center mb-6">All Real Estates</h2>

      {/* Real Estate Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Display each real estate item */}
        {realEstates.length === 0 ? (
          <div className="col-span-full text-center">No real estates available.</div>
        ) : (
          realEstates.map((estate) => (
            <div 
              key={estate.id} // Ensure each item has a unique key
              className="real-estate-item w-full border rounded-lg shadow-lg overflow-hidden"
            >
              <img
                src={estate.imageUrl || "/default-image.jpg"} // Fallback to default image if no image is provided
                alt={estate.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-xl">{estate.title}</h3>
                <p className="text-sm text-gray-600">{estate.description}</p>
                <p><strong>Price:</strong> ${estate.price}</p>
                <p><strong>Location:</strong> {estate.city}, {estate.state}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
