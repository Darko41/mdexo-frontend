import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API from "../../utils/api/api";
import styles from './styles.module.css';

export default function Header() {
    const { 
        user, 
        isAuthenticated, 
        logout, 
        userProfile, 
        isProfileComplete,
        refreshUserData 
    } = useContext(AuthContext);
    
    const navigate = useNavigate();
    const [isVerifying, setIsVerifying] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [currentUserProfile, setCurrentUserProfile] = useState(null);

    const isAdmin = user?.roles?.includes("ROLE_ADMIN");

    // Fetch user profile data when component mounts or user changes
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            fetchUserProfile();
        }
    }, [isAuthenticated, user?.id]);

    const fetchUserProfile = async () => {
        try {
            const response = await API.users.getCurrent();
            const userData = response.data;
            
            // Set the profile data for display
            if (userData?.profile) {
                setCurrentUserProfile(userData.profile);
            } else if (userData?.firstName || userData?.lastName) {
                // Handle case where profile fields are at root level
                setCurrentUserProfile({
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    phone: userData.phone || '',
                    bio: userData.bio || ''
                });
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const handleLogout = async () => {
        try {
            await API.auth.logout();
        } catch (error) {
            // Silent error handling - logout from frontend regardless
            console.log("Logout API call failed, proceeding with frontend logout");
        } finally {
            logout();
            navigate("/login"); // Redirect to frontend login
        }
    };

    const getDisplayName = () => {
        // Use the fetched profile data first
        if (currentUserProfile?.firstName && currentUserProfile?.lastName) {
            return `${currentUserProfile.firstName} ${currentUserProfile.lastName}`;
        }
        
        if (currentUserProfile?.firstName) {
            return currentUserProfile.firstName;
        }
        
        // Fallback to AuthContext profile data
        if (userProfile?.firstName && userProfile?.lastName) {
            return `${userProfile.firstName} ${userProfile.lastName}`;
        }
        
        if (userProfile?.firstName) {
            return userProfile.firstName;
        }
        
        // Final fallback to email
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
                            <Link to="/lease" className={styles.navLink}>
                                Lease
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
                                        {getDisplayName()}
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
                                to="/lease" 
                                className={styles.mobileNavLink}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Lease Properties
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
                                <>
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
                                    <div className={styles.mobileUserInfo}>
                                        <span className={styles.mobileUserName}>
                                            {getDisplayName()}
                                        </span>
                                        <span className={styles.mobileUserEmail}>
                                            {user?.email}
                                        </span>
                                    </div>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}