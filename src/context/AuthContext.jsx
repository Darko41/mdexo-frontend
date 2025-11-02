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
  const loadUserProfile = useCallback(async (force = false) => {
    if (!authState.isAuthenticated || !authState.user?.id || !authState.token) {
      return null;
    }

    // Prevent concurrent profile loads
    if (profileLoadingRef.current && !force) {
      return null;
    }

    const userId = authState.user.id;
    if (!isValidUserId(userId)) {
      return null;
    }

    try {
      profileLoadingRef.current = true;
      const response = await axiosInstance.get(`/api/users/${userId}/profile`);
      const profileData = response.data;
      
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

      return profileData;
    } catch (error) {
      // If profile doesn't exist, that's fine - return empty object
      if (error.response?.status === 404) {
        const emptyProfile = { firstName: null, lastName: null, phone: null, bio: null };
        setAuthState(prev => ({
          ...prev,
          userProfile: emptyProfile
        }));
        return emptyProfile;
      }
      
      console.error('Error loading user profile:', error);
      return null;
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
      // Refresh user data
      const userResponse = await axiosInstance.get(`/api/users/${authState.user.id}`);
      const userData = userResponse.data;
      
      // Refresh profile data
      const profileData = await loadUserProfile(true); // Force refresh
      
      // Update user data
      setAuthState(prev => ({
        ...prev,
        user: {
          ...userData,
          profile: profileData || prev.userProfile
        }
      }));

      localStorage.setItem("user", JSON.stringify({
        ...userData,
        profile: profileData || authState.userProfile
      }));

    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, [authState.isAuthenticated, authState.user?.id, authState.userProfile, loadUserProfile]);

  const logout = useCallback(() => {
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