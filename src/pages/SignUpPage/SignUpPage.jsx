import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../../context/AuthContext";
import API from '../../utils/api/api';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("🟡 Step 1: Starting registration with data:", {
        email: formData.email,
        hasPassword: !!formData.password,
        hasProfile: !!(formData.firstName || formData.lastName || formData.phone)
      });

      // 1. Register the user - SIMPLIFIED VERSION (remove profile data temporarily)
      const registrationData = {
        email: formData.email,
        password: formData.password
        // Remove roles, tier, and profile temporarily to test basic registration
      };

      console.log("🟡 Sending registration request:", registrationData);
      
      const registerResponse = await API.auth.register(registrationData);
      console.log("🟢 Registration successful - full response:", registerResponse);
      console.log("🟢 Response data:", registerResponse.data);

      // 2. Login to get token
      console.log("🟡 Step 2: Attempting login");
      const loginResponse = await API.auth.login({
        email: formData.email,
        password: formData.password
      });

      console.log("🟢 Login successful:", loginResponse.data);

      if (!loginResponse.data?.token) {
        throw new Error("Login after registration failed - no token received");
      }

      const { token } = loginResponse.data;
      const decodedToken = jwtDecode(token);
      
      console.log("🟡 Decoded token:", decodedToken);

      // 3. Extract user ID
      let userId;
      if (decodedToken.id) {
        userId = decodedToken.id;
      } else if (decodedToken.userId) {
        userId = decodedToken.userId;
      } else if (decodedToken.sub) {
        // Try to parse sub as ID, or get from API
        const userResponse = await API.users.getCurrent();
        userId = userResponse.data.id;
      } else {
        throw new Error("Could not extract user ID from token");
      }

      console.log("🟡 Extracted user ID:", userId);
     
      // 4. Update auth context
      await new Promise(resolve => {
        login({
          email: formData.email,
          roles: decodedToken.roles || ["ROLE_USER"],
          id: userId
        }, token);
        setTimeout(resolve, 100);
      });

      // 5. Update profile with additional data if provided
      if (formData.firstName || formData.lastName || formData.phone) {
        console.log("🟡 Step 3: Updating profile with additional data");
        try {
          await API.users.update(userId, {
            profile: {
              firstName: formData.firstName || '',
              lastName: formData.lastName || '',
              phone: formData.phone || '',
              bio: ''
            }
          });
          console.log("🟢 Profile updated successfully");
        } catch (profileError) {
          console.warn("🟡 Profile update failed (user can update later):", profileError);
        }
      }

      // 6. Success
      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => {
        navigate("/profile", { replace: true });
      }, 1500);

    } catch (error) {
      console.error("🔴 FULL REGISTRATION ERROR:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response,
        config: error.config
      });
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.response) {
        console.error("🔴 Response details:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
        
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || "Invalid registration data. Please check your information.";
        } else if (error.response.status === 409) {
          errorMessage = "Email already exists. Please use a different email.";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.request) {
        console.error("🔴 No response received:", error.request);
        errorMessage = "No response from server. Please check your internet connection.";
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (keep the rest of your JSX the same)
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 py-8">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-4">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">CREATE ACCOUNT</h2>
        <p className="text-center text-gray-600 mb-6">
          Join us to start exploring properties
        </p>

        {error && (
          <div className="bg-red-500 text-white text-center p-3 mb-4 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500 text-white text-center p-3 mb-4 rounded-md">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Required Fields */}
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-gray-700 font-semibold mb-1">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="First name"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-gray-700 font-semibold mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-gray-700 font-semibold mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+381 123 456 789"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm your password"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-blue-600 text-white py-3 rounded-md font-semibold transition-all duration-200 ${
                isSubmitting 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 text-center">
            <strong>Tip:</strong> Complete your profile with name and phone number to contact property owners directly.
          </p>
        </div>
      </div>
    </div>
  );
}