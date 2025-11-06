import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from '../../utils/api/api';
import { AuthContext } from '../../context/AuthContext';
import { FaUser, FaEnvelope, FaEdit, FaSave, FaTimes, FaHome } from "react-icons/fa";
import styles from './styles.module.css';

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState({ firstName: '', lastName: '', phone: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  
  const { isAuthenticated, user: authUser } = useContext(AuthContext);
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
        const userResponse = await API.users.getById(authUser.id);
        setUserData(userResponse.data);
        
        try {
          const profileResponse = await API.users.getProfile(authUser.id);
          setProfileData(profileResponse.data);
        } catch {
          // Profile doesn't exist yet, keep empty values
        }
      }
    } catch (error) {
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      if (authUser?.id) {
        await API.users.updateProfile(authUser.id, profileData);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        fetchUserData();
      }
    } catch (error) {
      setError("Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

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
      <div className={styles.header}>
        <div className={styles.avatar}>
          <FaUser />
        </div>
        <div>
          <h1>{profileData.firstName || profileData.lastName ? `${profileData.firstName} ${profileData.lastName}` : 'Complete Your Profile'}</h1>
          <p>{userData?.email}</p>
        </div>
      </div>

      {success && <div className={styles.success}>{success}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2><FaUser /> Profile Information</h2>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)}><FaEdit /> Edit</button>
          ) : (
            <div>
              <button onClick={handleSave} disabled={updating}><FaSave /> {updating ? 'Saving...' : 'Save'}</button>
              <button onClick={() => setIsEditing(false)}><FaTimes /> Cancel</button>
            </div>
          )}
        </div>

        <div className={styles.form}>
          <div className={styles.formRow}>
            <div>
              <label>First Name</label>
              {isEditing ? (
                <input
                  name="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                  placeholder="First name"
                />
              ) : (
                <p>{profileData.firstName || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label>Last Name</label>
              {isEditing ? (
                <input
                  name="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                  placeholder="Last name"
                />
              ) : (
                <p>{profileData.lastName || 'Not provided'}</p>
              )}
            </div>
          </div>

          <div>
            <label><FaEnvelope /> Email</label>
            <p>{userData?.email}</p>
          </div>

          <div>
            <label>Phone</label>
            {isEditing ? (
              <input
                name="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                placeholder="Phone number"
              />
            ) : (
              <p>{profileData.phone || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label>Bio</label>
            {isEditing ? (
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                placeholder="Tell us about yourself..."
                rows="3"
              />
            ) : (
              <p>{profileData.bio || 'No bio provided'}</p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2><FaHome /> My Properties</h2>
          <button onClick={() => navigate('/create-listing')}>+ Add Property</button>
        </div>
        <div className={styles.emptyState}>
          <FaHome />
          <p>You haven't listed any properties yet.</p>
          <button onClick={() => navigate('/create-listing')}>Create Your First Listing</button>
        </div>
      </div>
    </div>
  );
}