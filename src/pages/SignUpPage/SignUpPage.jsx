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
    userType: "individual", // individual, agency, investor
    // Agency-specific fields (conditionally shown)
    agencyName: "",
    agencyLicense: "",
    agencyDescription: "",
    agencyPhone: "",
    agencyWebsite: ""
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

  const handleUserTypeChange = (userType) => {
    setFormData(prev => ({
      ...prev,
      userType,
      // Reset agency fields when switching away from agency type
      ...(userType !== 'agency' && {
        agencyName: "",
        agencyLicense: "",
        agencyDescription: "",
        agencyPhone: "",
        agencyWebsite: ""
      })
    }));
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all required fields.");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }

    // Agency-specific validation
    if (formData.userType === 'agency') {
      if (!formData.agencyName || !formData.agencyLicense) {
        setError("Agency name and license number are required for agency registration.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("🟡 Step 1: Starting registration with user type:", formData.userType);

      // 1. Prepare registration data based on user type
      const registrationData = {
        email: formData.email,
        password: formData.password,
        profile: {
          firstName: formData.firstName || '',
          lastName: formData.lastName || '',
          phone: formData.phone || '',
          bio: ''
        }
      };

      // Add agency data if user is registering as agency
      if (formData.userType === 'agency') {
        registrationData.agency = {
          name: formData.agencyName,
          licenseNumber: formData.agencyLicense,
          description: formData.agencyDescription,
          contactPhone: formData.agencyPhone,
          website: formData.agencyWebsite
        };
      }

      console.log("🟡 Sending registration request:", registrationData);
      
      // 2. Register the user
      const registerResponse = await API.users.register(registrationData);
      console.log("🟢 Registration successful - full response:", registerResponse);

      // 3. Login to get token
      console.log("🟡 Step 2: Attempting login");
      const loginResponse = await API.auth.login({
        email: formData.email,
        password: formData.password
      });

      console.log("🟢 Login successful:", loginResponse.data);

      if (!loginResponse.data?.token) {
        throw new Error("Login after registration failed - no token received");
      }

      const { token, userId, roles, email } = loginResponse.data;
      const decodedToken = jwtDecode(token);
      
      console.log("🟡 Decoded token:", decodedToken);

      // 4. Extract user ID
      let extractedUserId;
      if (userId) {
        extractedUserId = userId;
      } else if (decodedToken.id) {
        extractedUserId = decodedToken.id;
      } else if (decodedToken.userId) {
        extractedUserId = decodedToken.userId;
      } else if (decodedToken.sub) {
        try {
          const userResponse = await API.users.getCurrent();
          extractedUserId = userResponse.data.id;
        } catch (userError) {
          console.warn("Could not get user ID from API, using token sub:", decodedToken.sub);
          extractedUserId = decodedToken.sub;
        }
      } else {
        throw new Error("Could not extract user ID from token");
      }

      console.log("🟡 Extracted user ID:", extractedUserId);
     
      // 5. Update auth context
      await new Promise(resolve => {
        login({
          email: email || formData.email,
          roles: roles || decodedToken.roles || ["ROLE_USER"],
          id: extractedUserId,
          token: token
        }, token);
        setTimeout(resolve, 100);
      });

      // 6. Success message based on user type
      let successMessage = "Registration successful!";
      if (formData.userType === 'agency') {
        successMessage += " Your agency is pending verification.";
      } else if (formData.userType === 'investor') {
        successMessage += " Complete your investor profile to get started.";
      }

      setSuccess(successMessage);
      
      // 7. Start trial for all user types
      try {
        console.log("🟡 Starting trial...");
        await API.trial.start();
        console.log("🟢 Trial started successfully");
      } catch (trialError) {
        console.warn("🟡 Trial start failed:", trialError);
      }

      setTimeout(() => {
        navigate("/profile", { replace: true });
      }, 2000);

    } catch (error) {
      console.error("🔴 FULL REGISTRATION ERROR:", error);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.response) {
        console.error("🔴 Response details:", error.response);
        
        if (error.response.status === 400) {
          errorMessage = error.response.data?.error || error.response.data?.message || "Invalid registration data. Please check your information.";
        } else if (error.response.status === 409) {
          errorMessage = "Email already exists. Please use a different email.";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 py-8">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">CREATE ACCOUNT</h2>
        <p className="text-center text-gray-600 mb-6">
          Join us to start your real estate journey
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Type Selection */}
          <div className="border-b pb-4">
            <label className="block text-gray-700 font-semibold mb-3">
              I am a: <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleUserTypeChange('individual')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  formData.userType === 'individual'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                }`}
              >
                <div className="font-semibold">🏠 Private Owner</div>
                <div className="text-sm mt-1">List & manage your properties</div>
              </button>

              <button
                type="button"
                onClick={() => handleUserTypeChange('agency')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  formData.userType === 'agency'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                }`}
              >
                <div className="font-semibold">🏢 Agency</div>
                <div className="text-sm mt-1">Professional real estate agency</div>
              </button>

              <button
                type="button"
                onClick={() => handleUserTypeChange('investor')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  formData.userType === 'investor'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                }`}
              >
                <div className="font-semibold">💰 Investor</div>
                <div className="text-sm mt-1">Find investment opportunities</div>
              </button>
            </div>
          </div>

          {/* Required Fields */}
          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label htmlFor="phone" className="block text-gray-700 font-semibold mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+381 123 456 789"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-gray-700 font-semibold mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="First name"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-gray-700 font-semibold mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          {/* Agency-specific fields (conditionally shown) */}
          {formData.userType === 'agency' && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Agency Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="agencyName" className="block text-gray-700 font-semibold mb-1">
                    Agency Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="agencyName"
                    name="agencyName"
                    value={formData.agencyName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your agency name"
                  />
                </div>

                <div>
                  <label htmlFor="agencyLicense" className="block text-gray-700 font-semibold mb-1">
                    License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="agencyLicense"
                    name="agencyLicense"
                    value={formData.agencyLicense}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="REA-123456"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="agencyDescription" className="block text-gray-700 font-semibold mb-1">
                  Agency Description
                </label>
                <textarea
                  id="agencyDescription"
                  name="agencyDescription"
                  value={formData.agencyDescription}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of your agency..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="agencyPhone" className="block text-gray-700 font-semibold mb-1">
                    Agency Phone
                  </label>
                  <input
                    type="tel"
                    id="agencyPhone"
                    name="agencyPhone"
                    value={formData.agencyPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+381 123 456 789"
                  />
                </div>

                <div>
                  <label htmlFor="agencyWebsite" className="block text-gray-700 font-semibold mb-1">
                    Agency Website
                  </label>
                  <input
                    type="url"
                    id="agencyWebsite"
                    name="agencyWebsite"
                    value={formData.agencyWebsite}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://youragency.com"
                  />
                </div>
              </div>
            </div>
          )}

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
                `Create ${formData.userType === 'agency' ? 'Agency' : formData.userType === 'investor' ? 'Investor' : ''} Account`
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
            <strong>Free Trial:</strong> Get 6 months free premium features for all account types!
          </p>
        </div>
      </div>
    </div>
  );
}