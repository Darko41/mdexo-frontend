import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../utils/api/api.js';
import { RealEstateCard, RealEstateCardSkeleton } from '../components/real-estate';

export default function SearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({});

  useEffect(() => {
    // Parse query parameters from URL
    const params = new URLSearchParams(location.search);
    const searchData = {
      searchTerm: params.get('searchTerm') || '',
      priceMin: params.get('priceMin') || null,
      priceMax: params.get('priceMax') || null,
      propertyType: params.get('propertyType') || null,
      listingType: params.get('listingType') || null,
      features: params.getAll('features') || [],
      city: params.get('city') || null
    };
    setSearchParams(searchData);
    fetchSearchResults(searchData);
  }, [location.search]);

  const fetchSearchResults = async (params) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clean up params (remove null/empty values)
      const cleanParams = Object.fromEntries(
        Object.entries(params)
          .filter(([_, value]) => value !== null && value !== '')
          .map(([key, value]) => [key, Array.isArray(value) ? value : value.toString()])
      );

      // Using the API service
      const response = await API.realEstates.search(cleanParams);
      
      // Axios wraps the response data in response.data
      setResults(response.data.content || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to load search results. Please try again.');
      
      // Access error response if available
      if (err.response) {
        console.error('Server responded with:', err.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Results</h1>
      
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Search Criteria:</h2>
        <div className="flex flex-wrap gap-2">
          {searchParams.searchTerm && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              Keyword: {searchParams.searchTerm}
            </span>
          )}
          {searchParams.propertyType && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              Type: {searchParams.propertyType}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <RealEstateCardSkeleton key={i} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg">No properties match your search criteria.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map(property => (
            <RealEstateCard 
              key={property.id} 
              property={property} 
              onClick={() => navigate(`/property/${property.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}