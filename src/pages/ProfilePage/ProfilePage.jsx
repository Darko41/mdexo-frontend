import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from '../../utils/api/api';
import { AuthContext } from '../../context/AuthContext';
import ConfirmationModal from "../../components/Common/ConfirmationModal";
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
  FaInfoCircle,
  FaTrash,
  FaExclamationTriangle
} from "react-icons/fa";
import ProfessionalUpgradeCard from "../../components/Agent/ProfessionalUpgradeCard";
import styles from './styles.module.css';

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState({ firstName: '', lastName: '', phone: '', bio: '' });
  const [ownedAgencies, setOwnedAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  
  const { isAuthenticated, user: authUser, refreshUserData } = useContext(AuthContext);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
      
      // Use getCurrent() instead of getById() for current user
      const userResponse = await API.users.getCurrent();
      const userData = userResponse.data;
      setUserData(userData);
      
      // Set profile data - handle different response structure
      if (userData?.profile) {
        setProfileData(userData.profile);
      } else if (userData?.firstName || userData?.lastName) {
        // Handle case where profile fields are at root level
        setProfileData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || '',
          bio: userData.bio || ''
        });
      } else {
        setProfileData({ firstName: '', lastName: '', phone: '', bio: '' });
      }

      // Fetch owned agencies if user is agency admin
      if (userData?.roles?.includes('ROLE_AGENCY_ADMIN')) {
        try {
          // Use getMyAgency for agency admin
          const myAgencyResponse = await API.agencies.getMyAgency();
          if (myAgencyResponse.data) {
            setOwnedAgencies([myAgencyResponse.data]);
          } else {
            setOwnedAgencies([]);
          }
        } catch (error) {
          console.warn("Could not fetch owned agencies:", error);
          setOwnedAgencies([]);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      
      // Use the current user endpoint for updates
      await API.users.update(authUser.id, {
        profile: profileData
      });
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      fetchUserData();
      
      // Refresh auth context data
      if (refreshUserData) {
        refreshUserData();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile: " + (error.response?.data?.error || error.message));
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

  const handleDeleteAccount = async () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    setShowDeleteModal(false);
    
    if (!authUser?.id) return;
    
    try {
      // Use the current user deletion endpoint
      await API.users.delete(authUser.id);
      setSuccess('Account deleted successfully.');
      
      // Clear local storage and redirect
      setTimeout(() => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
        window.location.href = '/';
      }, 2000);
      
    } catch (error) {
      console.error("Error deleting account:", error);
      setError('Failed to delete account: ' + (error.response?.data?.error || error.message));
    }
  };

  // Check user roles
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
              <span className={styles.userBadge}>
                <FaUser /> User
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

          {/* Agency Management Section (Agency Admins only) */}
          {isAgencyAdmin && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <FaBuilding className={styles.cardIcon} />
                  <h2>Agency Management</h2>
                </div>
                
                <button 
                  className={styles.primaryBtn}
                  onClick={() => navigate('/agencies/create')}
                >
                  <FaPlus /> Create New Agency
                </button>
              </div>

              <div className={styles.agencySection}>
                <h3 className={styles.sectionTitle}>Agencies You Manage</h3>
                {ownedAgencies.length === 0 ? (
                  <div className={styles.emptyState}>
                    <FaBuilding className={styles.emptyIcon} />
                    <h4>No Agencies Created</h4>
                    <p>Create your first agency to establish your real estate brand.</p>
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
                            <FaHome className={styles.statIcon} />
                            <span>0 Properties</span>
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

              {/* Agency Limits Information */}
              <div className={styles.agencyLimitsInfo}>
                <FaInfoCircle className={styles.infoIcon} />
                <div>
                  <strong>Agency Information:</strong>
                  <ul>
                    <li>Agency admins can create and manage <strong>multiple agencies</strong></li>
                    <li>Each agency has its own properties and settings</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Account Deletion Section */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <FaExclamationTriangle className={styles.dangerIcon} />
                <h2>Account Management</h2>
              </div>
            </div>
            
            <div className={styles.dangerZone}>
              <div className={styles.dangerWarning}>
                <FaExclamationTriangle className={styles.warningIcon} />
                <h3>Danger Zone</h3>
              </div>
              
              <p className={styles.dangerDescription}>
                <strong>Permanent account deletion</strong> - This action cannot be undone.
                {isAgencyAdmin && ownedAgencies.length > 0 && (
                  <span className={styles.agencyWarning}>
                    ⚠️ You are an admin of {ownedAgencies.length} agency/agencies. 
                    These will be permanently deleted along with your account.
                  </span>
                )}
              </p>
              
              <ul className={styles.deletionList}>
                <li>Your profile information will be permanently removed</li>
                <li>All your property listings will be deleted</li>
                {isAgencyAdmin && ownedAgencies.length > 0 && (
                  <li>Your {ownedAgencies.length} agency/agencies will be permanently deleted</li>
                )}
                <li>This action cannot be reversed</li>
              </ul>
              
              <button 
                className={styles.deleteAccountBtn}
                onClick={handleDeleteAccount}
              >
                <FaTrash /> Delete My Account
              </button>
            </div>
          </div>
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

          {/* User Benefits Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <FaStar className={styles.cardIcon} />
                <h2>User Benefits</h2>
              </div>
            </div>
            <div className={styles.benefitsList}>
              <div className={styles.benefitItem}>
                <FaChartLine className={styles.benefitIcon} />
                <span>Property Management Dashboard</span>
              </div>
              <div className={styles.benefitItem}>
                <FaUsers className={styles.benefitIcon} />
                <span>Contact Property Owners</span>
              </div>
              <div className={styles.benefitItem}>
                <FaCrown className={styles.benefitIcon} />
                <span>Featured Listings</span>
              </div>
              {isAgencyAdmin && (
                <div className={styles.benefitItem}>
                  <FaBuilding className={styles.benefitIcon} />
                  <span>Agency Management Tools</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteAccount}
        title="Delete Your Account"
        message={
          isAgencyAdmin && ownedAgencies.length > 0 
            ? `You are an admin of ${ownedAgencies.length} agency/agencies. All agencies, properties, and account data will be permanently deleted.`
            : "This will permanently delete your account, all your properties, and remove you from any agencies."
        }
        confirmText="Delete My Account"
        type="danger"
        agencyCount={isAgencyAdmin ? ownedAgencies.length : 0}
      />
    </div>
  );
}