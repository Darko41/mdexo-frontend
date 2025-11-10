import { useState, useEffect } from 'react';
import API from '../../utils/api/api';
import styles from './UserRoleManagement.module.css';

export default function UserRoleManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await API.admin.users.getAll();
      setUsers(response.data);
    } catch (error) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const promoteToAgent = async (userId) => {
    try {
      await API.agencies.promoteToAgent(userId);
      setMessage('User promoted to agent successfully');
      fetchUsers();
    } catch (error) {
      setError('Failed to promote user');
    }
  };

  const promoteToAgencyAdmin = async (userId, agencyData) => {
  try {
    
    const response = await API.agencies.promoteToAgencyAdmin(userId, agencyData);
    
    setMessage('User promoted to agency admin successfully');
    fetchUsers();
  } catch (error) {
    setError('Failed to promote user to agency admin: ' + (error.response?.data?.message || error.message));
  }
};

  const demoteFromAgent = async (userId) => {
  try {
    await API.agencies.demoteFromAgent(userId);
    setMessage('User demoted from agent successfully');
    fetchUsers();
  } catch (error) {
    setError('Failed to demote user: ' + (error.response?.data?.message || error.message));
  }
};

  if (loading) return <div>Loading users...</div>;

  return (
    <div className={styles.userManagement}>
      <h2>User Role Management</h2>
      
      {message && <div className={styles.successMessage}>{message}</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h3>Total Users</h3>
          <p>{users.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Agents</h3>
          <p>{users.filter(u => u.roles?.includes('ROLE_AGENT')).length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Agency Admins</h3>
          <p>{users.filter(u => u.roles?.includes('ROLE_AGENCY_ADMIN')).length}</p>
        </div>
      </div>

      <div className={styles.usersGrid}>
  {users.map(user => {
    return (
      <div key={user.id} className={styles.userCard}>
        <div className={styles.userInfo}>
          <h4>
            {user.profile?.firstName} {user.profile?.lastName}
            {user.profile?.companyName && (
              <span className={styles.company}> @ {user.profile.companyName}</span>
            )}
          </h4>
          <p className={styles.email}>{user.email}</p>
          
          <div className={styles.roles}>
            {user.roles?.map(role => (
              <span key={role} className={`${styles.roleBadge} ${styles[role.toLowerCase()]}`}>
                {role.replace('ROLE_', '')}
              </span>
            ))}
          </div>

          {/* Show professional info for agents */}
          {user.roles?.includes('ROLE_AGENT') && user.profile && (
            <div className={styles.agentInfo}>
              <p><strong>Specialties:</strong> {user.profile.specialties || 'Not specified'}</p>
              <p><strong>Experience:</strong> {user.profile.yearsExperience || 'Not specified'}</p>
              {user.profile.licenseNumber && (
                <p><strong>License:</strong> {user.profile.licenseNumber}</p>
              )}
            </div>
          )}
        </div>
        
        <div className={styles.userActions}>
          {!user.roles?.includes('ROLE_AGENT') && (
            <button 
              onClick={() => promoteToAgent(user.id)}
              className={styles.btnPrimary}
            >
              Make Agent
            </button>
          )}
          
          {user.roles?.includes('ROLE_AGENT') && !user.roles?.includes('ROLE_AGENCY_ADMIN') && (
            <button 
              onClick={() => {
                const userName = user.profile?.firstName || user.email.split('@')[0];
                const agencyName = user.profile?.companyName || `${userName}'s Agency`;
                
                promoteToAgencyAdmin(user.id, { 
                  name: agencyName,
                  description: `Professional real estate agency led by ${userName}`
                });
              }}
              className={styles.btnSecondary}
            >
              Make Agency Admin
            </button>
          )}

          {user.roles?.includes('ROLE_AGENT') && (
            <button 
              onClick={() => demoteFromAgent(user.id)}
              className={styles.btnDanger}
            >
              Remove Agent
            </button>
          )}
        </div>
      </div>
    );
  })}
</div>
    </div>
  );
}