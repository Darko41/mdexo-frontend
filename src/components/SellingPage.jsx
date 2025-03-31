import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function SellingPage() {
  const [realEstates, setRealEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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
        setRealEstates(data.content || []); // Adjust to match your backend response
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

  // Next button logic to slide the slider
  const goToNext = () => {
    if (currentIndex < realEstates.length - 5) {
      setCurrentIndex(currentIndex + 3); // Slide by 3 items at a time
    }
  };

  // Previous button logic to slide the slider
  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 3); // Slide by 3 items at a time
    }
  };

  return (
    <section className="w-full py-8">
      <h2 className="text-3xl font-bold text-center mb-6">Available Real Estates</h2>

      {/* Slider Section */}
      <div className="relative w-full">
        <div className="slider-container overflow-hidden">
          <div className="real-estates-slider flex gap-6 transition-all duration-500">
            {/* Displaying 5 real estates at a time */}
            {realEstates.slice(currentIndex, currentIndex + 5).map((estate) => (
              <div key={estate.id} className="real-estate-item w-80 border rounded-lg shadow-lg">
                <img
                  src={estate.imageUrl || "/default-image.jpg"} // Fallback to default image if no image is provided
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
        </div>

        {/* Prev and Next buttons */}
        <button
          onClick={goToPrev}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
        >
          &lt;
        </button>
        <button
          onClick={goToNext}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
        >
          &gt;
        </button>

        <div className="text-center mt-6">
          <Link to="/real-estates">
            <button className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300">
              See More
            </button>
          </Link>
        </div>
      </div>

      {/* Advertisement Section */}
      <div className="mt-12 text-center">
        <h3 className="text-2xl font-semibold mb-4">Advertise Your Real Estate</h3>
        <p className="mb-4 text-lg">You can advertise your real estate here for sale or for rent. Reach a large audience and get your property listed in no time!</p>
        <div>
          <Link to="/signup">
            <button className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition duration-300 mr-4">
              Sign Up
            </button>
          </Link>
          <Link to="/login">
            <button className="bg-yellow-600 text-white py-2 px-6 rounded-lg hover:bg-yellow-700 transition duration-300">
              Login
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
