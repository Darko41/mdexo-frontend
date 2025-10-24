import React, { createContext, useState, useCallback, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { axiosInstance } from '../utils/api/api';

export const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  loading: true,
});

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  });

  const logout = useCallback(() => {
    // No API call needed for JWT logout
    // Clear state
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
    });
  
    // Clear storage
    localStorage.removeItem("user");
    localStorage.removeItem("jwtToken");
  
    // Clear axios header
    delete axiosInstance.defaults.headers.common['Authorization'];
  }, []);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const userString = localStorage.getItem("user");

        if (token && userString) {
          const user = JSON.parse(userString);
          
          // Verify token expiration if needed
          const decodedToken = jwtDecode(token);
          if (decodedToken.exp * 1000 < Date.now()) {
            console.log("❌ Token expired");
            throw new Error("Token expired");
          }

          // Set axios auth header
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          setAuthState({
            user,
            token,
            isAuthenticated: true,
            loading: false,
          });
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("user");
        delete axiosInstance.defaults.headers.common['Authorization'];
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    };

    initializeAuth();
  }, []); // Remove logout from dependencies

  // Add token expiration check (optional but recommended)
  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = authState.token;
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          if (decodedToken.exp * 1000 < Date.now()) {
            console.log("🔄 Token expired - auto logging out");
            logout();
          }
        } catch (error) {
          console.error("❌ Token validation error:", error);
          logout();
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);
    
    return () => clearInterval(interval);
  }, [authState.token, logout]); // Now logout is available

  const login = useCallback(async (userData, token) => {
    try {
      // Decode token to verify
      const decodedToken = jwtDecode(token);
      const completeUserData = {
        ...userData,
        roles: userData.roles || decodedToken.roles || [],
      };

      // Update state
      setAuthState({
        user: completeUserData,
        token,
        isAuthenticated: true,
        loading: false,
      });

      // Persist to storage
      localStorage.setItem("user", JSON.stringify(completeUserData));
      localStorage.setItem("jwtToken", token);

      // Set axios headers
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Return a resolved promise to make await work
      return Promise.resolve();
      
    } catch (error) {
      console.error("❌ Login error:", error);
      return Promise.reject(error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        token: authState.token,
        isAuthenticated: authState.isAuthenticated,
        loading: authState.loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}