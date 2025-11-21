import { useState, useEffect } from 'react';
import { useParams, useNavigate, Routes, Route } from 'react-router-dom';
import { 
  FaBuilding, 
  FaUsers, 
  FaHome, 
  FaChartLine, 
  FaCog,
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaMapMarkerAlt
} from 'react-icons/fa';
import API from '../../utils/api/api';
import styles from './AgencyManagement.module.css';

// Main Dashboard Layout
export default function AgencyManagementDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAgencyData();
  }, [id]);

  const fetchAgencyData = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await API.agencies.getById(id);
      setAgency(response.data);
    } catch (error) {
      setError('Failed to load agency data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading agency management...</p>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className={styles.errorContainer}>
        <h2>Agency Not Found</h2>
        <p>You don't have permission to manage this agency or it doesn't exist.</p>
        <button onClick={() => navigate('/agencies')} className={styles.backButton}>
          Back to Agencies
        </button>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => navigate(`/agencies/${id}`)} className={styles.backButton}>
          <FaArrowLeft /> Back to Public Page
        </button>
        
        <div className={styles.headerContent}>
          <div className={styles.agencyInfo}>
            <h1>{agency.name} - Management</h1>
            <p>Manage your agency information and listings</p>
          </div>
          
          <div className={styles.headerStats}>
            <div className={styles.stat}>
              <FaBuilding className={styles.statIcon} />
              <span>Agency Details</span>
            </div>
            <div className={styles.stat}>
              <FaHome className={styles.statIcon} />
              <span>0 Properties</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation - Simplified without members/applications */}
      <div className={styles.navigation}>
        <button 
          className={`${styles.navItem} ${activeTab === 'overview' ? styles.activeNav : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaChartLine /> Overview
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'properties' ? styles.activeNav : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          <FaHome /> Properties
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'settings' ? styles.activeNav : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <FaCog /> Settings
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {activeTab === 'overview' && <OverviewTab agency={agency} />}
        {activeTab === 'properties' && <PropertiesTab agencyId={id} />}
        {activeTab === 'settings' && <SettingsTab agency={agency} onUpdate={fetchAgencyData} />}
      </div>
    </div>
  );
}

// Overview Tab Component - Simplified without member stats
function OverviewTab({ agency }) {
  const [stats, setStats] = useState({
    totalProperties: 0,
    featuredProperties: 0,
    activeProperties: 0
  });
  
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [agency]);

  const fetchStats = async () => {
    try {
      setError(null);
      // Fetch agency properties to get stats
      const propertiesResponse = await API.agencies.getProperties(agency.id);
      const properties = propertiesResponse.data || [];
      
      const activeProperties = properties.filter(p => p.isActive !== false);
      const featuredProperties = properties.filter(p => p.isFeatured === true);

      setStats({
        totalProperties: properties.length,
        activeProperties: activeProperties.length,
        featuredProperties: featuredProperties.length
      });
    } catch (error) {
      setError('Failed to load statistics');
    }
  };

  return (
    <div className={styles.overviewTab}>
      <h2>Dashboard Overview</h2>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <FaHome className={styles.statCardIcon} />
            <h3>Total Properties</h3>
          </div>
          <div className={styles.statNumber}>{stats.totalProperties}</div>
          <div className={styles.statSubtext}>All listings</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <FaChartLine className={styles.statCardIcon} />
            <h3>Active Properties</h3>
          </div>
          <div className={styles.statNumber}>{stats.activeProperties}</div>
          <div className={styles.statSubtext}>Currently listed</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <FaBuilding className={styles.statCardIcon} />
            <h3>Featured</h3>
          </div>
          <div className={styles.statNumber}>{stats.featuredProperties}</div>
          <div className={styles.statSubtext}>Premium listings</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <FaCog className={styles.statCardIcon} />
            <h3>Agency Status</h3>
          </div>
          <div className={styles.statNumber}>{agency.isActive ? 'Active' : 'Inactive'}</div>
          <div className={styles.statSubtext}>Agency status</div>
        </div>
      </div>

      {/* Agency Information Section */}
      <div className={styles.agencyDetails}>
        <h3>Agency Information</h3>
        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <strong>Name:</strong> {agency.name}
          </div>
          <div className={styles.detailItem}>
            <strong>Description:</strong> {agency.description || 'No description provided'}
          </div>
          {agency.contactEmail && (
            <div className={styles.detailItem}>
              <strong>Contact Email:</strong> {agency.contactEmail}
            </div>
          )}
          {agency.contactPhone && (
            <div className={styles.detailItem}>
              <strong>Contact Phone:</strong> {agency.contactPhone}
            </div>
          )}
          {agency.website && (
            <div className={styles.detailItem}>
              <strong>Website:</strong> {agency.website}
            </div>
          )}
          {agency.licenseNumber && (
            <div className={styles.detailItem}>
              <strong>License:</strong> {agency.licenseNumber}
            </div>
          )}
          {agency.city && (
            <div className={styles.detailItem}>
              <strong>Location:</strong> {agency.city}
            </div>
          )}
        </div>
      </div>

      <div className={styles.quickActions}>
        <h3>Quick Actions</h3>
        <div className={styles.actionGrid}>
          <div className={styles.actionCard}>
            <FaHome className={styles.actionIcon} />
            <h4>Manage Properties</h4>
            <p>View and manage your agency property listings</p>
            <button className={styles.actionButton}>
              View Properties
            </button>
          </div>

          <div className={styles.actionCard}>
            <FaCog className={styles.actionIcon} />
            <h4>Agency Settings</h4>
            <p>Update agency information and contact details</p>
            <button className={styles.actionButton}>
              Update Settings
            </button>
          </div>

          <div className={styles.actionCard}>
            <FaBuilding className={styles.actionIcon} />
            <h4>Public Page</h4>
            <p>View how your agency appears to the public</p>
            <button className={styles.actionButton}>
              View Public Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Properties Tab Component
function PropertiesTab({ agencyId }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, [agencyId]);

  const fetchProperties = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await API.agencies.getProperties(agencyId);
      setProperties(response.data || []);
    } catch (error) {
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading properties...</div>;
  }

  return (
    <div className={styles.propertiesTab}>
      <div className={styles.tabHeader}>
        <h2>Agency Properties</h2>
        <p>Manage properties listed under your agency</p>
      </div>

      {properties.length === 0 ? (
        <div className={styles.emptyState}>
          <FaHome className={styles.emptyIcon} />
          <h3>No Properties Listed</h3>
          <p>Your agency hasn't listed any properties yet.</p>
        </div>
      ) : (
        <div className={styles.propertiesList}>
          {properties.map(property => (
            <div key={property.propertyId || property.id} className={styles.propertyCard}>
              <div className={styles.propertyImage}>
                {property.images && property.images.length > 0 ? (
                  <img src={property.images[0]} alt={property.title} />
                ) : (
                  <div className={styles.propertyImagePlaceholder}>
                    <FaHome />
                  </div>
                )}
              </div>
              
              <div className={styles.propertyInfo}>
                <h4>{property.title}</h4>
                <p className={styles.propertyAddress}>{property.address}</p>
                <div className={styles.propertyDetails}>
                  <span className={styles.propertyPrice}>${property.price?.toLocaleString()}</span>
                  <span className={styles.propertyType}>{property.propertyType}</span>
                  {property.isFeatured && (
                    <span className={styles.featuredBadge}>Featured</span>
                  )}
                </div>
                {/* Agent information fields for agency admin */}
                {(property.agentName || property.agentPhone || property.agentLicense) && (
                  <div className={styles.agentInfo}>
                    <h5>Responsible Agent:</h5>
                    {property.agentName && <p><strong>Name:</strong> {property.agentName}</p>}
                    {property.agentPhone && <p><strong>Phone:</strong> {property.agentPhone}</p>}
                    {property.agentLicense && <p><strong>License:</strong> {property.agentLicense}</p>}
                  </div>
                )}
              </div>

              <div className={styles.propertyActions}>
                <button className={styles.editButton}>Edit</button>
                <button className={styles.viewButton}>View</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Settings Tab Component - Enhanced with more agency fields
function SettingsTab({ agency, onUpdate }) {
  const [formData, setFormData] = useState({
    name: agency.name || '',
    description: agency.description || '',
    contactEmail: agency.contactEmail || '',
    contactPhone: agency.contactPhone || '',
    website: agency.website || '',
    licenseNumber: agency.licenseNumber || '',
    city: agency.city || '',
    logo: agency.logo || ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    try {
      setError(null);
      setSuccess(false);
      setSaving(true);
      await API.agencies.update(agency.id, formData);
      onUpdate();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError('Failed to update agency settings: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className={styles.settingsTab}>
      <div className={styles.tabHeader}>
        <h2>Agency Settings</h2>
        <p>Update your agency information and contact details</p>
      </div>

      {success && (
        <div className={styles.successMessage}>
          Agency settings updated successfully!
        </div>
      )}

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.settingsForm}>
        <div className={styles.formGroup}>
          <label>Agency Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={styles.formInput}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows="4"
            className={styles.formTextarea}
            placeholder="Describe your agency's mission, services, and expertise..."
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Contact Email</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              className={styles.formInput}
              placeholder="contact@agency.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Contact Phone</label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              className={styles.formInput}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className={styles.formInput}
              placeholder="https://youragency.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label>License Number</label>
            <input
              type="text"
              value={formData.licenseNumber}
              onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
              className={styles.formInput}
              placeholder="REA-123456"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>City/Location</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className={styles.formInput}
            placeholder="New York, NY"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Logo URL</label>
          <input
            type="url"
            value={formData.logo}
            onChange={(e) => handleInputChange('logo', e.target.value)}
            className={styles.formInput}
            placeholder="https://example.com/logo.png"
          />
          {formData.logo && (
            <div className={styles.logoPreview}>
              <img src={formData.logo} alt="Logo preview" className={styles.previewImage} />
            </div>
          )}
        </div>

        <div className={styles.formActions}>
          <button 
            onClick={handleSave}
            disabled={saving}
            className={styles.saveButton}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}