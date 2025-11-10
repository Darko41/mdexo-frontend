import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from '../../utils/api/api';
import { AuthContext } from '../../context/AuthContext';
import { FaChartLine, FaStar, FaClock, FaHeadset } from "react-icons/fa";
import styles from './styles.module.css';
import CTA from "../../components/CTA";
import AuthPrompt from "../../components/AuthPrompt";
import { RealEstateSlider } from "../../components/real-estate";

export default function BuyingPage() {
  const [realEstates, setRealEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Use AuthContext to check authentication
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
 
  useEffect(() => {
  let isMounted = true;
  
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await API.realEstates.search({ 
        listingType: 'FOR_SALE'
      });
      
      if (isMounted) {
        setRealEstates(response.data.content || []);
      }
    } catch (error) {
      if (isMounted) {
        console.error("Error fetching properties for sale:", error);
        setError("Failed to fetch properties for sale. Please try again later.");
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  fetchProperties();

  return () => {
    isMounted = false;
  };
}, []);

  const handleCreateListingClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: '/create-listing',
          message: 'Please log in to create a property listing'
        }
      });
    } else {
      navigate('/create-listing');
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Loading properties for sale...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>
            <svg className={styles.errorSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className={styles.errorTitle}>Unable to Load Properties</h3>
          <p className={styles.errorMessage}>{error}</p>
          <button 
            onClick={handleRetry} 
            className={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className={styles.container}>
      {/* Properties for Sale Section - Using RealEstateSlider */}
      <div className={styles.propertiesSection}>
        <h2 className={styles.sectionTitle}>Properties For Sale</h2>
        
        {realEstates.length > 0 ? (
          <RealEstateSlider realEstates={realEstates} />
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className={styles.emptyText}>No properties for sale available at the moment.</p>
            <p className={styles.emptySubtext}>Check back later for new property listings.</p>
          </div>
        )}
      </div>

      <CTA
        title={isAuthenticated ? 'Ready to sell your property?' : 'Want to sell your property with us?'}
        description={isAuthenticated 
          ? 'Create your listing now and reach thousands of potential buyers.'
          : 'Join thousands of satisfied sellers who have successfully sold their properties through our platform. Get more visibility, serious buyers, and better offers.'
        }
        primaryButtonText={authLoading ? 'Loading...' : (isAuthenticated ? 'Create Sale Listing' : 'Create Your Sale Listing')}
        secondaryButtonText="Learn How It Works"
        onPrimaryClick={handleCreateListingClick}
        onSecondaryClick={() => navigate('/how-it-works')}
        disabled={authLoading}
        stats={[
          { icon: FaChartLine, number: '15,000+', label: 'Monthly Visitors' },
          { icon: FaStar, number: '94%', label: 'Satisfaction Rate' },
          { icon: FaClock, number: '18 Days', label: 'Average Listing Time' },
          { icon: FaHeadset, number: '24/7', label: 'Support Available' }
        ]}
      />

      {/* For Existing Users - Only show if not authenticated */}
      {!isAuthenticated && !authLoading && (
        <AuthPrompt
          message="Already have an account?"
          onLogin={() => navigate('/login')}
          onRegister={() => navigate('/signup')}
        />
      )}
    </section>
  );
}