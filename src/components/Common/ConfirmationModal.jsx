import { FaExclamationTriangle, FaTimes, FaTrash, FaBuilding, FaHome, FaUser } from 'react-icons/fa';
import styles from './ConfirmationModal.module.css';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Deletion",
  message,
  confirmText = "Delete Account",
  cancelText = "Cancel",
  type = "danger",
  agencyCount = 0
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.titleSection}>
            <div className={`${styles.icon} ${styles[type]}`}>
              <FaExclamationTriangle />
            </div>
            <h2>{title}</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.message}>{message}</p>
          
          {agencyCount > 0 && (
            <div className={styles.detailsSection}>
              <h4>What will be deleted:</h4>
              <div className={styles.deletionList}>
                <div className={styles.deletionItem}>
                  <FaUser className={styles.itemIcon} />
                  <span>Your profile and account data</span>
                </div>
                <div className={styles.deletionItem}>
                  <FaHome className={styles.itemIcon} />
                  <span>All your property listings</span>
                </div>
                <div className={styles.deletionItem}>
                  <FaBuilding className={styles.itemIcon} />
                  <span>
                    <strong>{agencyCount} agency/agencies</strong> you administrate
                  </span>
                </div>
                <div className={styles.deletionItem}>
                  <FaTimes className={styles.itemIcon} />
                  <span>Your membership in any agencies</span>
                </div>
              </div>
            </div>
          )}

          <div className={styles.warningBox}>
            <FaExclamationTriangle className={styles.warningIcon} />
            <div>
              <strong>This action cannot be undone</strong>
              <p>All data will be permanently removed from our servers</p>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button 
            className={styles.cancelButton}
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className={`${styles.confirmButton} ${styles[type]}`}
            onClick={onConfirm}
          >
            <FaTrash />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}