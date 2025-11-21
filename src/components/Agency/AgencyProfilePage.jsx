import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaBuilding, 
  FaHome, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaStar,
  FaCalendar,
  FaArrowLeft,
  FaGlobe,
  FaCheckCircle
} from 'react-icons/fa';
import API from '../../utils/api/api';
import styles from './AgencyProfile.module.css';

export default function AgencyProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agency, setAgency] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAgencyData();
  }, [id]);

  const fetchAgencyData = async () => {
    try {
      setLoading(true);
      
      // Fetch agency details
      const agencyResponse = await API.agencies.getById(id);
      const agencyData = agencyResponse.data;
      setAgency(agencyData);
      
      // Fetch agency properties
      const propertiesResponse = await API.agencies.getProperties(id);
      setProperties(propertiesResponse.data || []);
      
    } catch (error) {
      console.error('Error fetching agency data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading agency profile...</p>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className={styles.errorContainer}>
        <h2>Agency Not Found</h2>
        <p>The agency you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/agencies')} className={styles.backButton}>
          Back to Agencies
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <button onClick={() => navigate('/agencies')} className={styles.backButton}>
          <FaArrowLeft /> Back to Agencies
        </button>
        
        <div className={styles.agencyHeader}>
          <div className={styles.logoSection}>
            {agency.logo ? (
              <img src={agency.logo} alt={agency.name} className={styles.logo} />
            ) : (
              <div className={styles.logoPlaceholder}>
                <FaBuilding />
              </div>
            )}
          </div>
          
          <div className={styles.agencyInfo}>
            <h1 className={styles.agencyName}>{agency.name}</h1>
            <p className={styles.agencyDescription}>
              {agency.description || 'Professional real estate agency providing exceptional service.'}
            </p>
            
            <div className={styles.agencyMeta}>
              <div className={styles.metaItem}>
                <FaHome className={styles.metaIcon} />
                <span>{properties.length} Properties</span>
              </div>
              <div className={styles.metaItem}>
                <FaCalendar className={styles.metaIcon} />
                <span>Est. {new Date(agency.createdAt).getFullYear()}</span>
              </div>
              {agency.isActive === false && (
                <div className={styles.metaItem}>
                  <FaCheckCircle className={styles.metaIcon} />
                  <span>Currently Inactive</span>
                </div>
              )}
            </div>
            
            {/* Enhanced Contact Information */}
            <div className={styles.contactSection}>
              {agency.contactEmail && (
                <div className={styles.contactItem}>
                  <FaEnvelope className={styles.contactIcon} />
                  <span>{agency.contactEmail}</span>
                </div>
              )}
              {agency.contactPhone && (
                <div className={styles.contactItem}>
                  <FaPhone className={styles.contactIcon} />
                  <span>{agency.contactPhone}</span>
                </div>
              )}
              {agency.website && (
                <div className={styles.contactItem}>
                  <FaGlobe className={styles.contactIcon} />
                  <a href={agency.website} target="_blank" rel="noopener noreferrer">
                    {agency.website}
                  </a>
                </div>
              )}
              {agency.city && (
                <div className={styles.contactItem}>
                  <FaMapMarkerAlt className={styles.contactIcon} />
                  <span>{agency.city}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Simplified without agents */}
      <div className={styles.tabNavigation}>
        <button 
          className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'properties' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          Properties ({properties.length})
        </button>
        {agency.licenseNumber && (
          <button 
            className={`${styles.tab} ${activeTab === 'credentials' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('credentials')}
          >
            Credentials
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'overview' && (
          <OverviewTab agency={agency} properties={properties} />
        )}
        
        {activeTab === 'properties' && (
          <PropertiesTab properties={properties} />
        )}
        
        {activeTab === 'credentials' && (
          <CredentialsTab agency={agency} />
        )}
      </div>
    </div>
  );
}

// Overview Tab Component - Simplified without agents
function OverviewTab({ agency, properties }) {
  const featuredProperties = properties.filter(property => property.isFeatured).slice(0, 3);
  const activeProperties = properties.filter(property => property.isActive !== false);

  return (
    <div className={styles.overviewTab}>
      <div className={styles.overviewGrid}>
        <div className={styles.aboutSection}>
          <h2>About Our Agency</h2>
          <p>
            {agency.description || 
              `${agency.name} is a professional real estate agency dedicated to providing exceptional service to our clients. 
              With a wide portfolio of properties, we help clients find their perfect home or investment opportunity.`}
          </p>
          
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{properties.length}</div>
              <div className={styles.statLabel}>Total Listings</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{activeProperties.length}</div>
              <div className={styles.statLabel}>Active Listings</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{featuredProperties.length}</div>
              <div className={styles.statLabel}>Featured</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{new Date().getFullYear() - new Date(agency.createdAt).getFullYear()}</div>
              <div className={styles.statLabel}>Years Experience</div>
            </div>
          </div>
        </div>
        
        {/* Featured Properties instead of Featured Agents */}
        {featuredProperties.length > 0 && (
          <div className={styles.featuredProperties}>
            <h2>Featured Properties</h2>
            <div className={styles.propertiesPreview}>
              {featuredProperties.map(property => (
                <div key={property.propertyId || property.id} className={styles.propertyPreviewCard}>
                  {property.images && property.images.length > 0 ? (
                    <img 
                      src={property.images[0]} 
                      alt={property.title}
                      className={styles.previewImage}
                    />
                  ) : (
                    <div className={styles.previewImagePlaceholder}>
                      <FaHome />
                    </div>
                  )}
                  <div className={styles.previewInfo}>
                    <h4>{property.title}</h4>
                    <p className={styles.previewPrice}>${property.price?.toLocaleString()}</p>
                    <p className={styles.previewLocation}>{property.city || property.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Agency Credentials Section */}
      <div className={styles.credentialsSection}>
        <h2>Agency Credentials</h2>
        <div className={styles.credentialsList}>
          {agency.licenseNumber && (
            <div className={styles.credentialItem}>
              <FaCheckCircle className={styles.credentialIcon} />
              <div>
                <strong>License Number:</strong> {agency.licenseNumber}
              </div>
            </div>
          )}
          {agency.isActive !== false && (
            <div className={styles.credentialItem}>
              <FaCheckCircle className={styles.credentialIcon} />
              <div>
                <strong>Status:</strong> Active & Verified
              </div>
            </div>
          )}
          <div className={styles.credentialItem}>
            <FaCheckCircle className={styles.credentialIcon} />
            <div>
              <strong>Established:</strong> {new Date(agency.createdAt).getFullYear()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Properties Tab Component
function PropertiesTab({ properties }) {
  const navigate = useNavigate();

  return (
    <div className={styles.propertiesTab}>
      <h2>Our Property Portfolio</h2>
      
      {properties.length === 0 ? (
        <div className={styles.emptyState}>
          <FaHome className={styles.emptyIcon} />
          <h3>No Properties Listed</h3>
          <p>This agency hasn't listed any properties yet.</p>
        </div>
      ) : (
        <div className={styles.propertiesGrid}>
          {properties.map(property => (
            <div 
              key={property.propertyId || property.id} 
              className={styles.propertyCard}
              onClick={() => navigate(`/properties/${property.propertyId || property.id}`)}
            >
              {property.images && property.images.length > 0 ? (
                <img 
                  src={property.images[0]} 
                  alt={property.title}
                  className={styles.propertyImage}
                />
              ) : (
                <div className={styles.propertyImagePlaceholder}>
                  <FaHome />
                </div>
              )}
              
              <div className={styles.propertyInfo}>
                <h3 className={styles.propertyTitle}>{property.title}</h3>
                <p className={styles.propertyAddress}>
                  <FaMapMarkerAlt /> {property.address}
                </p>
                
                <div className={styles.propertyDetails}>
                  <span className={styles.propertyPrice}>
                    ${property.price?.toLocaleString()}
                  </span>
                  <span className={styles.propertyType}>
                    {property.propertyType || property.type}
                  </span>
                  {property.isFeatured && (
                    <span className={styles.featuredBadge}>
                      <FaStar /> Featured
                    </span>
                  )}
                </div>
                
                <div className={styles.propertyFeatures}>
                  {property.bedrooms && <span>{property.bedrooms} beds</span>}
                  {property.bathrooms && <span>{property.bathrooms} baths</span>}
                  {property.area && <span>{property.area} sq ft</span>}
                </div>

                {/* Agent information for the property */}
                {(property.agentName || property.agentPhone || property.agentLicense) && (
                  <div className={styles.agentContact}>
                    <h4>Contact Agent:</h4>
                    {property.agentName && <p><strong>{property.agentName}</strong></p>}
                    {property.agentPhone && <p><FaPhone /> {property.agentPhone}</p>}
                    {property.agentLicense && <p>License: {property.agentLicense}</p>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// New Credentials Tab Component
function CredentialsTab({ agency }) {
  return (
    <div className={styles.credentialsTab}>
      <h2>Agency Credentials & Information</h2>
      
      <div className={styles.credentialsGrid}>
        <div className={styles.credentialSection}>
          <h3>Licensing & Certification</h3>
          {agency.licenseNumber ? (
            <div className={styles.credentialItem}>
              <FaCheckCircle className={styles.verifiedIcon} />
              <div>
                <strong>Real Estate License:</strong> {agency.licenseNumber}
              </div>
            </div>
          ) : (
            <p>No license information available.</p>
          )}
        </div>

        <div className={styles.credentialSection}>
          <h3>Contact Information</h3>
          {agency.contactEmail && (
            <div className={styles.contactDetail}>
              <FaEnvelope />
              <strong>Email:</strong> {agency.contactEmail}
            </div>
          )}
          {agency.contactPhone && (
            <div className={styles.contactDetail}>
              <FaPhone />
              <strong>Phone:</strong> {agency.contactPhone}
            </div>
          )}
          {agency.website && (
            <div className={styles.contactDetail}>
              <FaGlobe />
              <strong>Website:</strong> 
              <a href={agency.website} target="_blank" rel="noopener noreferrer">
                {agency.website}
              </a>
            </div>
          )}
          {agency.city && (
            <div className={styles.contactDetail}>
              <FaMapMarkerAlt />
              <strong>Location:</strong> {agency.city}
            </div>
          )}
        </div>

        <div className={styles.credentialSection}>
          <h3>Agency Details</h3>
          <div className={styles.contactDetail}>
            <FaBuilding />
            <strong>Established:</strong> {new Date(agency.createdAt).toLocaleDateString()}
          </div>
          <div className={styles.contactDetail}>
            <FaCheckCircle />
            <strong>Status:</strong> {agency.isActive === false ? 'Inactive' : 'Active'}
          </div>
        </div>
      </div>
    </div>
  );
}