import { useState } from 'react';
import { FaSlidersH } from "react-icons/fa";
import ChooseComponent from "./ChooseComponent";
import SearchBar from "./SearchBar";
import AdvancedSearchModal from "./AdvancedSearchModal";
import { RealEstateCard } from "../components/real-estate";

export default function Main() {
  // State management
  const [searchResults, setSearchResults] = useState([]);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handler for search results
  const handleSearchResults = (results) => {
    setSearchResults(results);
    setError(null);
  };

  // Handler for errors
  const handleError = (error) => {
    setError("Došlo je do greške pri pretrazi. Pokušajte ponovo.");
    console.error(error);
    setSearchResults([]);
  };

  return (
    <div className="flex flex-col items-center bg-amber-50 pt-15 pb-15 px-4 min-h-screen">
      {/* 1. Top Section - ChooseComponent Buttons */}
      <div className="flex flex-row flex-wrap items-center justify-around w-full mb-8 gap-4">
        <ChooseComponent
          image=""
          title="Kupi dom"
          description="Pronađite savršen dom za kupovinu"
          buttonText="Pronađi agenta"
          onClick={() => window.location.href = '/buy'}
        />
        <ChooseComponent
          image=""
          title="Iznajmi dom"
          description="Pronađite idealan prostor za iznajmljivanje"
          buttonText="Pronađi nekretninu"
          onClick={() => window.location.href = '/rent'}
        />
        <ChooseComponent
          image=""
          title="Prodaj dom"
          description="Postavite oglas za svoju nekretninu"
          buttonText="Pogledaj opcije"
          onClick={() => window.location.href = '/sell'}
        />
      </div>

      {/* 2. Search Section */}
      <div className="w-full max-w-4xl mb-8 space-y-4">
        <SearchBar 
          onSearchResults={handleSearchResults}
          onError={handleError}
          setIsLoading={setIsLoading}
        />
        <button
          onClick={() => setIsAdvancedSearchOpen(true)}
          className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
        >
          <FaSlidersH className="mr-2" />
          Напредна претрага
        </button>
      </div>

      {/* 3. Status Indicators */}
      {error && (
        <div className="w-full max-w-4xl mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      {isLoading && (
        <div className="w-full flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* 4. Search Results */}
      {searchResults.length > 0 ? (
        <div className="w-full max-w-6xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Резултати претраге ({searchResults.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((property) => (
              <RealEstateCard key={property.propertyId} property={property} />
            ))}
          </div>
        </div>
      ) : (
        !isLoading && (
          <div className="w-full max-w-4xl text-center py-12">
            <p className="text-gray-500">Унесите критеријуме претраге да бисте видели резултате</p>
          </div>
        )
      )}

      {/* 5. Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
        onSearchResults={handleSearchResults}
        onError={handleError}
        setIsLoading={setIsLoading}
      />
    </div>
  );
}