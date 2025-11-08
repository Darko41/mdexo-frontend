import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from '../../utils/api/api';
import { AuthContext } from '../../context/AuthContext';
import { 
  FaUser, 
  FaEnvelope, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaHome, 
  FaPhone,
  FaIdCard,
  FaCrown,
  FaChartLine,
  FaStar,
  FaUsers,
  FaCheckCircle,
  FaBuilding,
  FaAward,
  FaSignOutAlt,
  FaPlus,
  FaExternalLinkAlt,
  FaInfoCircle
} from "react-icons/fa";
import ProfessionalUpgradeCard from "../../components/Agent/ProfessionalUpgradeCard";
import styles from './styles.module.css';

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState({ firstName: '', lastName: '', phone: '', bio: '' });
  const [agencyMemberships, setAgencyMemberships] = useState([]);
  const [ownedAgencies, setOwnedAgencies] = useState([]);
  const [hasActiveAgency, setHasActiveAgency] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  
  const { isAuthenticated, user: authUser, refreshUserData } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/profile' }});
      return;
    }
    fetchUserData();
  }, [isAuthenticated, navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      if (authUser?.id) {
        // Fetch user data
        const userResponse = await API.users.getById(authUser.id);
        setUserData(userResponse.data);
        
        // Set profile data
        if (userResponse.data?.profile) {
          setProfileData(userResponse.data.profile);
        } else {
          setProfileData({ firstName: '', lastName: '', phone: '', bio: '' });
        }

        // Fetch agency memberships if user is an agent
        if (userResponse.data?.roles?.includes('ROLE_AGENT')) {
          try {
            const membershipsResponse = await API.agencies.getMyMemberships();
            const memberships = membershipsResponse.data || [];
            setAgencyMemberships(memberships);
            
            // CHECK: If user has active agency membership
            const activeMembership = memberships.find(m => m.status === 'ACTIVE');
            setHasActiveAgency(!!activeMembership);
          } catch (error) {
            console.error('Error fetching agency memberships:', error);
            setAgencyMemberships([]);
            setHasActiveAgency(false);
          }
        }

        // Fetch owned agencies if user is agency admin
        if (userResponse.data?.roles?.includes('ROLE_AGENCY_ADMIN')) {
          try {
            const agenciesResponse = await API.agencies.getAll();
            const userOwnedAgencies = agenciesResponse.data.filter(agency => 
              agency.admin?.id === authUser.id
            );
            setOwnedAgencies(userOwnedAgencies);
          } catch (error) {
            console.error('Error fetching owned agencies:', error);
            setOwnedAgencies([]);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      if (authUser?.id) {
        await API.users.update(authUser.id, {
          profile: profileData
        });
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        fetchUserData();
        refreshUserData();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLeaveAgency = async (agencyId) => {
    if (!window.confirm('Are you sure you want to leave this agency?')) {
      return;
    }

    try {
      await API.agencies.leaveAgency(agencyId);
      setSuccess('Successfully left the agency.');
      fetchUserData();
    } catch (error) {
      setError('Failed to leave agency: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCancelApplication = async (membershipId) => {
    if (!window.confirm('Are you sure you want to cancel this agency application?')) {
      return;
    }

    try {
      await API.agencies.cancelApplication(membershipId);
      setSuccess('Application cancelled successfully.');
      fetchUserData();
    } catch (error) {
      setError('Failed to cancel application: ' + (error.response?.data?.message || error.message));
    }
  };
  
  const isAgent = userData?.roles?.includes('ROLE_AGENT');
  const isAgencyAdmin = userData?.roles?.includes('ROLE_AGENCY_ADMIN');

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Loading your profile...</p>
    </div>
  );

  if (error && !userData) return (
    <div className={styles.errorContainer}>
      <h3>Unable to Load Profile</h3>
      <p>{error}</p>
      <button onClick={fetchUserData}>Try Again</button>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>
            <FaUser />
          </div>
          <div className={styles.userInfo}>
            <h1>
              {profileData.firstName || profileData.lastName 
                ? `${profileData.firstName} ${profileData.lastName}` 
                : 'Complete Your Profile'
              }
            </h1>
            <p className={styles.email}>{userData?.email}</p>
            <div className={styles.roleBadges}>
              {isAgencyAdmin && (
                <span className={styles.agencyAdminBadge}>
                  <FaBuilding /> Agency Admin
                </span>
              )}
              {isAgent && (
                <span className={styles.agentBadge}>
                  <FaAward /> Professional Agent
                </span>
              )}
              <span className={styles.userBadge}>
                <FaUser /> {isAgent ? 'Verified User' : 'Basic User'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {success && (
        <div className={styles.success}>
          <FaCheckCircle /> {success}
        </div>
      )}
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.contentGrid}>
        {/* Left Column - Profile & Professional Tools */}
        <div className={styles.leftColumn}>
          {/* Profile Information Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <FaIdCard className={styles.cardIcon} />
                <h2>Profile Information</h2>
              </div>
              {!isEditing ? (
                <button 
                  className={styles.editBtn}
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit /> Edit Profile
                </button>
              ) : (
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.saveBtn}
                    onClick={handleSave} 
                    disabled={updating}
                  >
                    <FaSave /> {updating ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    className={styles.cancelBtn}
                    onClick={() => setIsEditing(false)}
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              )}
            </div>

            <div className={styles.profileForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.firstName || ''}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                      className={styles.input}
                    />
                  ) : (
                    <p className={profileData.firstName ? styles.value : styles.placeholder}>
                      {profileData.firstName || 'Not provided'}
                    </p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.lastName || ''}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                      className={styles.input}
                    />
                  ) : (
                    <p className={profileData.lastName ? styles.value : styles.placeholder}>
                      {profileData.lastName || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label><FaEnvelope className={styles.fieldIcon} /> Email Address</label>
                <p className={styles.value}>{userData?.email}</p>
                <span className={styles.verifiedBadge}>Verified</span>
              </div>

              <div className={styles.formGroup}>
                <label><FaPhone className={styles.fieldIcon} /> Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className={styles.input}
                  />
                ) : (
                  <p className={profileData.phone ? styles.value : styles.placeholder}>
                    {profileData.phone || 'Not provided'}
                  </p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Bio</label>
                {isEditing ? (
                  <textarea
                    value={profileData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself, your interests, or your professional background..."
                    rows="4"
                    className={styles.textarea}
                  />
                ) : (
                  <p className={profileData.bio ? styles.value : styles.placeholder}>
                    {profileData.bio || 'No bio provided'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Agency Memberships Card (for agents) */}
          {isAgent && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <FaBuilding className={styles.cardIcon} />
                  <h2>My Agency</h2>
                </div>
                
                {/* Show different button based on membership status */}
                {!hasActiveAgency ? (
                  <button 
                    className={styles.primaryBtn}
                    onClick={() => navigate('/agencies')}
                  >
                    <FaPlus /> Join an Agency
                  </button>
                ) : (
                  <span className={styles.agencyLimitBadge}>
                    ✓ One Agency Maximum
                  </span>
                )}
              </div>

              {agencyMemberships.length === 0 ? (
                <div className={styles.emptyState}>
                  <FaBuilding className={styles.emptyIcon} />
                  <h3>Not Currently with an Agency</h3>
                  <p>Join an agency to access professional resources, shared leads, and brand recognition. You can be a member of one agency at a time.</p>
                  <button 
                    className={styles.ctaButton}
                    onClick={() => navigate('/agencies')}
                  >
                    Browse Agencies to Join
                  </button>
                  
                  <div className={styles.agencyLimitInfo}>
                    <FaInfoCircle className={styles.infoIcon} />
                    <span>Agents are limited to one primary agency at a time</span>
                  </div>
                </div>
              ) : (
                <div className={styles.membershipsList}>
                  {/* Show active membership first */}
                  {agencyMemberships
                    .sort((a, b) => {
                      // Active memberships first, then pending
                      if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
                      if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
                      return 0;
                    })
                    .map(membership => (
                    <div key={membership.id} className={styles.membershipCard}>
                      <div className={styles.membershipHeader}>
                        <div className={styles.agencyInfo}>
                          <h4>{membership.agency?.name}</h4>
                          <span className={`${styles.membershipStatus} ${styles[membership.status?.toLowerCase()]}`}>
                            {membership.status === 'ACTIVE' ? 'Primary Agency' : membership.status}
                          </span>
                        </div>
                        {membership.position && (
                          <span className={styles.memberPosition}>{membership.position}</span>
                        )}
                      </div>
                      
                      <div className={styles.membershipDetails}>
                        {membership.joinDate && (
                          <p>Member since: {new Date(membership.joinDate).toLocaleDateString()}</p>
                        )}
                        
                        {/* Show note for active membership */}
                        {membership.status === 'ACTIVE' && (
                          <div className={styles.primaryAgencyNote}>
                            <FaInfoCircle className={styles.noteIcon} />
                            <span>This is your primary agency. You must leave this agency before joining another.</span>
                          </div>
                        )}
                      </div>

                      <div className={styles.membershipActions}>
                        <button 
                          className={styles.viewAgencyBtn}
                          onClick={() => navigate(`/agencies/${membership.agency?.id}`)}
                        >
                          <FaExternalLinkAlt /> View Agency
                        </button>
                        
                        {membership.status === 'ACTIVE' && (
                          <button 
                            className={styles.leaveBtn}
                            onClick={() => handleLeaveAgency(membership.agency?.id)}
                          >
                            <FaSignOutAlt /> Leave Agency
                          </button>
                        )}
                        
                        {membership.status === 'PENDING' && (
                          <button 
                            className={styles.cancelBtn}
                            onClick={() => handleCancelApplication(membership.id)}
                          >
                            <FaTimes /> Cancel Application
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Owned Agencies Card (for agency admins) */}
          {isAgencyAdmin && (
			  <div className={styles.card}>
			    <div className={styles.cardHeader}>
			      <div className={styles.cardTitle}>
			        <FaCrown className={styles.cardIcon} />
			        <h2>My Agencies</h2>
			      </div>
			      <button 
			        className={styles.primaryBtn}
			        onClick={() => navigate('/agencies/create')}
			      >
			        <FaPlus /> Create Agency
			      </button>
			    </div>

              {ownedAgencies.length === 0 ? (
                <div className={styles.emptyState}>
                  <FaBuilding className={styles.emptyIcon} />
                  <h3>No Agencies Created</h3>
                  <p>Create your first agency to build your real estate team, manage properties, and establish your brand in the market.</p>
                  <button 
                    className={styles.ctaButton}
                    onClick={() => navigate('/agencies/create')}
                  >
                    Create Your First Agency
                  </button>
                </div>
              ) : (
                <div className={styles.agenciesList}>
                  {ownedAgencies.map(agency => (
                    <div key={agency.id} className={styles.agencyCard}>
                      <div className={styles.agencyHeader}>
                        <div className={styles.agencyBasicInfo}>
                          <h4>{agency.name}</h4>
                          <p className={styles.agencyDescription}>
                            {agency.description || 'Professional real estate agency'}
                          </p>
                        </div>
                        <span className={styles.adminBadge}>Admin</span>
                      </div>
                      
                      <div className={styles.agencyStats}>
                        <div className={styles.stat}>
                          <FaUsers className={styles.statIcon} />
                          <span>{agency.memberships?.length || 0} Team Members</span>
                        </div>
                        <div className={styles.stat}>
                          <FaHome className={styles.statIcon} />
                          <span>{/* You might want to add property count */}0 Properties</span>
                        </div>
                      </div>

                      <div className={styles.agencyActions}>
                        <button 
                          className={styles.manageBtn}
                          onClick={() => navigate(`/agencies/${agency.id}/manage`)}
                        >
                          Manage Agency
                        </button>
                        <button 
                          className={styles.viewBtn}
                          onClick={() => navigate(`/agencies/${agency.id}`)}
                        >
                          View Public Page
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Professional Upgrade Section */}
          {!isAgent && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <FaCrown className={styles.cardIcon} />
                  <h2>Professional Tools</h2>
                </div>
              </div>
              <ProfessionalUpgradeCard />
            </div>
          )}
        </div>

        {/* Right Column - Properties & Quick Actions */}
        <div className={styles.rightColumn}>
          {/* Properties Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <FaHome className={styles.cardIcon} />
                <h2>My Properties</h2>
              </div>
              <button 
                className={styles.primaryBtn}
                onClick={() => navigate('/create-listing')}
              >
                + Add Property
              </button>
            </div>
            
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <FaHome />
              </div>
              <h3>No Properties Listed</h3>
              <p>Start your real estate journey by creating your first listing</p>
              <button 
                className={styles.ctaButton}
                onClick={() => navigate('/create-listing')}
              >
                Create Your First Listing
              </button>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <FaChartLine className={styles.cardIcon} />
                <h2>Quick Stats</h2>
              </div>
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>0</div>
                <div className={styles.statLabel}>Properties</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>0</div>
                <div className={styles.statLabel}>Views</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>0</div>
                <div className={styles.statLabel}>Leads</div>
              </div>
            </div>
          </div>

          {/* Agent Benefits Card (only for agents) */}
          {isAgent && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <FaStar className={styles.cardIcon} />
                  <h2>Agent Benefits</h2>
                </div>
              </div>
              <div className={styles.benefitsList}>
                <div className={styles.benefitItem}>
                  <FaChartLine className={styles.benefitIcon} />
                  <span>Advanced Analytics Dashboard</span>
                </div>
                <div className={styles.benefitItem}>
                  <FaUsers className={styles.benefitIcon} />
                  <span>Lead Management System</span>
                </div>
                <div className={styles.benefitItem}>
                  <FaCrown className={styles.benefitIcon} />
                  <span>Featured Listings</span>
                </div>
                <div className={styles.benefitItem}>
                  <FaAward className={styles.benefitIcon} />
                  <span>Verified Professional Badge</span>
                </div>
                <div className={styles.benefitItem}>
                  <FaBuilding className={styles.benefitIcon} />
                  <span>Agency Collaboration</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}