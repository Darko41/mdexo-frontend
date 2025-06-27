import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { BACKEND_BASE_URL } from "../utils/api/api";

export default function Header() {
	const { user, logout } = useContext(AuthContext);
	const navigate = useNavigate();

	const isAdmin = user?.roles?.includes("ROLE_ADMIN");

	const handleLogout = () => {
		logout();
		navigate("/login");
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

				{/* Admin Dashboard link - open in new tab */}
				{isAdmin && (
					<a
						href={`${BACKEND_BASE_URL}/admin/dashboard`}
						target="_blank"
						rel="noopener noreferrer"
						className="text-green-600 hover:text-green-800 font-semibold"
					>
						Admin Dashboard
					</a>
				)}
			</div>

			{/* Right nav with login/signup or logout */}
			<nav className="space-x-4">
				{user ? (
					<button
						onClick={handleLogout}
						className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
					>
						Log Out
					</button>
				) : (
					<>
						<Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
							Log In
						</Link>
						<Link to="/signup" className="text-blue-600 hover:text-blue-800 font-semibold">
							Sign Up
						</Link>
					</>
				)}
			</nav>
		</header>
	);
}