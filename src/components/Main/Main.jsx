import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSlidersH, FaHome, FaKey, FaTag, FaSearch, FaChartLine, FaStar, FaClock, FaHeadset, FaFileContract } from "react-icons/fa";
import SearchBar from "../SearchBar";
import AdvancedSearchModal from "../AdvancedSearchModal";
import { RealEstateCard } from "../real-estate";
import { AuthContext } from '../../context/AuthContext';
import styles from './styles.module.css';
import CTA from "../CTA";
import AuthPrompt from "../AuthPrompt";

export default function Main() {
  const [searchResults, setSearchResults] = useState([]);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setError(null);
  };

  const handleError = (error) => {
    setError("Došlo je do greške pri pretrazi. Pokušajte ponovo.");
    console.error(error);
    setSearchResults([]);
  };

  const handleCreateListingClick = () => {
    navigate('/create-listing');
  };

  return (
    <div className={styles.container}>
      {/* Hero Section with Background Image */}
      <div className={styles.heroSection}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Find Your Dream <span>Property</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Discover amazing properties for sale, rent, or lease. Your perfect home is just a click away.
            </p>
          </div>

          {/* Action Cards Over Background */}
          <div className={styles.actionGrid}>
            {/* Buy Card */}
            <div 
              onClick={() => navigate('/buy')}
              className={`${styles.actionCard} ${styles.buyCard}`}
            >
              <div className={`${styles.iconContainer} ${styles.buyIcon}`}>
                <FaHome className="text-white text-xl" />
              </div>
              <h3 className={styles.cardTitle}>Buy a Home</h3>
              <p className={styles.cardDescription}>Find your perfect property from thousands of listings</p>
              <div className={`${styles.cardLink} ${styles.buyLink}`}>
                Browse Properties
                <svg className={styles.linkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Rent Card */}
            <div 
              onClick={() => navigate('/rent')}
              className={`${styles.actionCard} ${styles.rentCard}`}
            >
              <div className={`${styles.iconContainer} ${styles.rentIcon}`}>
                <FaKey className="text-white text-xl" />
              </div>
              <h3 className={styles.cardTitle}>Rent a Property</h3>
              <p className={styles.cardDescription}>Discover rental properties that fit your lifestyle</p>
              <div className={`${styles.cardLink} ${styles.rentLink}`}>
                Find Rentals
                <svg className={styles.linkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Lease Card */}
            <div 
			  onClick={() => navigate('/lease')}
			  className={`${styles.actionCard} ${styles.leaseCard}`}
			>
			  <div className={`${styles.iconContainer} ${styles.leaseIcon}`}>
			    <FaFileContract className="text-white text-xl" />
			  </div>
			  <h3 className={styles.cardTitle}>Lease Property</h3>
			  <p className={styles.cardDescription}>Commercial spaces and long-term lease options</p>
			  <div className={`${styles.cardLink} ${styles.leaseLink}`}>
			    Browse Leases
			    <svg className={styles.linkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
			    </svg>
			  </div>
			</div>

            {/* Browse All Card */}
            <div 
              onClick={() => navigate('/real-estates')}
              className={`${styles.actionCard} ${styles.browseCard}`}
            >
              <div className={`${styles.iconContainer} ${styles.browseIcon}`}>
                <FaSearch className="text-gray-900 text-xl" />
              </div>
              <h3 className={styles.cardTitle}>Browse All</h3>
              <p className={styles.cardDescription}>Explore our complete collection of properties</p>
              <div className={`${styles.cardLink} ${styles.browseLink}`}>
                View All Listings
                <svg className={styles.linkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className={styles.contentSection}>
        {/* Search Section */}
        <div className={styles.integratedSearchSection}>
          <div className={styles.searchContent}>
            <div className={styles.searchHeader}>
              <h2 className={styles.searchTitle}>Find Your Perfect Property</h2>
              <p className={styles.searchSubtitle}>
                Discover amazing properties tailored to your needs
              </p>
            </div>
            
            <div className={styles.searchArea}>
              <SearchBar 
                onSearchResults={handleSearchResults}
                onError={handleError}
                setIsLoading={setIsLoading}
              />
              
              <div className={styles.searchActions}>
                <button
                  onClick={() => setIsAdvancedSearchOpen(true)}
                  className={styles.advancedButton}
                >
                  <FaSlidersH className="mr-2" />
                  Advanced Filters
                </button>
              </div>
            </div>

            {/* Guidance appears below search when no results */}
            {!isLoading && searchResults.length === 0 && !error && (
              <div className={styles.integratedGuidance}>
                <div className={styles.guidanceSection}>
                  <h3 className={styles.guidanceTitle}>Not sure where to start?</h3>
                  <div className={styles.quickTips}>
                    <div className={styles.tipCard}>
                      <span className={styles.tipIcon}>📍</span>
                      <h4>Search by Location</h4>
                      <p>Enter a city, neighborhood, or address</p>
                    </div>
                    <div className={styles.tipCard}>
                      <span className={styles.tipIcon}>💰</span>
                      <h4>Filter by Price</h4>
                      <p>Set your budget range</p>
                    </div>
                    <div className={styles.tipCard}>
                      <span className={styles.tipIcon}>🏠</span>
                      <h4>Browse by Type</h4>
                      <p>Apartments, houses, commercial</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
          </div>
        )}
        
        {/* Search Results (when we have them) */}
        {searchResults.length > 0 && (
          <div className={styles.resultsSection}>
            <h2 className={styles.resultsTitle}>
              Search Results ({searchResults.length})
            </h2>
            <div className={styles.resultsGrid}>
              {searchResults.map((property) => (
                <RealEstateCard key={property.propertyId} property={property} />
              ))}
            </div>
          </div>
        )}

        {/* CTA + Auth Section */}
        <div className={styles.ctaAuthSection}>
          <CTA
            title="Want to list your property with us?"
            description="Join thousands of satisfied property owners who have successfully listed their properties through our platform."
            primaryButtonText="Create Your Listing"
            secondaryButtonText="Learn How It Works"
            onPrimaryClick={handleCreateListingClick}
            onSecondaryClick={() => navigate('/how-it-works')}
            stats={[
              { icon: FaChartLine, number: '15,000+', label: 'Monthly Visitors' },
              { icon: FaStar, number: '94%', label: 'Satisfaction Rate' },
              { icon: FaClock, number: '18 Days', label: 'Average Listing Time' },
              { icon: FaHeadset, number: '24/7', label: 'Support Available' }
            ]}
          />
          
          {/* Auth Prompt - Only show if not authenticated */}
          {!isAuthenticated && !authLoading && (
            <AuthPrompt
              message="Already have an account?"
              onLogin={() => navigate('/login')}
              onRegister={() => navigate('/signup')}
            />
          )}
        </div>
      </div>

      {/* Advanced Search Modal */}
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