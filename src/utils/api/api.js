import axios from 'axios';

// Determine environment
const isDevelopment = import.meta.env.MODE === 'development';

// Backend base URL based on environment
export const BACKEND_BASE_URL = isDevelopment
  ? "http://localhost:8080"
  : "https://mdexo-backend.onrender.com";

// API endpoint paths (relative to BACKEND_BASE_URL)
export const API_ENDPOINTS = {
  SEARCH: "/api/real-estates/search",
  PROPERTIES: "/api/real-estates",
  // Add other endpoints here as needed
};

// Create Axios instance with base URL and default headers
const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Set to true if backend requires cookies/session
});

// Add authorization header automatically if token is present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Basic response interceptor for centralized error handling (optional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can add global error handling/logging here if needed
    return Promise.reject(error);
  }
);

// Define API methods for real estates resource
const API = {
  realEstates: {
    search: (params) => api.get('/api/real-estates/search', { params }),
    searchAll: () => api.get('/api/real-estates/search'),
    searchForSale: () => api.get('/api/real-estates/search', {
      params: { listingType: 'FOR_SALE' }
    }),
    searchForRent: () => api.get('/api/real-estates/search', { 
	  params: { listingType: 'FOR_RENT' } }),
	  searchPost: (payload) => api.post('/api/real-estates/search', payload),
    getById: (id, params) => api.get(`${API_ENDPOINTS.PROPERTIES}/${id}`, { params }),
    create: (data) => api.post(API_ENDPOINTS.PROPERTIES, data),
    update: (id, data) => api.put(`${API_ENDPOINTS.PROPERTIES}/${id}`, data),
    delete: (id) => api.delete(`${API_ENDPOINTS.PROPERTIES}/${id}`)
  },
  auth: {
    login: (credentials) => api.post('/api/authenticate', credentials)
  }
};

export { api as axiosInstance }; // raw axios instance for direct usage if needed
export default API;                 // clean API method abstraction for app usage