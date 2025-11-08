import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaBuilding, 
  FaChartLine, 
  FaCog, 
  FaHome,
  FaUserShield,
  FaClipboardList
} from 'react-icons/fa';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
        <p>Manage your real estate platform and users</p>
      </div>

      {/* Stats Overview */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaUsers />
          </div>
          <div className={styles.statContent}>
            <h3>1,254</h3>
            <p>Total Users</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaBuilding />
          </div>
          <div className={styles.statContent}>
            <h3>42</h3>
            <p>Agencies</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaHome />
          </div>
          <div className={styles.statContent}>
            <h3>892</h3>
            <p>Properties</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaUserShield />
          </div>
          <div className={styles.statContent}>
            <h3>15</h3>
            <p>Agents</p>
          </div>
        </div>
      </div>

      {/* Admin Tools Grid */}
      <div className={styles.toolsSection}>
        <h2>Admin Tools</h2>
        <div className={styles.toolsGrid}>
          {/* User Management */}
          <Link to="/admin/users" className={styles.toolCard}>
            <div className={styles.toolIcon}>
              <FaUsers />
            </div>
            <div className={styles.toolContent}>
              <h3>User Management</h3>
              <p>Manage user roles, promote agents, and oversee user accounts</p>
              <span className={styles.toolAction}>Manage Users →</span>
            </div>
          </Link>

          {/* Agency Management */}
          <div className={styles.toolCard}>
            <div className={styles.toolIcon}>
              <FaBuilding />
            </div>
            <div className={styles.toolContent}>
              <h3>Agency Management</h3>
              <p>View all agencies, manage memberships, and oversee agency operations</p>
              <span className={styles.toolAction}>Coming Soon</span>
            </div>
          </div>

          {/* Platform Analytics */}
          <div className={styles.toolCard}>
            <div className={styles.toolIcon}>
              <FaChartLine />
            </div>
            <div className={styles.toolContent}>
              <h3>Platform Analytics</h3>
              <p>View platform statistics, growth metrics, and performance insights</p>
              <span className={styles.toolAction}>Coming Soon</span>
            </div>
          </div>

          {/* Content Moderation */}
          <div className={styles.toolCard}>
            <div className={styles.toolIcon}>
              <FaClipboardList />
            </div>
            <div className={styles.toolContent}>
              <h3>Content Moderation</h3>
              <p>Review and manage property listings, user reports, and platform content</p>
              <span className={styles.toolAction}>Coming Soon</span>
            </div>
          </div>

          {/* System Settings */}
          <div className={styles.toolCard}>
            <div className={styles.toolIcon}>
              <FaCog />
            </div>
            <div className={styles.toolContent}>
              <h3>System Settings</h3>
              <p>Configure platform settings, features, and system preferences</p>
              <span className={styles.toolAction}>Coming Soon</span>
            </div>
          </div>

          {/* Reports */}
          <div className={styles.toolCard}>
            <div className={styles.toolIcon}>
              <FaChartLine />
            </div>
            <div className={styles.toolContent}>
              <h3>Reports & Exports</h3>
              <p>Generate reports, export data, and analyze platform performance</p>
              <span className={styles.toolAction}>Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h2>Quick Actions</h2>
        <div className={styles.actionButtons}>
          <Link to="/admin/users" className={styles.actionBtn}>
            <FaUsers /> Manage Users
          </Link>
          <button className={styles.actionBtn}>
            <FaUserShield /> Promote to Agent
          </button>
          <button className={styles.actionBtn}>
            <FaBuilding /> Create Agency
          </button>
        </div>
      </div>
    </div>
  );
}