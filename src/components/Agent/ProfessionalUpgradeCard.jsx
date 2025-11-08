import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ProfessionalUpgradeForm from './ProfessionalUpgradeForm';
import styles from './styles.module.css';

export default function ProfessionalUpgradeCard() {
  const [showForm, setShowForm] = useState(false);
  const { user } = useContext(AuthContext);

  // Don't show if user is already an agent
  if (user?.roles?.includes('ROLE_AGENT')) {
    return null;
  }

  if (showForm) {
    return <ProfessionalUpgradeForm onClose={() => setShowForm(false)} />;
  }

  return (
    <div className={styles.upgradeCard}>
      <div className={styles.cardHeader}>
        <h3>🏢 Go Professional</h3>
        <span className={styles.badge}>Business Tools</span>
      </div>
      
      <div className={styles.cardContent}>
        <p>Upgrade from basic listing to professional real estate tools:</p>
        
        <div className={styles.featureHighlights}>
          <div className={styles.feature}>
            <span className={styles.icon}>👑</span>
            <span>Verified Professional Profile</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.icon}>📊</span>
            <span>Advanced Analytics & Leads</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.icon}>⭐</span>
            <span>Featured Listings & Badges</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.icon}>🤝</span>
            <span>Join Agencies & Teams</span>
          </div>
        </div>

        <button 
          onClick={() => setShowForm(true)}
          className={styles.upgradeBtn}
        >
          Upgrade to Professional Agent
        </button>
        
        <p className={styles.note}>
          Continue listing properties as basic user, or upgrade for business tools.
        </p>
      </div>
    </div>
  );
}