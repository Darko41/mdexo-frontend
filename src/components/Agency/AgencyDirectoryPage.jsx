import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api/api';
import { AuthContext } from '../../context/AuthContext';
import { 
  FaSearch, 
  FaBuilding, 
  FaUsers, 
  FaStar, 
  FaMapMarkerAlt,
  FaFilter,
  FaPhone,
  FaEnvelope,
  FaGlobe
} from 'react-icons/fa';
import styles from './AgencyDirectory.module.css';

export default function AgencyDirectoryPage() {
  const [agencies, setAgencies] = useState([]);
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [error, setError] = useState('');

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    const fetchAgencies = async () => {
      try {
        const response = await API.agencies.getAll();
        if (isMounted) {
          setAgencies(response.data);
        }
      } catch (error) {
        if (isMounted) {
          setError('Failed to load agencies');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAgencies();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    filterAndSortAgencies();
  }, [agencies, searchTerm, sortBy]);

  const filterAndSortAgencies = () => {
    let filtered = agencies.filter(agency =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort agencies
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'city':
          return (a.city || '').localeCompare(b.city || '');
        default:
          return 0;
      }
    });

    setFilteredAgencies(filtered);
  };

  const isAgencyAdmin = user?.roles?.includes('ROLE_AGENCY_ADMIN');

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading agencies...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.heroSection}>
          <h1>Professional Real Estate Agencies</h1>
          <p>Discover trusted agencies with verified listings and professional service</p>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
            <button 
              onClick={() => setError('')}
              className={styles.closeButton}
            >
              ×
            </button>
          </div>
        )}

        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search agencies by name, description, city, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <FaFilter className={styles.filterIcon} />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="name">Sort by Name</option>
                <option value="newest">Newest First</option>
                <option value="city">Sort by City</option>
              </select>
            </div>
          </div>
        </div>

        {/* Agency Admin CTA */}
        {isAgencyAdmin && (
          <div className={styles.adminInfo}>
            <div className={styles.adminNote}>
              <FaBuilding />
              <span>You're an agency admin! Manage your agencies from your profile.</span>
              <button 
                onClick={() => navigate('/profile')}
                className={styles.profileButton}
              >
                Go to Profile
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.agenciesGrid}>
        {filteredAgencies.length === 0 ? (
          <div className={styles.emptyState}>
            <FaBuilding className={styles.emptyIcon} />
            <h3>No agencies found</h3>
            <p>Try adjusting your search terms or browse all agencies</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSortBy('name');
              }}
              className={styles.resetButton}
            >
              Show All Agencies
            </button>
          </div>
        ) : (
          filteredAgencies.map(agency => (
            <AgencyCard 
              key={agency.id} 
              agency={agency} 
              onView={() => navigate(`/agencies/${agency.id}`)}
              onContact={() => {
                if (agency.contactEmail) {
                  window.location.href = `mailto:${agency.contactEmail}`;
                }
              }}
            />
          ))
        )}
      </div>

      <div className={styles.statsSection}>
        <div className={styles.statItem}>
          <FaBuilding className={styles.statIcon} />
          <div className={styles.statContent}>
            <h3>{agencies.length}</h3>
            <p>Professional Agencies</p>
          </div>
        </div>
        <div className={styles.statItem}>
          <FaStar className={styles.statIcon} />
          <div className={styles.statContent}>
            <h3>100%</h3>
            <p>Verified Listings</p>
          </div>
        </div>
        <div className={styles.statItem}>
          <FaMapMarkerAlt className={styles.statIcon} />
          <div className={styles.statContent}>
            <h3>{new Set(agencies.filter(a => a.city).map(a => a.city)).size}</h3>
            <p>Cities Covered</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Agency Card Component - Simplified without agent functionality
function AgencyCard({ agency, onView, onContact }) {
  const hasContactInfo = agency.contactEmail || agency.contactPhone || agency.website;

  return (
    <div className={styles.agencyCard}>
      <div className={styles.cardHeader}>
        {agency.logo ? (
          <img src={agency.logo} alt={agency.name} className={styles.logo} />
        ) : (
          <div className={styles.logoPlaceholder}>
            <FaBuilding />
          </div>
        )}
        <div className={styles.agencyInfo}>
          <h3 className={styles.agencyName}>{agency.name}</h3>
          {agency.city && (
            <p className={styles.agencyLocation}>
              <FaMapMarkerAlt /> {agency.city}
            </p>
          )}
          {agency.admin?.profile?.firstName && (
            <p className={styles.agencyAdmin}>
              Admin: {agency.admin.profile.firstName} {agency.admin.profile.lastName}
            </p>
          )}
        </div>
      </div>

      <div className={styles.cardBody}>
        <p className={styles.agencyDescription}>
          {agency.description || 'Professional real estate agency providing exceptional service.'}
        </p>
        
        <div className={styles.agencyMeta}>
          {agency.contactEmail && (
            <div className={styles.metaItem}>
              <FaEnvelope className={styles.metaIcon} />
              <span>{agency.contactEmail}</span>
            </div>
          )}
          {agency.contactPhone && (
            <div className={styles.metaItem}>
              <FaPhone className={styles.metaIcon} />
              <span>{agency.contactPhone}</span>
            </div>
          )}
          {agency.website && (
            <div className={styles.metaItem}>
              <FaGlobe className={styles.metaIcon} />
              <span>{agency.website}</span>
            </div>
          )}
        </div>

        {agency.licenseNumber && (
          <div className={styles.licenseInfo}>
            <span className={styles.licenseBadge}>
              License: {agency.licenseNumber}
            </span>
          </div>
        )}
      </div>

      <div className={styles.cardFooter}>
        <button className={styles.viewButton} onClick={onView}>
          View Details
        </button>
        
        {hasContactInfo && (
          <button 
            className={styles.contactButton}
            onClick={onContact}
            disabled={!agency.contactEmail}
          >
            Contact Agency
          </button>
        )}
        
        {/* Agency Status */}
        {agency.isActive === false && (
          <span className={styles.inactiveBadge}>
            Currently Inactive
          </span>
        )}
      </div>
    </div>
  );
}