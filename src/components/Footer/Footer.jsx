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
  FaShieldAlt,
  FaHeart
} from 'react-icons/fa';
import styles from './Footer.module.css';

export default function Footer() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const currentYear = new Date().getFullYear();

  const handleBackendAdmin = () => {
    if (!isAdmin) {
      alert('Pristup odbijen');
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
              Vaš pouzdani partner na tržištu nekretnina. Povezujemo kupce, prodavce i agente
              sa savršenim nekretninama širom zemlje.
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
            <h3 className={styles.sectionTitle}>Brzi linkovi</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="/buy" className={styles.footerLink}>Kupovina nekretnina</Link></li>
              <li><Link to="/rent" className={styles.footerLink}>Iznajmljivanje nekretnina</Link></li>
              <li><Link to="/sell" className={styles.footerLink}>Prodaja nekretnina</Link></li>
              <li><Link to="/agencies" className={styles.footerLink}>Pronađite agencije</Link></li>
              <li><Link to="/help" className={styles.footerLink}>Centar za pomoć</Link></li>
            </ul>
          </div>

          {/* For Agents */}
          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>Za agente</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="/profile" className={styles.footerLink}>Kontrolna tabla</Link></li>
              <li><Link to="/agencies" className={styles.footerLink}>Pridružite se agenciji</Link></li>
              <li><Link to="/create-listing" className={styles.footerLink}>Postavite oglas</Link></li>
              <li><Link to="/resources" className={styles.footerLink}>Resursi za agente</Link></li>
              <li><Link to="/training" className={styles.footerLink}>Obuka i podrška</Link></li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>Kontakt informacije</h3>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <FaMapMarkerAlt className={styles.contactIcon} />
                <span>Bulevar kralja Aleksandra 123<br />Beograd, Srbija</span>
              </div>
              <div className={styles.contactItem}>
                <FaPhone className={styles.contactIcon} />
                <span>+381 11 123 4567</span>
              </div>
              <div className={styles.contactItem}>
                <FaEnvelope className={styles.contactIcon} />
                <span>office@iterials.com</span>
              </div>
            </div>

            <div className={styles.legalLinks}>
              <Link to="/privacy" className={styles.legalLink}>Politika privatnosti</Link>
              <Link to="/terms" className={styles.legalLink}>Uslovi korišćenja</Link>
              <Link to="/cookies" className={styles.legalLink}>Politika kolačića</Link>
            </div>

            {/* Hidden Backend Admin Link */}
            {isAdmin && (
              <div className={styles.adminSection}>
                <button
                  onClick={handleBackendAdmin}
                  className={styles.adminLink}
                >
                  <FaServer className={styles.adminIcon} />
                  Admin panel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.footerBottom}>
          <div className={styles.bottomContent}>
            <div className={styles.copyright}>
              <FaShieldAlt className={styles.shieldIcon} />
              <span>&copy; {currentYear} Iterials Core. Sva prava zadržana.</span>
            </div>
            <div className={styles.bottomLinks}>
              <span className={styles.madeWith}>
                Napravljeno sa <FaHeart className={styles.heartIcon} /> za tragaoce domova
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}