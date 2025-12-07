import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API from "../../utils/api/api";
import styles from './Header.module.css';

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [currentUserProfile, setCurrentUserProfile] = useState(null);

    const isAdmin = user?.roles?.includes("ROLE_ADMIN");

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            fetchUserProfile();
        }
    }, [isAuthenticated, user?.id]);

    const fetchUserProfile = async () => {
        try {
            const response = await API.users.getCurrent();
            const userData = response.data;

            if (userData?.profile) {
                setCurrentUserProfile(userData.profile);
            } else if (userData?.firstName || userData?.lastName) {
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
            console.log("Logout API call failed, proceeding with frontend logout");
        } finally {
            logout();
            navigate("/login");
        }
    };

    const getDisplayName = () => {
        if (currentUserProfile?.firstName && currentUserProfile?.lastName) {
            return `${currentUserProfile.firstName} ${currentUserProfile.lastName}`;
        }

        if (currentUserProfile?.firstName) {
            return currentUserProfile.firstName;
        }

        if (userProfile?.firstName && userProfile?.lastName) {
            return `${userProfile.firstName} ${userProfile.lastName}`;
        }

        if (userProfile?.firstName) {
            return userProfile.firstName;
        }

        if (user?.email) {
            return user.email.split('@')[0];
        }

        return 'Korisnik';
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
                                Prodaja
                            </Link>
                            <Link to="/rent" className={styles.navLink}>
                                Izdavanje
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
                                    title={hasIncompleteProfile ? "Kompletiraj profil" : "Pregled profila"}
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
                                    Odjavi se
                                </button>
                            </div>
                        ) : (
                            <div className={styles.authButtons}>
                                <Link to="/login" className={styles.signInButton}>
                                    Prijavi se
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
                                Prodaja nekretnina
                            </Link>
                            <Link
                                to="/rent"
                                className={styles.mobileNavLink}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Izdavanje nekretnina
                            </Link>
                            <Link
                                to="/lease"
                                className={styles.mobileNavLink}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Dugoročni najam
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
                                        Moj profil
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