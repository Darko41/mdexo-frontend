import { useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../../context/AuthContext";
import API from '../../utils/api/api';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useContext(AuthContext);

  // Get the return URL from location state, default to home
  const from = location.state?.from || '/';
  const message = location.state?.message;
  const requireProfile = location.state?.requireProfile;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in both email and password.");
      setLoading(false);
      return;
    }

    try { 
      const response = await API.auth.login({ email, password });

      const { token, roles } = response.data;
      const decodedToken = jwtDecode(token);
      
      const user = {
        id: decodedToken.userId || decodedToken.sub, // Ensure we have user ID
        email: decodedToken.sub || email,
        roles: roles || decodedToken.roles || [],
      };

      // ADD AWAIT HERE - this is crucial!
      await login(user, token);
      
      // Check if we need to redirect to profile completion
      if (requireProfile) {
        navigate('/profile', { 
          state: { 
            from: from,
            message: 'Please complete your profile to continue'
          },
          replace: true 
        });
      } else {
        // Navigate to intended destination
        navigate(from, { replace: true });
      }

    } catch (error) {
      let errorMessage = "Login failed. Please try again.";
      
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = "Access forbidden. Please check your credentials.";
        } else if (error.response.status === 401) {
          errorMessage = "Invalid email or password.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message.includes("CORS")) {
        errorMessage = "Cross-origin request blocked. Please contact support.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clear error when user starts typing
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 py-8">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔑</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">ПРИЈАВА</h2>
          <p className="text-gray-600">Welcome back! Please sign in to your account.</p>
        </div>

        {/* Show the custom message if provided */}
        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 text-center p-3 mb-4 rounded-md">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-md flex items-start">
            <span className="mr-2">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <label htmlFor="rememberMe" className="ml-2 text-gray-700">
                Remember me
              </label>
            </div>
            
            <Link 
              to="/forgot-password" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <Link 
              to="/signup" 
              className="text-blue-600 hover:text-blue-800 font-medium"
              state={location.state} // Pass along the state to signup page
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Demo credentials hint (remove in production) */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            Demo: Use your registered email and password
          </p>
        </div>
      </div>
    </div>
  );
}