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
			<div className="text-xl font-bold text-blue-600">
				<Link to="/">MyApp</Link>
			</div>

			<nav className="space-x-4">
				{user ? (
					<>
						{isAdmin && (
							<a
								href={`${BACKEND_BASE_URL}/admin/dashboard`}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 hover:text-blue-800 font-semibold"
							>
								Admin Dashboard
							</a>
						)}
						<button
							onClick={handleLogout}
							className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
						>
							Log Out
						</button>
					</>
				) : (
					<>
						<Link
							to="/login"
							className="text-blue-600 hover:text-blue-800 font-semibold"
						>
							Log In
						</Link>
						<Link
							to="/signup"
							className="text-blue-600 hover:text-blue-800 font-semibold"
						>
							Sign Up
						</Link>
					</>
				)}
			</nav>
		</header>
	);
}