import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from '../../utils/api/api';
import { AuthContext } from '../../context/AuthContext';
import { FaChartLine, FaStar, FaClock, FaHeadset, FaFileContract } from "react-icons/fa";
import styles from './styles.module.css';
import CTA from "../../components/CTA";
import AuthPrompt from "../../components/AuthPrompt";
import { RealEstateSlider } from "../../components/real-estate";

export default function ForLeasePage() {
  const [realEstates, setRealEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Use AuthContext to check authentication
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
 
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching lease properties...');
        const response = await API.realEstates.search({ 
          listingType: 'FOR_LEASE'
        });
        
        console.log('Lease properties response:', response.data);
        setRealEstates(response.data.content || []);
      } catch (error) {
        console.error("Error fetching lease properties:", {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data
        });
        setError("Failed to fetch lease properties. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
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
        <p className={styles.loadingText}>Loading lease properties...</p>
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
          <h3 className={styles.errorTitle}>Unable to Load Lease Properties</h3>
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
      {/* Properties For Lease Section */}
      <div className={styles.propertiesSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Properties For Lease</h2>
          <p className={styles.sectionSubtitle}>
            Discover commercial spaces, long-term leases, and premium rental opportunities
          </p>
        </div>
        
        {realEstates.length > 0 ? (
          <RealEstateSlider realEstates={realEstates} />
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FaFileContract className={styles.leaseIcon} />
            </div>
            <p className={styles.emptyText}>No lease properties available at the moment.</p>
            <p className={styles.emptySubtext}>
              Check back later for new commercial and long-term lease listings.
            </p>
            <div className={styles.leaseInfo}>
              <h4>Looking to lease your property?</h4>
              <p>List your commercial space or long-term rental to reach qualified tenants.</p>
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <CTA
        title={isAuthenticated ? 'Ready to list your property for lease?' : 'Want to lease your property with us?'}
        description={isAuthenticated 
          ? 'Create your lease listing now and reach qualified commercial and long-term tenants.'
          : 'Join property owners who have successfully leased their commercial spaces and long-term rentals through our platform. Get premium visibility and serious lease inquiries.'
        }
        primaryButtonText={authLoading ? 'Loading...' : (isAuthenticated ? 'Create Lease Listing' : 'Create Your Lease Listing')}
        secondaryButtonText="Learn About Leasing"
        onPrimaryClick={handleCreateListingClick}
        onSecondaryClick={() => navigate('/leasing-guide')}
        disabled={authLoading}
        stats={[
          { icon: FaChartLine, number: '5,000+', label: 'Business Visitors' },
          { icon: FaStar, number: '89%', label: 'Lease Success Rate' },
          { icon: FaClock, number: '30 Days', label: 'Average Lease Time' },
          { icon: FaHeadset, number: '24/7', label: 'Commercial Support' }
        ]}
        theme="lease"
      />

      {/* Lease Information Section */}
      <div className={styles.leaseInfoSection}>
        <h3 className={styles.infoTitle}>About Property Leasing</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>🏢</div>
            <h4>Commercial Spaces</h4>
            <p>Office buildings, retail stores, warehouses, and industrial properties available for lease.</p>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>📝</div>
            <h4>Long-Term Agreements</h4>
            <p>Extended rental periods with formal lease contracts and business terms.</p>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>💼</div>
            <h4>Professional Tenants</h4>
            <p>Connect with businesses and long-term residents seeking quality leased properties.</p>
          </div>
        </div>
      </div>

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