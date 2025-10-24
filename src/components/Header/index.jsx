import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { BACKEND_BASE_URL } from "../../utils/api/api";
import styles from './styles.module.css';

export default function Header() {
    const { user, isAuthenticated, logout, token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isVerifying, setIsVerifying] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isAdmin = user?.roles?.includes("ROLE_ADMIN");

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const verifyAdminAccess = async () => {
        try {
            setIsVerifying(true);
            const response = await fetch(`${BACKEND_BASE_URL}/api/admin/verify`, {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            if (response.ok) {
                window.open(`${BACKEND_BASE_URL}/admin/dashboard`, '_blank');
            } else {
                alert('Admin access required');
                console.error('Admin verification failed:', response.status);
            }
        } catch (error) {
            console.error('Admin verification error:', error);
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
                                <span className={styles.welcomeText}>
                                    Hi, {user?.firstName || user?.email?.split('@')[0] || 'User'}
                                </span>
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
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}