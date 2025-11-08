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
  FaCheckCircle,
  FaUserCheck
} from 'react-icons/fa';
import styles from './AgencyDirectory.module.css';

export default function AgencyDirectoryPage() {
  const [agencies, setAgencies] = useState([]);
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [userMemberships, setUserMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAgencies();
    if (user?.roles?.includes('ROLE_AGENT')) {
      fetchUserMemberships();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortAgencies();
  }, [agencies, searchTerm, sortBy]);

  const fetchAgencies = async () => {
    try {
      const response = await API.agencies.getAll();
      setAgencies(response.data);
    } catch (error) {
      console.error('Error fetching agencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMemberships = async () => {
    try {
      const response = await API.agencies.getMyMemberships();
      setUserMemberships(response.data || []);
    } catch (error) {
      console.error('Error fetching user memberships:', error);
    }
  };

  const filterAndSortAgencies = () => {
    let filtered = agencies.filter(agency =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort agencies
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'agents':
          return (b.memberships?.length || 0) - (a.memberships?.length || 0);
        default:
          return 0;
      }
    });

    setFilteredAgencies(filtered);
  };

  const handleApplyToAgency = async (agencyId) => {
    try {
      await API.agencies.apply(agencyId);
      setMessage('Application submitted successfully!');
      fetchUserMemberships(); // Refresh memberships to show applied status
    } catch (error) {
      setError('Failed to apply to agency: ' + (error.response?.data?.message || error.message));
    }
  };

  const isUserAgent = user?.roles?.includes('ROLE_AGENT');
  const hasActiveAgency = userMemberships.some(m => m.status === 'ACTIVE');

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
          <h1>Find Your Perfect Real Estate Agency</h1>
          <p>Connect with professional agencies and their expert agents</p>
        </div>

        {message && <div className={styles.successMessage}>{message}</div>}
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search agencies by name or description..."
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
                <option value="agents">Most Agents</option>
              </select>
            </div>
          </div>
        </div>

        {/* Agent-specific info */}
        {isUserAgent && (
          <div className={styles.agentInfo}>
            {hasActiveAgency ? (
              <div className={styles.agencyLimitNote}>
                <FaCheckCircle />
                <span>You are currently with an agency. You must leave your current agency before joining another.</span>
              </div>
            ) : (
              <div className={styles.agencyLimitNote}>
                <FaUserCheck />
                <span>As an agent, you can join one agency at a time. Browse agencies below to find your perfect fit.</span>
              </div>
            )}
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
              userMemberships={userMemberships}
              isUserAgent={isUserAgent}
              hasActiveAgency={hasActiveAgency}
              onView={() => navigate(`/agencies/${agency.id}`)}
              onApply={handleApplyToAgency}
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
          <FaUsers className={styles.statIcon} />
          <div className={styles.statContent}>
            <h3>{agencies.reduce((total, agency) => total + (agency.memberships?.length || 0), 0)}</h3>
            <p>Expert Agents</p>
          </div>
        </div>
        <div className={styles.statItem}>
          <FaStar className={styles.statIcon} />
          <div className={styles.statContent}>
            <h3>100%</h3>
            <p>Verified Professionals</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Agency Card Component
function AgencyCard({ agency, userMemberships, isUserAgent, hasActiveAgency, onView, onApply }) {
  const userMembership = userMemberships?.find(m => m.agency?.id === agency.id);
  const hasApplied = userMembership?.status === 'PENDING';
  const isMember = userMembership?.status === 'ACTIVE';
  const canApply = isUserAgent && !hasActiveAgency && !hasApplied && !isMember;

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
          <p className={styles.agencyAdmin}>
            Admin: {agency.admin?.email}
          </p>
        </div>
      </div>

      <div className={styles.cardBody}>
        <p className={styles.agencyDescription}>
          {agency.description || 'Professional real estate agency providing exceptional service.'}
        </p>
        
        <div className={styles.agencyMeta}>
          <div className={styles.metaItem}>
            <FaUsers className={styles.metaIcon} />
            <span>{agency.memberships?.length || 0} Agents</span>
          </div>
          <div className={styles.metaItem}>
            <FaMapMarkerAlt className={styles.metaIcon} />
            <span>Multiple Locations</span>
          </div>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button className={styles.viewButton} onClick={onView}>
          View Agency
        </button>
        
        {/* Apply button for agents */}
        {canApply && (
          <button 
            className={styles.applyButton}
            onClick={() => onApply(agency.id)}
          >
            Apply to Join
          </button>
        )}
        
        {/* Status badges */}
        {hasApplied && (
          <span className={styles.appliedBadge}>
            <FaCheckCircle /> Application Pending
          </span>
        )}
        
        {isMember && (
          <span className={styles.memberBadge}>
            <FaUserCheck /> Current Member
          </span>
        )}
        
        {hasActiveAgency && !isMember && (
          <span className={styles.limitBadge}>
            Already with an Agency
          </span>
        )}
      </div>
    </div>
  );
}