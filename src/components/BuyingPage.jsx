import { useState, useEffect } from "react";

export default function BuyingPage() {
  const [realEstates, setRealEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isDevelopment = import.meta.env.MODE === 'development';

  useEffect(() => {
    const apiUrl = isDevelopment
      ? "http://localhost:8080/api/real-estates/?listingType=FOR_SALE"
      : "https://mdexo-backend.onrender.com/api/real-estates/?listingType=FOR_SALE";

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setRealEstates(data.content || []); // Adjust to match your backend response
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch real estate data.");
        console.error("Error fetching real estate data:", error);
        setLoading(false);
      });
  }, [isDevelopment]);

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
