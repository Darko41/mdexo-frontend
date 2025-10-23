import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { BACKEND_BASE_URL } from "../../utils/api/api";

export default function Header() {
    const { user, isAuthenticated, logout, token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isVerifying, setIsVerifying] = useState(false);

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
                credentials: 'include' // Important for session cookies if using mixed auth
            });
            
            if (response.ok) {
                // Access verified - open admin dashboard
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
        // Quick client-side check first
        if (!isAdmin) {
            alert('Access denied');
            return;
        }
        
        // Backend verification before opening admin dashboard
        await verifyAdminAccess();
    };

    return (
        <header className="bg-white shadow p-4 flex justify-between items-center">
            {/* Left nav with logo + Buy, Rent, Sell links */}
            <div className="flex items-center space-x-6">
                <Link to="/" className="text-xl font-bold text-blue-600 hover:text-blue-800">
                    MyApp
                </Link>

                <Link to="/buy" className="text-blue-600 hover:text-amber-300 transition-colors font-semibold">
                    Buy
                </Link>
                <Link to="/rent" className="text-blue-600 hover:text-amber-300 transition-colors font-semibold">
                    Rent
                </Link>
                <Link to="/sell" className="text-blue-600 hover:text-amber-300 transition-colors font-semibold">
                    Sell
                </Link>

                {/* Admin Dashboard link */}
                {isAdmin && (
                    <button
                        onClick={handleAdminAccess}
                        disabled={isVerifying}
                        className={`font-semibold bg-transparent border-none cursor-pointer ${
                            isVerifying 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-green-600 hover:text-green-800'
                        }`}
                    >
                        {isVerifying ? 'Verifying...' : 'Admin Dashboard'}
                    </button>
                )}
            </div>

            {/* Right nav with login/signup or logout */}
            <nav className="space-x-4">
                {isAuthenticated ? (
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600 hidden md:inline">
                            Welcome, {user?.email || 'User'}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                        >
                            Log Out
                        </button>
                    </div>
                ) : (
                    <div className="flex space-x-4">
                        <Link 
                            to="/login" 
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            Log In
                        </Link>
                        <Link 
                            to="/signup" 
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                        >
                            Sign Up
                        </Link>
                    </div>
                )}
            </nav>
        </header>
    );
}