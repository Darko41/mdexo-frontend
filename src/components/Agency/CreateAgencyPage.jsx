import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateAgencyForm from '../../components/Agency/CreateAgencyForm';
import { FaArrowLeft, FaBuilding } from 'react-icons/fa';
import styles from './AgencyManagement.module.css';

export default function CreateAgencyPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(true);

  const handleSuccess = () => {
    navigate('/profile'); // Redirect to profile after successful creation
  };

  const handleClose = () => {
    navigate('/profile'); // Go back to profile if user cancels
  };

  if (!showForm) {
    return null;
  }

  return (
    <div className={styles.createAgencyPage}>
      <div className={styles.pageHeader}>
        <button onClick={() => navigate('/profile')} className={styles.backButton}>
          <FaArrowLeft /> Back to Profile
        </button>
        
        <div className={styles.pageTitle}>
          <FaBuilding className={styles.titleIcon} />
          <h1>Create New Agency</h1>
          <p>Start your real estate agency and build your professional team</p>
        </div>
      </div>

      <div className={styles.pageContent}>
        <CreateAgencyForm onClose={handleClose} onSuccess={handleSuccess} />
      </div>
    </div>
  );
}