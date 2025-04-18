import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Correct import

export default function PrijavaPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  const isDevelopment = import.meta.env.MODE === 'development';
  const apiUrl = isDevelopment
    ? "http://localhost:8080/api/authenticate"
    : "https://mdexo-backend.onrender.com/api/authenticate";

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Log the start of the function to check if it's triggered
    console.log("Handle Submit triggered");

    if (email && password) {
      try {
        // Log before the fetch request to ensure it's being triggered
        console.log("Sending fetch request to:", apiUrl);

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        // Check if the response is ok
        console.log("Fetch response status:", response.status); // Log the status

        const data = await response.json();
        console.log("Fetch response data:", data); // Log the response data

        if (response.ok) {
          const token = data.token;
          console.log("JWT Token:", token); // Log the token for debugging

          // Store the token
          localStorage.setItem("jwtToken", token); // Store the token

          // Decode the JWT token using jwt_decode
          const decodedToken = jwtDecode(token);
          console.log("Decoded Token:", decodedToken); // Log the decoded token

          // Extract roles from the decoded token (optional, since roles are in the response)
          const roles = decodedToken.roles || data.roles || [];
          console.log("Roles:", roles); // Log roles for debugging

          // **Check if the user is an admin and has the right role**
          if (Array.isArray(roles) && roles.includes("ROLE_ADMIN")) {
            console.log("User is an admin, redirecting to the dashboard...");

            // If user is an admin, redirect to admin dashboard
            if (isDevelopment) {
              window.open("http://localhost:8080/admin/dashboard"); // Open admin dashboard for dev
              window.location.href = "/"; // Redirect to home page after
            } else {
              window.open("https://mdexo-backend.onrender.com/admin/dashboard"); // Open admin dashboard for production
              window.location.href = "/"; // Redirect to home page after
            }
          } else {
            // If not an admin, navigate to home page
            setError("You don't have permission to access the admin dashboard.");
            navigate("/"); // Redirect to home page for non-admins
          }

          setError(null); // Reset any errors
        } else {
          console.log("Invalid credentials error response:", data); // Log if invalid credentials
          setError("Invalid credentials"); // Display error if authentication fails
        }
      } catch (error) {
        console.error("Error occurred:", error);
        setError("An error occurred. Please try again.");
      }
    } else {
      setError("Please fill in both email and password.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">ПРИЈАВА</h2>

        {error && (
          <div className="bg-red-500 text-white text-center p-2 mb-4 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="rememberMe" className="ml-2 text-gray-700">Remember me</label>
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Log In
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <span className="text-gray-600">Don&apost have an account? </span>
          <Link to="/signup" className="text-blue-600 hover:text-blue-800">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
