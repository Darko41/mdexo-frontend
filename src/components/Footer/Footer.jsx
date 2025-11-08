import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaHome,
  FaUserShield,
  FaServer,
  FaShieldAlt, // Use FaShieldAlt instead of FaShield
  FaHeart
} from 'react-icons/fa';
import styles from './Footer.module.css';

export default function Footer() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const currentYear = new Date().getFullYear();

  const handleBackendAdmin = () => {
    if (!isAdmin) {
      alert('Access denied');
      return;
    }
    
    const adminUrl = `${import.meta.env.VITE_BACKEND_URL}/admin/dashboard`;
    window.open(adminUrl, '_blank');
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        {/* Main Footer Content */}
        <div className={styles.footerContent}>
          
          {/* Company Info */}
          <div className={styles.footerSection}>
            <div className={styles.logoSection}>
              <img 
                src="/cover.png" 
                alt="RealEstate Pro" 
                className={styles.footerLogo}
                onError={(e) => {
                  e.target.src = "/default.png";
                }}
              />
            </div>
            <p className={styles.companyDescription}>
              Your trusted partner in real estate. Connecting buyers, sellers, and agents 
              with the perfect properties across the country.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                <FaLinkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>Quick Links</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="/buy" className={styles.footerLink}>Buy Properties</Link></li>
              <li><Link to="/rent" className={styles.footerLink}>Rent Properties</Link></li>
              <li><Link to="/sell" className={styles.footerLink}>Sell Property</Link></li>
              <li><Link to="/agencies" className={styles.footerLink}>Find Agencies</Link></li>
              <li><Link to="/help" className={styles.footerLink}>Help Center</Link></li>
            </ul>
          </div>

          {/* For Agents */}
          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>For Agents</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="/profile" className={styles.footerLink}>Agent Dashboard</Link></li>
              <li><Link to="/agencies" className={styles.footerLink}>Join an Agency</Link></li>
              <li><Link to="/create-listing" className={styles.footerLink}>List a Property</Link></li>
              <li><Link to="/resources" className={styles.footerLink}>Agent Resources</Link></li>
              <li><Link to="/training" className={styles.footerLink}>Training & Support</Link></li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>Contact Info</h3>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <FaMapMarkerAlt className={styles.contactIcon} />
                <span>123 Real Estate Ave, Suite 100<br />New York, NY 10001</span>
              </div>
              <div className={styles.contactItem}>
                <FaPhone className={styles.contactIcon} />
                <span>+1 (555) 123-REAL</span>
              </div>
              <div className={styles.contactItem}>
                <FaEnvelope className={styles.contactIcon} />
                <span>info@realestatepro.com</span>
              </div>
            </div>
            
            <div className={styles.legalLinks}>
              <Link to="/privacy" className={styles.legalLink}>Privacy Policy</Link>
              <Link to="/terms" className={styles.legalLink}>Terms of Service</Link>
              <Link to="/cookies" className={styles.legalLink}>Cookie Policy</Link>
            </div>

            {/* Hidden Backend Admin Link */}
            {isAdmin && (
              <div className={styles.adminSection}>
                <button
                  onClick={handleBackendAdmin}
                  className={styles.adminLink}
                >
                  <FaServer className={styles.adminIcon} />
                  Backend Admin
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.footerBottom}>
          <div className={styles.bottomContent}>
            <div className={styles.copyright}>
              <FaShieldAlt className={styles.shieldIcon} /> {/* Changed to FaShieldAlt */}
              <span>&copy; {currentYear} RealEstate Pro. All rights reserved.</span>
            </div>
            <div className={styles.bottomLinks}>
              <span className={styles.madeWith}>
                Made with <FaHeart className={styles.heartIcon} /> for home seekers {/* Added heart icon */}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}