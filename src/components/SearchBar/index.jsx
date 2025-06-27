import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ onSearchResults, setIsLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a search term");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Navigate to search results page (recommended for client-side routing)
      navigate(`/search?searchTerm=${encodeURIComponent(searchTerm.trim())}`);
      
      
    } catch (error) {
      console.error("Search error details:", {
        message: error.message,
        config: error.config,
        response: error.response
      });
      setError("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto">
      <div className="flex h-12 w-full flex-row items-center rounded-xl border-2 border-blue-800 bg-white">
        <FaSearch className="ml-3 text-blue-800" />
        <input
          className="ml-2 w-full rounded-xl pl-2 text-left outline-none"
          type="text"
          placeholder="Куцајте за претрагу (локацију, квадратуру, број соба...)"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSearch}
          disabled={!searchTerm.trim()}
          className="px-4 h-full bg-blue-800 text-white rounded-r-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Тражи
        </button>
      </div>
      
      {error && (
        <div className="mt-2 text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

SearchBar.propTypes = {
  onSearchResults: PropTypes.func.isRequired,
  setIsLoading: PropTypes.func.isRequired,
};

export default SearchBar;