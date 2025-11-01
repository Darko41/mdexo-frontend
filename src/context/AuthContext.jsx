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

  // Load user profile from API - FIXED: Remove dependencies that cause loops
  const loadUserProfile = useCallback(async (force = false) => {
    if (!authState.isAuthenticated || !authState.user?.id || !authState.token) {
      return null;
    }

    // Prevent concurrent profile loads
    if (profileLoadingRef.current && !force) {
      return null;
    }

    const userId = authState.user.id;
    if (typeof userId !== 'number' || isNaN(userId)) {
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
  }, [authState.isAuthenticated, authState.user?.id, authState.token]); // Limited dependencies

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
      await loadUserProfile(true); // Force refresh
      
      // Update user data
      setAuthState(prev => ({
        ...prev,
        user: {
          ...userData,
          profile: prev.userProfile
        }
      }));

      localStorage.setItem("user", JSON.stringify({
        ...userData,
        profile: authState.userProfile
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

  // Initialize auth state from storage - FIXED: Run only once
  useEffect(() => {
    // Prevent multiple initializations
    if (initializedRef.current) return;
    
    const initializeAuth = async () => {
      try {
        initializedRef.current = true;
        const token = localStorage.getItem("jwtToken");
        const userString = localStorage.getItem("user");

        if (token && userString) {
          const user = JSON.parse(userString);
          
          // Verify token expiration
          const decodedToken = jwtDecode(token);
          if (decodedToken.exp * 1000 < Date.now()) {
            throw new Error("Token expired");
          }

          // Set axios auth header
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          setAuthState({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            userProfile: user.profile || null,
          });

          // Load fresh profile data from API after a delay
          // This prevents immediate re-renders that could cause loops
          setTimeout(async () => {
            if (user.id && typeof user.id === 'number') {
              await loadUserProfile();
            }
          }, 1000);
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("user");
        delete axiosInstance.defaults.headers.common['Authorization'];
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          userProfile: null,
        });
      }
    };

    initializeAuth();
  }, []); // EMPTY dependency array - runs only once

  // Add token expiration check
  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = authState.token;
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          if (decodedToken.exp * 1000 < Date.now()) {
            logout();
          }
        } catch (error) {
          logout();
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);
    
    return () => clearInterval(interval);
  }, [authState.token, logout]);

  const login = useCallback(async (userData, token) => {
    try {
      // Decode token to verify
      const decodedToken = jwtDecode(token);
      
      // Ensure we have a proper user ID - extract from token or use provided
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
      
      // Load user profile after login with delay to prevent loops
      setTimeout(async () => {
        if (userId && typeof userId === 'number') {
          await loadUserProfile();
        }
      }, 500);
      
      return Promise.resolve();
      
    } catch (error) {
      console.error('Login error:', error);
      return Promise.reject(error);
    }
  }, [loadUserProfile]);

  // Helper function to check if profile is complete
  const isProfileComplete = useCallback(() => {
    if (!authState.userProfile) return false;
    
    return (
      authState.userProfile.firstName &&
      authState.userProfile.lastName &&
      authState.userProfile.phone
    );
  }, [authState.userProfile]);

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}