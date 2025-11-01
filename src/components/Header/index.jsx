import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { BACKEND_BASE_URL } from "../../utils/api/api";
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
            // Call session logout endpoint to clear admin session
            await fetch(`${BACKEND_BASE_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include' // Important for session cookies
            });
        } catch (error) {
            // Silent error handling
        } finally {
            // Always clear JWT and redirect
            logout();
            navigate("/login");
        }
    };

    const verifyAdminAccess = async () => {
        try {
            setIsVerifying(true);
            const response = await fetch(`${BACKEND_BASE_URL}/api/admin/verify`, {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            if (response.ok) {
                window.open(`${BACKEND_BASE_URL}/admin/dashboard`, '_blank');
            } else {
                alert('Admin access required');
            }
        } catch (error) {
            alert('Unable to verify admin access');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleAdminAccess = async () => {
        if (!isAdmin) {
            alert('Access denied');
            return;
        }
        await verifyAdminAccess();
    };

    // Enhanced welcome message with profile data
    const getWelcomeName = () => {
        // Priority: Profile name → Email username → Fallback
        if (userProfile?.firstName) {
            return userProfile.firstName;
        }
        
        if (user?.email) {
            return user.email.split('@')[0];
        }
        
        return 'User';
    };

    // Check if user has incomplete profile
    const hasIncompleteProfile = !isProfileComplete();

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.navContainer}>
                    {/* Left: Navigation Links (Buy, Rent, Sell) on desktop, Burger on mobile */}
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

                    {/* Center: Logo */}
                    <div className={styles.centerLogo}>
                        <Link to="/" className={styles.logo}>
                            <span className={styles.logoIcon}>🏠</span>
                            <span className={styles.logoText}>RealEstate</span>
                        </Link>
                    </div>

                    {/* Right: Auth Section - ALWAYS VISIBLE */}
                    <div className={styles.rightAuth}>
                        {isAuthenticated ? (
                            <div className={styles.userSection}>
                                {/* Admin Dashboard for authenticated admin users */}
                                {isAdmin && (
                                    <button
                                        onClick={handleAdminAccess}
                                        disabled={isVerifying}
                                        className={`${styles.adminButton} ${isVerifying ? styles.adminButtonDisabled : ''}`}
                                    >
                                        {isVerifying ? 'Verifying...' : 'Admin'}
                                    </button>
                                )}
                                
                                {/* Profile link/indicator */}
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

                {/* Mobile Navigation - Only navigation links */}
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
                            
                            {/* Add profile link to mobile menu */}
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