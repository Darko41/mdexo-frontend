import React, { createContext, useState, useCallback, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { axiosInstance } from '../utils/api/api';

export const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  loading: true,
  userProfile: null,
  loadUserProfile: () => {},
  updateUserProfile: () => {},
  refreshUserData: () => {},
  isProfileComplete: () => false,
});

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    userProfile: null,
  });

  // Use refs to track loading states without causing re-renders
  const profileLoadingRef = useRef(false);
  const initializedRef = useRef(false);

  // Helper to validate user ID
  const isValidUserId = useCallback((userId) => {
    return typeof userId === 'number' && !isNaN(userId) && userId > 0;
  }, []);

  // Load user profile from API
  // Replace the loadUserProfile function in AuthContext.jsx
const loadUserProfile = useCallback(async (force = false) => {
  if (!authState.isAuthenticated || !authState.user?.id || !authState.token) {
    return null;
  }

  if (profileLoadingRef.current && !force) {
    return null;
  }

  const userId = authState.user.id;
  if (!isValidUserId(userId)) {
    return null;
  }

  try {
    profileLoadingRef.current = true;
    
    // Use the main user endpoint instead of profile endpoint
    const response = await axiosInstance.get(`/api/users/${userId}`);
    const userData = response.data;
    const profileData = userData?.profile || { firstName: null, lastName: null, phone: null, bio: null };
    
    setAuthState(prev => ({
      ...prev,
      userProfile: profileData,
      user: {
        ...prev.user,
        ...userData
      }
    }));

    // Update localStorage
    const updatedUser = {
      ...authState.user,
      ...userData,
      profile: profileData
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));

    return profileData;
  } catch (error) {
    console.error('Error loading user profile:', error);
    // DON'T logout on profile load failure - just return empty profile
    const emptyProfile = { firstName: null, lastName: null, phone: null, bio: null };
    return emptyProfile;
  } finally {
    profileLoadingRef.current = false;
  }
}, [authState.isAuthenticated, authState.user, authState.token, isValidUserId]);

  // Update user profile locally after changes
  const updateUserProfile = useCallback((profileData) => {
    setAuthState(prev => ({
      ...prev,
      userProfile: profileData
    }));

    // Update localStorage
    const updatedUser = {
      ...authState.user,
      profile: profileData
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }, [authState.user]);

  // Refresh both user data and profile
  const refreshUserData = useCallback(async () => {
  if (!authState.isAuthenticated || !authState.user?.id) {
    return;
  }

  try {
    // Refresh user data using the working endpoint
    const userResponse = await axiosInstance.get(`/api/users/${authState.user.id}`);
    const userData = userResponse.data;
    
    // Extract profile from user data
    const profileData = userData?.profile || authState.userProfile;
    
    // Update state
    setAuthState(prev => ({
      ...prev,
      user: {
        ...userData,
        profile: profileData
      },
      userProfile: profileData
    }));

    localStorage.setItem("user", JSON.stringify({
      ...userData,
      profile: profileData
    }));

  } catch (error) {
    console.error('Error refreshing user data:', error);
  }
}, [authState.isAuthenticated, authState.user?.id, authState.userProfile]);

  const logout = useCallback((fromStorageEvent = false) => {
    // Clear state
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      userProfile: null,
    });
  
    // Clear storage
    localStorage.removeItem("user");
    localStorage.removeItem("jwtToken");
  
    // Clear axios header
    delete axiosInstance.defaults.headers.common['Authorization'];
    
    // Only trigger storage event if this is a direct logout (not from storage event)
    if (!fromStorageEvent) {
      // Signal other tabs about logout
      localStorage.setItem('logout', Date.now().toString());
      // Remove the logout signal after a short delay
      setTimeout(() => {
        localStorage.removeItem('logout');
      }, 100);
    }
    
    // Reset refs
    profileLoadingRef.current = false;
    initializedRef.current = false;
  }, []);

  // Check if token is expired
  const isTokenExpired = useCallback((token) => {
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }, []);

  // Initialize auth state from storage
  useEffect(() => {
    if (initializedRef.current) return;
    
    const initializeAuth = async () => {
      try {
        initializedRef.current = true;
        const token = localStorage.getItem("jwtToken");
        const userString = localStorage.getItem("user");

        if (token && userString) {
          // Verify token expiration
          if (isTokenExpired(token)) {
            throw new Error("Token expired");
          }

          const user = JSON.parse(userString);
          
          // Set axios auth header
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          setAuthState({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            userProfile: user.profile || null,
          });

          // Load fresh profile data from API
          if (isValidUserId(user.id)) {
            setTimeout(() => loadUserProfile(), 1000);
          }
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      }
    };

    initializeAuth();
  }, [isTokenExpired, isValidUserId, loadUserProfile, logout]);

  // Token expiration check
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (authState.token && isTokenExpired(authState.token)) {
        logout();
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);
    
    return () => clearInterval(interval);
  }, [authState.token, isTokenExpired, logout]);

  // Cross-tab logout listener (SIMPLIFIED - no API calls)
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Listen for logout signal from other tabs
      if (e.key === 'logout') {
        console.log('Logout signal received from other tab');
        logout(true);
      }
      
      // Listen for token removal from other tabs
      if (e.key === 'jwtToken' && !e.newValue && e.oldValue) {
        console.log('Token removed from other tab');
        logout(true);
      }
      
      // Listen for user removal from other tabs
      if (e.key === 'user' && !e.newValue && e.oldValue) {
        console.log('User data removed from other tab');
        logout(true);
      }
    };

    const handleVisibilityChange = () => {
      // When user switches back to this tab, check token expiration locally
      if (!document.hidden && authState.isAuthenticated && authState.token) {
        try {
          if (isTokenExpired(authState.token)) {
            console.log('Token expired while tab was inactive');
            logout();
          }
        } catch (error) {
          console.log('Error checking token on tab switch');
        }
      }
    };

    // Set up event listeners
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up event listeners
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [authState.isAuthenticated, authState.token, isTokenExpired, logout]);

  const login = useCallback(async (userData, token) => {
    try {
      // Verify token
      if (isTokenExpired(token)) {
        throw new Error("Token is expired");
      }
      
      const decodedToken = jwtDecode(token);
      
      // Ensure we have a proper user ID
      const userId = userData.id || decodedToken.userId || decodedToken.sub;
      if (!userId) {
        throw new Error("No user ID found in token");
      }

      const completeUserData = {
        ...userData,
        id: userId,
        roles: userData.roles || decodedToken.roles || [],
      };

      // Update state
      setAuthState({
        user: completeUserData,
        token,
        isAuthenticated: true,
        loading: false,
        userProfile: null,
      });

      // Persist to storage
      localStorage.setItem("user", JSON.stringify(completeUserData));
      localStorage.setItem("jwtToken", token);

      // Set axios headers
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Clear any previous logout signals
      localStorage.removeItem('logout');
      
      // Load user profile after login
      if (isValidUserId(userId)) {
        setTimeout(() => loadUserProfile(), 500);
      }
      
      return Promise.resolve();
      
    } catch (error) {
      console.error('Login error:', error);
      logout(); // Clean up on login failure
      return Promise.reject(error);
    }
  }, [isTokenExpired, isValidUserId, loadUserProfile, logout]);

  // Helper function to check if profile is complete
  const isProfileComplete = useCallback(() => {
    const profile = authState.userProfile;
    if (!profile) return false;
    
    return !!(profile.firstName && profile.lastName && profile.phone);
  }, [authState.userProfile]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    userProfile: authState.userProfile,
    login,
    logout,
    loadUserProfile,
    updateUserProfile,
    refreshUserData,
    isProfileComplete,
  }), [
    authState.user,
    authState.token,
    authState.isAuthenticated,
    authState.loading,
    authState.userProfile,
    login,
    logout,
    loadUserProfile,
    updateUserProfile,
    refreshUserData,
    isProfileComplete,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}