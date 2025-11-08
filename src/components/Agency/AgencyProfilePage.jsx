import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaBuilding, 
  FaUsers, 
  FaHome, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaStar,
  FaCalendar,
  FaArrowLeft,
  FaExternalLinkAlt
} from 'react-icons/fa';
import API from '../../utils/api/api';
import styles from './AgencyProfile.module.css';

export default function AgencyProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agency, setAgency] = useState(null);
  const [agents, setAgents] = useState([]);
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
      setAgency(agencyResponse.data);
      
      // Fetch agency members (agents)
      const membersResponse = await API.agencies.getMemberships(id);
      const activeAgents = membersResponse.data.filter(member => 
        member.status === 'ACTIVE'
      );
      setAgents(activeAgents);
      
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
                <FaUsers className={styles.metaIcon} />
                <span>{agents.length} Agents</span>
              </div>
              <div className={styles.metaItem}>
                <FaHome className={styles.metaIcon} />
                <span>{properties.length} Properties</span>
              </div>
              <div className={styles.metaItem}>
                <FaCalendar className={styles.metaIcon} />
                <span>Est. {new Date(agency.createdAt).getFullYear()}</span>
              </div>
            </div>
            
            {agency.contactInfo && (
              <div className={styles.contactInfo}>
                <FaEnvelope className={styles.contactIcon} />
                <span>{agency.contactInfo}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabNavigation}>
        <button 
          className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'agents' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('agents')}
        >
          Our Agents ({agents.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'properties' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          Properties ({properties.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'overview' && (
          <OverviewTab agency={agency} agents={agents} properties={properties} />
        )}
        
        {activeTab === 'agents' && (
          <AgentsTab agents={agents} />
        )}
        
        {activeTab === 'properties' && (
          <PropertiesTab properties={properties} />
        )}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ agency, agents, properties }) {
  return (
    <div className={styles.overviewTab}>
      <div className={styles.overviewGrid}>
        <div className={styles.aboutSection}>
          <h2>About Our Agency</h2>
          <p>
            {agency.description || 
              `${agency.name} is a professional real estate agency dedicated to providing exceptional service to our clients. 
              With a team of experienced agents and a wide portfolio of properties, we help clients find their perfect home 
              or investment opportunity.`}
          </p>
          
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{agents.length}</div>
              <div className={styles.statLabel}>Expert Agents</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{properties.length}</div>
              <div className={styles.statLabel}>Active Listings</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{new Date(agency.createdAt).getFullYear()}</div>
              <div className={styles.statLabel}>Years Established</div>
            </div>
          </div>
        </div>
        
        <div className={styles.featuredAgents}>
          <h2>Featured Agents</h2>
          <div className={styles.agentsPreview}>
            {agents.slice(0, 3).map(agent => (
              <div key={agent.user.id} className={styles.agentPreviewCard}>
                <div className={styles.agentAvatar}>
                  {agent.user.profile?.firstName?.[0]}{agent.user.profile?.lastName?.[0]}
                </div>
                <div className={styles.agentInfo}>
                  <h4>
                    {agent.user.profile?.firstName} {agent.user.profile?.lastName}
                  </h4>
                  <p className={styles.agentEmail}>{agent.user.email}</p>
                  {agent.position && (
                    <span className={styles.agentPosition}>{agent.position}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Agents Tab Component
function AgentsTab({ agents }) {
  return (
    <div className={styles.agentsTab}>
      <h2>Our Professional Team</h2>
      
      {agents.length === 0 ? (
        <div className={styles.emptyState}>
          <FaUsers className={styles.emptyIcon} />
          <h3>No Agents Yet</h3>
          <p>This agency hasn't added any agents to their team.</p>
        </div>
      ) : (
        <div className={styles.agentsGrid}>
          {agents.map(member => (
            <div key={member.user.id} className={styles.agentCard}>
              <div className={styles.agentHeader}>
                <div className={styles.agentAvatar}>
                  {member.user.profile?.firstName?.[0]}{member.user.profile?.lastName?.[0]}
                </div>
                <div className={styles.agentBasicInfo}>
                  <h3>{member.user.profile?.firstName} {member.user.profile?.lastName}</h3>
                  <p className={styles.agentEmail}>{member.user.email}</p>
                </div>
              </div>
              
              <div className={styles.agentDetails}>
                {member.position && (
                  <div className={styles.detailItem}>
                    <strong>Position:</strong> {member.position}
                  </div>
                )}
                {member.joinDate && (
                  <div className={styles.detailItem}>
                    <strong>Member since:</strong> {new Date(member.joinDate).toLocaleDateString()}
                  </div>
                )}
                {member.user.profile?.phone && (
                  <div className={styles.detailItem}>
                    <strong>Phone:</strong> {member.user.profile.phone}
                  </div>
                )}
              </div>
              
              <div className={styles.agentActions}>
                <button className={styles.contactButton}>
                  <FaEnvelope /> Contact
                </button>
                <button className={styles.viewProfileButton}>
                  View Profile <FaExternalLinkAlt />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
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
              key={property.id} 
              className={styles.propertyCard}
              onClick={() => navigate(`/properties/${property.id}`)}
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
                    {property.type}
                  </span>
                </div>
                
                <div className={styles.propertyFeatures}>
                  {property.bedrooms && <span>{property.bedrooms} beds</span>}
                  {property.bathrooms && <span>{property.bathrooms} baths</span>}
                  {property.area && <span>{property.area} sq ft</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}