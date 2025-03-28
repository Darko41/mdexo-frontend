import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function RealEstateList() {
  const [realEstates, setRealEstates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data when the component mounts
  useEffect(() => {
    fetch("https://mdexo-backend.onrender.com/api/real-estates/")  // For development: "http://localhost:8080/api/real-estates/"
      .then((response) => response.json())
      .then((data) => {
        setRealEstates(data.content); // Adjust to match your backend response (e.g., data.content)
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching real estate data:", error);
        setLoading(false);
      });
  }, []);

  // Loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="w-full py-8">
      <h2 className="text-3xl font-bold text-center mb-6">All Real Estates</h2>

      {/* Simple Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Display all real estates in a responsive grid */}
        {realEstates.map((estate) => (
          <div key={estate.id} className="real-estate-item w-full border rounded-lg shadow-lg">
            <img
              src={estate.imageUrl || "/default-image.jpg"} // Add default image path
              alt={estate.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <div className="p-4">
              <h3 className="font-bold text-xl">{estate.title}</h3>
              <p className="text-sm text-gray-600">{estate.description}</p>
              <p><strong>Price:</strong> ${estate.price}</p>
              <p><strong>Location:</strong> {estate.city}, {estate.state}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
