import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../utils/api/api';
import styles from './styles.module.css';

export default function ProfessionalUpgradeForm({ onClose }) {
  const [formData, setFormData] = useState({
    companyName: '',
    licenseNumber: '',
    specialties: [],
    yearsExperience: '',
    website: '',
    bio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const {user, refreshUserData} = useContext(AuthContext);

  const specialties = [
    'Residential Sales', 'Commercial', 'Rentals', 'Luxury Homes', 
    'Investment Properties', 'New Developments', 'Property Management'
  ];

  const handleSpecialtyToggle = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError('');
  
  try {
    // Use the existing promotion endpoint
    await API.users.requestAgentPromotion();
    
    // Update user profile with professional info
    await API.users.update(user.id, {
      profile: {
        ...formData,
        // Convert specialties array to string for storage
        specialties: formData.specialties.join(', ')
      }
    });
    
    setMessage('Congratulations! You are now a professional agent.');
    
    // Refresh user data to get new roles
    await refreshUserData();
    
    // Close form after success
    setTimeout(() => onClose(), 2000);
    
  } catch (error) {
    setError(error.response?.data?.message || 'Failed to upgrade account. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>🏢 Upgrade to Professional Agent</h2>
          <p>Unlock powerful tools to grow your real estate business</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Company/Brand Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                placeholder="Your real estate brand"
              />
            </div>

            <div className={styles.formGroup}>
              <label>License Number</label>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                placeholder="RE-123456 (optional)"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Years of Professional Experience</label>
            <select
              value={formData.yearsExperience}
              onChange={(e) => setFormData({...formData, yearsExperience: e.target.value})}
            >
              <option value="">Select experience</option>
              <option value="0-2">0-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="6-10">6-10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Professional Specialties</label>
            <div className={styles.specialtiesGrid}>
              {specialties.map(specialty => (
                <label key={specialty} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.specialties.includes(specialty)}
                    onChange={() => handleSpecialtyToggle(specialty)}
                  />
                  {specialty}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Website or Social Media</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Professional Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              placeholder="Tell clients about your expertise and approach..."
              rows="3"
            />
          </div>

          {message && <div className={styles.success}>{message}</div>}
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
              {isSubmitting ? 'Upgrading...' : 'Upgrade to Professional'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}