import axios from 'axios';

const isDevelopment = import.meta.env.MODE === 'development';

export const BACKEND_BASE_URL = isDevelopment
  ? "http://localhost:8080"
  : "https://mdexo-backend.onrender.com";

const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 30000, // Increased timeout for image uploads
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// ✅ FIXED: Enhanced request interceptor with debugging
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  console.log('🔐 [API] Request to:', config.url);
  console.log('🔐 [API] Token exists:', !!token);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ [API] Token added to headers');
    
    // Log token details for debugging
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('📋 [API] Token payload:', {
        email: payload.sub,
        roles: payload.roles,
        expires: new Date(payload.exp * 1000)
      });
    } catch (e) {
      console.log('❌ [API] Cannot decode token');
    }
  } else {
    console.log('❌ [API] No token found in localStorage');
  }
  
  return config;
}, (error) => {
  console.error('❌ [API] Request interceptor error:', error);
  return Promise.reject(error);
});

// Response interceptor to detect redirects and HTML responses
	/*
	api.interceptors.response.use(
	  (response) => {
	    // Check if response is HTML (redirect happened but axios followed it)
	    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
	      console.error('🔄 Interceptor: Received HTML response, likely authentication issue');
	      localStorage.removeItem('jwtToken');
	      localStorage.removeItem('user');
	      // Don't redirect here - just clear tokens
	      // Your AuthContext or routing will handle the redirect
	      throw new Error('Authentication failed');
	    }
	    return response;
	  },
	  (error) => {
	    // Clear tokens on auth errors but don't redirect
	    if (error.response?.status === 302 || error.response?.status === 401) {
	      console.error('🔀 Authentication failed - clearing tokens');
	      localStorage.removeItem('jwtToken');
	      localStorage.removeItem('user');
	      // Your React app will detect the missing token and redirect
	    }
	    return Promise.reject(error);
	  }
	);
	*/

const API = {
  realEstates: {
    search: (params) => api.get('/api/real-estates/search', { params }),
    searchAll: () => api.get('/api/real-estates/search'),
    searchForSale: () => api.get('/api/real-estates/search', {
      params: { listingType: 'FOR_SALE' }
    }),
    searchForRent: () => api.get('/api/real-estates/search', { 
      params: { listingType: 'FOR_RENT' } 
    }),
    getById: (id) => api.get(`/api/real-estates/${id}`),
    
    // ✅ FIXED: Enhanced create method with better error handling
    createWithFormData: (formData) => {
      console.log('📦 [API] Creating listing with form data');
      return api.post('/api/real-estates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 45000
      });
    },
    
    create: (data) => api.post('/api/real-estates', data),
    update: (id, data) => api.put(`/api/real-estates/${id}`, data),
    delete: (id) => api.delete(`/api/real-estates/${id}`)
  },
  auth: {
    getCurrentUser: () => {
      console.log('🔑 [API] Getting current user');
      return api.get('/api/auth/current-user');
    },
    login: (credentials) => {
      console.log('🔑 [API] Logging in with:', credentials.username);
      return api.post('/api/auth/authenticate', credentials, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
    },
    register: (userData) => api.post('/api/users/register', userData),
    logout: () => {
      console.log('🔑 [API] Logging out');
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('user');
      return Promise.resolve();
    }
  },
};

export const axiosInstance = api;
export default API;