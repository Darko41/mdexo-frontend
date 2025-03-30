import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function RealEstateSlider() {
  const [realEstates, setRealEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch data when the component mounts
  useEffect(() => {
    fetch("http://localhost:8080/api/real-estates/")  // TODO REPLACE: "https://mdexo-backend.onrender.com/api/real-estates/"
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

      <div className="relative w-full">
        <div className="slider-container overflow-hidden">
          <div className="real-estates-slider flex gap-6 transition-all duration-500">
            {/* Displaying 5 real estates at a time */}
            {realEstates.slice(currentIndex, currentIndex + 5).map((estate) => (
              <div key={estate.id} className="real-estate-item w-80 border rounded-lg shadow-lg">
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
    </section>
  );
}
