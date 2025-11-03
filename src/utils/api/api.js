import axios from 'axios';

// Validate and set the backend URL
const getBackendBaseUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  
  if (!envUrl || envUrl === 'undefined') {
    console.warn('VITE_BACKEND_URL is not set, falling back to localhost');
    return 'http://localhost:8080';
  }
  
  return envUrl;
};

export const BACKEND_BASE_URL = getBackendBaseUrl();

console.log('Backend URL:', BACKEND_BASE_URL); // Debug log

const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle token expiration and other errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('user');
      
      // Only redirect if we're not already on a login page
      if (!window.location.pathname.includes('/auth/login') && 
          !window.location.pathname.includes('/login')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

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
    
    features: () => api.get('/api/real-estates/features'),
    
    createWithFormData: (formData) => {
      return api.post('/api/real-estates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000
      });
    },
    
    // This is for JSON-only (no images)
    create: (data) => api.post('/api/real-estates', data),
    update: (id, data) => api.put(`/api/real-estates/${id}`, data),
    delete: (id) => api.delete(`/api/real-estates/${id}`)
  },
  auth: {
    getCurrentUser: () => api.get('/api/auth/me'), // Fixed endpoint to match your backend
    login: (credentials) => {
      return api.post('/api/auth/authenticate', credentials, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
    },
    register: (userData) => api.post('/api/users/register', userData),
    logout: () => {
      // Call server logout endpoint first
      return api.post('/auth/logout').finally(() => {
        // Always clear local storage
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
      });
    }
  },
  // User Profile Endpoints
  users: {
    getProfile: (userId) => api.get(`/api/users/${userId}/profile`),
    updateProfile: (userId, data) => api.put(`/api/users/${userId}/profile`, data),
    createProfile: (userId, data) => api.post(`/api/users/${userId}/profile`, data),
    getByEmail: (email) => api.get(`/api/users/by-email/${email}`),
  },
  // Contact Endpoint (moved from auth to root level)
  contact: {
    send: (data) => api.post('/api/contact/send', data),
  },
  // Admin endpoints
  admin: {
    verify: () => api.get('/api/admin/verify'),
  }
};

export const axiosInstance = api;
export default API;