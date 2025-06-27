import { useState, useEffect } from "react";
import { RealEstateCard, RealEstateCardSkeleton } from "../components/real-estate";

export default function RealEstateList() {
  const [realEstates, setRealEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isDevelopment = import.meta.env.MODE === 'development';

  useEffect(() => {
    const apiUrl = isDevelopment
      ? "http://localhost:8080/api/real-estates/search"
      : "https://mdexo-backend.onrender.com/api/real-estates/search";

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
        {loading ? (
          // Show skeleton loaders while loading
          [...Array(8)].map((_, index) => (
            <RealEstateCardSkeleton key={`skeleton-${index}`} />
          ))
        ) : realEstates.length === 0 ? (
          <div className="col-span-full text-center">No real estates available.</div>
        ) : (
          // Show actual real estate cards when data is loaded
          realEstates.map((estate) => (
            <RealEstateCard 
              key={estate.id}
              property={estate}
            />
          ))
        )}
      </div>
    </section>
  );
}