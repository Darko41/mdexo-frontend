import { FaChartLine, FaStar, FaClock, FaHeadset } from "react-icons/fa";
import styles from './styles.module.css';

export default function CTA({ 
  title,
  description,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryClick,
  onSecondaryClick,
  stats, // Make stats required since they're different everywhere
  disabled = false,
  theme = 'default' // Optional: 'default', 'rent', 'sell' for different colors
}) {
  return (
    <div className={styles.ctaSection}>
      <div className={`${styles.ctaContainer} ${styles[theme]}`}>
        <div className={styles.ctaHeader}>
          <h3 className={styles.ctaTitle}>{title}</h3>
          <p className={styles.ctaDescription}>{description}</p>
        </div>
        
        <div className={styles.ctaButtons}>
          <button
            onClick={onPrimaryClick}
            className={styles.primaryButton}
            disabled={disabled}
          >
            {primaryButtonText}
          </button>
          
          <button 
            onClick={onSecondaryClick}
            className={styles.secondaryButton}
          >
            {secondaryButtonText}
          </button>
        </div>
        
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className={styles.statItem}>
                <IconComponent className={styles.statIcon} />
                <div className={styles.statNumber}>{stat.number}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}