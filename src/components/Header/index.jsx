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
                    {/* Logo and main navigation */}
                    <div className={styles.leftSection}>
                        {/* Logo */}
                        <Link to="/" className={styles.logo}>
                            <span className={styles.logoIcon}>🏠</span>
                            <span className={styles.logoText}>RealEstate</span>
                        </Link>

                        {/* Desktop Navigation - Now visible on more screens */}
                        <nav className={styles.desktopNav}>
                            <Link to="/buy" className={styles.navLink}>
                                Buy
                            </Link>
                            <Link to="/rent" className={styles.navLink}>
                                Rent
                            </Link>
                            <Link to="/sell" className={styles.navLink}>
                                Sell
                            </Link>

                            {/* Admin Dashboard */}
                            {isAdmin && (
                                <button
                                    onClick={handleAdminAccess}
                                    disabled={isVerifying}
                                    className={`${styles.adminButton} ${isVerifying ? styles.adminButtonDisabled : ''}`}
                                >
                                    {isVerifying ? 'Verifying...' : 'Admin'}
                                </button>
                            )}
                        </nav>
                    </div>

                    {/* Desktop Auth Buttons - Now visible on more screens */}
                    <div className={styles.desktopAuth}>
                        {isAuthenticated ? (
                            <div className={styles.userSection}>
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
                                <Link to="/login" className={styles.loginButton}>
                                    Log In
                                </Link>
                                <Link to="/signup" className={styles.signupButton}>
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button - Only on very small screens */}
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

                {/* Mobile Navigation - Only on very small screens */}
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

                            {isAdmin && (
                                <button
                                    onClick={() => {
                                        handleAdminAccess();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    disabled={isVerifying}
                                    className={`${styles.mobileAdminButton} ${isVerifying ? styles.mobileAdminButtonDisabled : ''}`}
                                >
                                    {isVerifying ? 'Verifying Admin Access...' : 'Admin Dashboard'}
                                </button>
                            )}

                            {/* Mobile Auth Buttons */}
                            <div className={styles.mobileAuthSection}>
                                {isAuthenticated ? (
                                    <div className={styles.mobileUserSection}>
                                        <div className={styles.mobileWelcomeText}>
                                            Welcome, {user?.firstName || user?.email?.split('@')[0] || 'User'}
                                        </div>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className={styles.mobileLogoutButton}
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                ) : (
                                    <div className={styles.mobileAuthButtons}>
                                        <Link 
                                            to="/login" 
                                            className={styles.mobileLoginButton}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Log In
                                        </Link>
                                        <Link 
                                            to="/signup" 
                                            className={styles.mobileSignupButton}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}