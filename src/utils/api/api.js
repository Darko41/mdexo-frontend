import axios from 'axios';

// Environment configuration
const isDevelopment = import.meta.env.MODE === 'development';
export const API_BASE_URL = isDevelopment 
  ? "http://localhost:8080" 
  : "https://mdexo-backend.onrender.com";

export const API_ENDPOINTS = {
  SEARCH: "/api/real-estates/search",
  PROPERTIES: "/api/real-estates",
  // ... other endpoints
};

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false // Must match backend allowCredentials setting
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    // Your error handling
    return Promise.reject(error);
  }
);

// API methods
const API = {
  realEstates: {
    search: (params) => api.get('/api/real-estates/search', { params }),
    getById: (id, params) => api.get(`${API_ENDPOINTS.PROPERTIES}/${id}`, { params }),
    create: (data) => api.post(API_ENDPOINTS.PROPERTIES, data),
    update: (id, data) => api.put(`${API_ENDPOINTS.PROPERTIES}/${id}`, data),
    delete: (id) => api.delete(`${API_ENDPOINTS.PROPERTIES}/${id}`)
    // ... other methods
  }
};

// Export everything you might need
export { api as axiosInstance }; // For direct axios usage
export default API; // For the clean API methods