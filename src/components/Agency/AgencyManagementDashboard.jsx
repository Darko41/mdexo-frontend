import { useState, useEffect } from 'react';
import { useParams, useNavigate, Routes, Route } from 'react-router-dom';
import { 
  FaBuilding, 
  FaUsers, 
  FaHome, 
  FaChartLine, 
  FaCog,
  FaBell,
  FaUserCheck,
  FaUserClock,
  FaArrowLeft
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

  useEffect(() => {
    fetchAgencyData();
  }, [id]);

  const fetchAgencyData = async () => {
    try {
      const response = await API.agencies.getById(id);
      setAgency(response.data);
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
            <p>Manage your agency team and listings</p>
          </div>
          
          <div className={styles.headerStats}>
            <div className={styles.stat}>
              <FaUsers className={styles.statIcon} />
              <span>{agency.memberships?.length || 0} Members</span>
            </div>
            <div className={styles.stat}>
              <FaHome className={styles.statIcon} />
              <span>0 Properties</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={styles.navigation}>
        <button 
          className={`${styles.navItem} ${activeTab === 'overview' ? styles.activeNav : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaChartLine /> Overview
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'members' ? styles.activeNav : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <FaUsers /> Team Members
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'applications' ? styles.activeNav : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          <FaUserClock /> Applications
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
        {activeTab === 'members' && <MembersTab agencyId={id} />}
        {activeTab === 'applications' && <ApplicationsTab agencyId={id} />}
        {activeTab === 'properties' && <PropertiesTab agencyId={id} />}
        {activeTab === 'settings' && <SettingsTab agency={agency} onUpdate={fetchAgencyData} />}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ agency }) {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingApplications: 0,
    totalProperties: 0
  });

  useEffect(() => {
    fetchStats();
  }, [agency]);

  const fetchStats = async () => {
    try {
      // These would come from your API
      const membersResponse = await API.agencies.getMemberships(agency.id);
      const applicationsResponse = await API.agencies.getPendingMemberships(agency.id);
      
      const activeMembers = membersResponse.data.filter(m => m.status === 'ACTIVE');
      const pendingApplications = applicationsResponse.data.length;

      setStats({
        totalMembers: membersResponse.data.length,
        activeMembers: activeMembers.length,
        pendingApplications,
        totalProperties: 0 // You would fetch this from properties API
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className={styles.overviewTab}>
      <h2>Dashboard Overview</h2>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <FaUsers className={styles.statCardIcon} />
            <h3>Team Members</h3>
          </div>
          <div className={styles.statNumber}>{stats.totalMembers}</div>
          <div className={styles.statSubtext}>{stats.activeMembers} active</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <FaUserClock className={styles.statCardIcon} />
            <h3>Pending Applications</h3>
          </div>
          <div className={styles.statNumber}>{stats.pendingApplications}</div>
          <div className={styles.statSubtext}>Awaiting review</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <FaHome className={styles.statCardIcon} />
            <h3>Properties</h3>
          </div>
          <div className={styles.statNumber}>{stats.totalProperties}</div>
          <div className={styles.statSubtext}>Active listings</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <FaChartLine className={styles.statCardIcon} />
            <h3>Performance</h3>
          </div>
          <div className={styles.statNumber}>0%</div>
          <div className={styles.statSubtext}>Growth this month</div>
        </div>
      </div>

      <div className={styles.quickActions}>
        <h3>Quick Actions</h3>
        <div className={styles.actionGrid}>
          <div className={styles.actionCard}>
            <FaUserCheck className={styles.actionIcon} />
            <h4>Review Applications</h4>
            <p>Manage pending membership requests</p>
            <button className={styles.actionButton}>
              View Applications
            </button>
          </div>

          <div className={styles.actionCard}>
            <FaUsers className={styles.actionIcon} />
            <h4>Manage Team</h4>
            <p>View and manage your agency members</p>
            <button className={styles.actionButton}>
              Manage Team
            </button>
          </div>

          <div className={styles.actionCard}>
            <FaCog className={styles.actionIcon} />
            <h4>Agency Settings</h4>
            <p>Update agency information and preferences</p>
            <button className={styles.actionButton}>
              Update Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Members Tab Component
function MembersTab({ agencyId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [agencyId]);

  const fetchMembers = async () => {
    try {
      const response = await API.agencies.getMemberships(agencyId);
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (membershipId, newPosition) => {
    try {
      await API.agencies.updateMember(membershipId, { position: newPosition });
      fetchMembers(); // Refresh list
    } catch (error) {
      console.error('Error updating member:', error);
    }
  };

  const removeMember = async (membershipId) => {
    if (!window.confirm('Are you sure you want to remove this member from the agency?')) {
      return;
    }

    try {
      await API.agencies.removeMember(membershipId);
      fetchMembers(); // Refresh list
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading team members...</div>;
  }

  return (
    <div className={styles.membersTab}>
      <div className={styles.tabHeader}>
        <h2>Team Members</h2>
        <p>Manage your agency team members and their roles</p>
      </div>

      {members.length === 0 ? (
        <div className={styles.emptyState}>
          <FaUsers className={styles.emptyIcon} />
          <h3>No Team Members</h3>
          <p>Your agency doesn't have any members yet.</p>
        </div>
      ) : (
        <div className={styles.membersList}>
          {members.map(member => (
            <div key={member.id} className={styles.memberCard}>
              <div className={styles.memberInfo}>
                <div className={styles.memberAvatar}>
                  {member.user.profile?.firstName?.[0]}{member.user.profile?.lastName?.[0]}
                </div>
                <div className={styles.memberDetails}>
                  <h4>
                    {member.user.profile?.firstName} {member.user.profile?.lastName}
                  </h4>
                  <p className={styles.memberEmail}>{member.user.email}</p>
                  <div className={styles.memberMeta}>
                    <span className={`${styles.memberStatus} ${styles[member.status?.toLowerCase()]}`}>
                      {member.status}
                    </span>
                    {member.joinDate && (
                      <span className={styles.joinDate}>
                        Joined: {new Date(member.joinDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.memberActions}>
                <div className={styles.positionSection}>
                  <label>Position:</label>
                  <select 
                    value={member.position || ''}
                    onChange={(e) => updateMemberRole(member.id, e.target.value)}
                    className={styles.positionSelect}
                  >
                    <option value="">Select Position</option>
                    <option value="Real Estate Agent">Real Estate Agent</option>
                    <option value="Senior Agent">Senior Agent</option>
                    <option value="Team Lead">Team Lead</option>
                    <option value="Broker">Broker</option>
                    <option value="Office Manager">Office Manager</option>
                  </select>
                </div>

                <div className={styles.actionButtons}>
                  <button className={styles.contactButton}>
                    Contact
                  </button>
                  {member.status === 'ACTIVE' && (
                    <button 
                      className={styles.removeButton}
                      onClick={() => removeMember(member.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Applications Tab Component
function ApplicationsTab({ agencyId }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [agencyId]);

  const fetchApplications = async () => {
    try {
      const response = await API.agencies.getPendingMemberships(agencyId);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplication = async (membershipId, action) => {
    try {
      if (action === 'approve') {
        await API.agencies.approveMembership(membershipId);
      } else {
        await API.agencies.rejectMembership(membershipId);
      }
      fetchApplications(); // Refresh list
    } catch (error) {
      console.error('Error processing application:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading applications...</div>;
  }

  return (
    <div className={styles.applicationsTab}>
      <div className={styles.tabHeader}>
        <h2>Membership Applications</h2>
        <p>Review and manage pending membership requests</p>
      </div>

      {applications.length === 0 ? (
        <div className={styles.emptyState}>
          <FaUserClock className={styles.emptyIcon} />
          <h3>No Pending Applications</h3>
          <p>There are no pending membership applications at this time.</p>
        </div>
      ) : (
        <div className={styles.applicationsList}>
          {applications.map(application => (
            <div key={application.id} className={styles.applicationCard}>
              <div className={styles.applicationInfo}>
                <div className={styles.applicantAvatar}>
                  {application.user.profile?.firstName?.[0]}{application.user.profile?.lastName?.[0]}
                </div>
                <div className={styles.applicantDetails}>
                  <h4>
                    {application.user.profile?.firstName} {application.user.profile?.lastName}
                  </h4>
                  <p className={styles.applicantEmail}>{application.user.email}</p>
                  {application.user.profile?.phone && (
                    <p className={styles.applicantPhone}>{application.user.profile.phone}</p>
                  )}
                  {application.user.profile?.bio && (
                    <p className={styles.applicantBio}>{application.user.profile.bio}</p>
                  )}
                </div>
              </div>

              <div className={styles.applicationMeta}>
                <span className={styles.applicationDate}>
                  Applied: {new Date(application.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className={styles.applicationActions}>
                <button 
                  className={styles.approveButton}
                  onClick={() => handleApplication(application.id, 'approve')}
                >
                  <FaUserCheck /> Approve
                </button>
                <button 
                  className={styles.rejectButton}
                  onClick={() => handleApplication(application.id, 'reject')}
                >
                  Reject
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
function PropertiesTab({ agencyId }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, [agencyId]);

  const fetchProperties = async () => {
    try {
      const response = await API.agencies.getProperties(agencyId);
      setProperties(response.data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
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
            <div key={property.id} className={styles.propertyCard}>
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
                <div className={property.propertyDetails}>
                  <span className={styles.propertyPrice}>${property.price?.toLocaleString()}</span>
                  <span className={styles.propertyType}>{property.type}</span>
                </div>
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

// Settings Tab Component
function SettingsTab({ agency, onUpdate }) {
  const [formData, setFormData] = useState({
    name: agency.name,
    description: agency.description,
    contactInfo: agency.contactInfo,
    logo: agency.logo
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await API.agencies.update(agency.id, formData);
      onUpdate(); // Refresh agency data
      alert('Agency settings updated successfully!');
    } catch (error) {
      console.error('Error updating agency:', error);
      alert('Failed to update agency settings.');
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
        <p>Update your agency information and preferences</p>
      </div>

      <div className={styles.settingsForm}>
        <div className={styles.formGroup}>
          <label>Agency Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows="4"
            className={styles.formTextarea}
            placeholder="Describe your agency's mission and services..."
          />
        </div>

        <div className={styles.formGroup}>
          <label>Contact Information</label>
          <input
            type="text"
            value={formData.contactInfo}
            onChange={(e) => handleInputChange('contactInfo', e.target.value)}
            className={styles.formInput}
            placeholder="Email, phone, or contact details"
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