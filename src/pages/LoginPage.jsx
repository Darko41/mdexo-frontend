import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../context/AuthContext";
import API from '../utils/api/api.js';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);


  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  console.log("Handle Submit triggered");

  if (!email || !password) {
    setError("Please fill in both email and password.");
    return;
  }

  try {
    const response = await API.auth.login({ email, password });
    console.log("Login response:", response.data); // Debug log

    const { token, roles } = response.data;
    const decodedToken = jwtDecode(token);
    
    const user = {
      email: decodedToken.sub || email,
      roles: roles || decodedToken.roles || [],
    };

    console.log("Calling login with:", { user, token }); // Debug log
    login(user, token);
    
    // Ensure state is updated before redirect
    await new Promise(resolve => setTimeout(resolve, 50));
    
    navigate("/", { replace: true });

  } catch (error) {
    console.log("ERROR OCCURRED:", {
      step: "Caught in catch block",
      error: error,
      response: error.response,
    });

    let errorMessage = "Login failed. Please try again.";
    
    if (error.response) {
      if (error.response.status === 403) {
        errorMessage = "Access forbidden. Please check your credentials.";
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.message.includes("Network Error")) {
      errorMessage = "Network error. Please check your connection.";
    } else if (error.message.includes("CORS")) {
      errorMessage = "Cross-origin request blocked. Please contact support.";
    }

    console.log("Setting error message:", errorMessage);
    setError(errorMessage);
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
            <label htmlFor="rememberMe" className="ml-2 text-gray-700">
              Remember me
            </label>
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
          <span className="text-gray-600">Don&apos;t have an account? </span>
          <Link to="/signup" className="text-blue-600 hover:text-blue-800">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}