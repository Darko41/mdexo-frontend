import React, { createContext, useState, useCallback } from "react";

export const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const token = localStorage.getItem("jwtToken");
    const user = localStorage.getItem("user");
    return {
      user: user ? JSON.parse(user) : null,
      token,
      isAuthenticated: !!token,
    };
  });

  const login = useCallback((userData, token) => {
    // Store token in memory and localStorage
    setAuthState({
      user: userData,
      token,
      isAuthenticated: true,
    });
    
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("jwtToken", token);
    
    // For cross-domain cookies (if needed)
    document.cookie = `token=${token}; path=/; ${!import.meta.env.DEV ? 'Secure; SameSite=None' : 'SameSite=Lax'}`;
    
    // Set default authorization header
    API.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    
    // Clear storage
    localStorage.removeItem("user");
    localStorage.removeItem("jwtToken");
    
    // Clear cookie
    document.cookie = `token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${!import.meta.env.DEV ? 'Secure; SameSite=None' : ''}`;
    
    // Remove auth header
    delete API.axiosInstance.defaults.headers.common['Authorization'];
    
    // Optional: Call logout API endpoint if you have one
    API.auth.logout().catch(() => {}); // Silently fail if logout API fails
  }, []);

  return (
    <AuthContext.Provider value={{
      user: authState.user,
      token: authState.token,
      isAuthenticated: authState.isAuthenticated,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}