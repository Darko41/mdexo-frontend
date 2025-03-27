import { useState, useEffect } from "react";

export default function RealEstateSlider() {
  const [realEstates, setRealEstates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://mdexo-backend.onrender.com/api/real-estates/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        setRealEstates(data.content);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching real estate data:", error);
        setLoading(false);
      });
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-blue-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      <h2 className="text-3xl font-semibold mb-6 text-center text-blue-600">Available Real Estates</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {realEstates.length > 0 ? (
          realEstates.map((estate) => (
            <div key={estate.propertyId} className="border p-4 rounded-lg shadow-lg bg-white hover:shadow-2xl transition duration-300 transform hover:scale-105">
              <h3 className="text-xl font-semibold">{estate.title}</h3>
              <p className="text-gray-600">{estate.description}</p>
              <p className="mt-2 text-lg font-semibold">Price: ${estate.price}</p>
              <p className="text-sm text-gray-500">{estate.city}, {estate.state}</p>
              <p className="mt-2 text-sm text-gray-400">Size: {estate.sizeInSqMt} sq meters</p>
              <p className="mt-2 text-xs text-gray-400">Added: {formatDate(estate.createdAt)}</p>
            </div>
          ))
        ) : (
          <p className="text-center col-span-3">No real estate listings available.</p>
        )}
      </div>
    </div>
  );
}
