import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import styles from './styles.module.css';

export default function Header() {
    const { 
        user, 
        isAuthenticated, 
        logout, 
        userProfile, 
        isProfileComplete 
    } = useContext(AuthContext);
    
    const navigate = useNavigate();
    const [isVerifying, setIsVerifying] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isAdmin = user?.roles?.includes("ROLE_ADMIN");

    const handleLogout = async () => {
	    try {
	        await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
	            method: 'POST',
	            credentials: 'include'
	        });
	    } catch (error) {
	        // Silent error handling
	    } finally {
	        logout();
	        navigate("/login"); // Redirect to frontend login
	    }
	};

    const getWelcomeName = () => {
        if (userProfile?.firstName) {
            return userProfile.firstName;
        }
        
        if (user?.email) {
            return user.email.split('@')[0];
        }
        
        return 'User';
    };

    const hasIncompleteProfile = !isProfileComplete();

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.navContainer}>
                    {/* Left: Navigation Links */}
                    <div className={styles.leftSection}>
                        {/* Desktop Navigation */}
                        <nav className={styles.leftNav}>
                            <Link to="/buy" className={styles.navLink}>
                                Buy
                            </Link>
                            <Link to="/rent" className={styles.navLink}>
                                Rent
                            </Link>
                            <Link to="/sell" className={styles.navLink}>
                                Sell
                            </Link>
                        </nav>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={styles.mobileMenuButton}
                        >
                            <svg className={styles.menuIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Center: Logo - BIGGER SIZE */}
                    <div className={styles.centerLogo}>
                        <Link to="/" className={styles.logo}>
                            <img 
                                src="/cover.png" 
                                alt="RealEstate Logo" 
                                className={styles.logoImage}
                                onError={(e) => {
                                    e.target.src = "/default.png";
                                }}
                            />
                        </Link>
                    </div>

                    {/* Right: Auth Section */}
                    <div className={styles.rightAuth}>
                        {isAuthenticated ? (
                            <div className={styles.userSection}>
                                {isAdmin && (
                                    <Link
                                        to="/admin"
                                        className={styles.adminButton}
                                    >
                                        Admin Panel
                                    </Link>
                                )}
                                
                                <Link 
                                    to="/profile" 
                                    className={styles.profileLink}
                                    title={hasIncompleteProfile ? "Complete your profile" : "View profile"}
                                >
                                    <span className={styles.welcomeText}>
                                        Hi, {getWelcomeName()}
                                    </span>
                                    {hasIncompleteProfile && (
                                        <span className={styles.incompleteProfileBadge}>!</span>
                                    )}
                                </Link>
                                
                                <button
                                    onClick={handleLogout}
                                    className={styles.logoutButton}
                                >
                                    Log Out
                                </button>
                            </div>
                        ) : (
                            <div className={styles.authButtons}>
                                <Link to="/login" className={styles.signInButton}>
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className={styles.mobileMenu}>
                        <nav className={styles.mobileNav}>
                            <Link 
                                to="/buy" 
                                className={styles.mobileNavLink}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Buy Properties
                            </Link>
                            <Link 
                                to="/rent" 
                                className={styles.mobileNavLink}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Rent Properties
                            </Link>
                            <Link 
                                to="/sell" 
                                className={styles.mobileNavLink}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Sell Properties
                            </Link>
                            
                            {isAuthenticated && isAdmin && (
                                <Link
                                    to="/admin"
                                    className={styles.mobileAdminButton}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Admin Panel
                                </Link>
                            )}
                            
                            {isAuthenticated && (
                                <Link 
                                    to="/profile" 
                                    className={styles.mobileNavLink}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    My Profile
                                    {hasIncompleteProfile && (
                                        <span className={styles.mobileBadge}>!</span>
                                    )}
                                </Link>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}