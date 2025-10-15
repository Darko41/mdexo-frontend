import axios from 'axios';

const isDevelopment = import.meta.env.MODE === 'development';

export const BACKEND_BASE_URL = isDevelopment
  ? "http://localhost:8080"
  : "https://mdexo-backend.onrender.com";

// Define API endpoints if you're using them
const API_ENDPOINTS = {
  PROPERTIES: '/api/real-estates',
};

const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Crucial for cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // Helps identify AJAX requests
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration or unauthorized access
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('user');
      window.location.href = '/login'; // Redirect to login
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
    
    // Unified create method with FormData
    createWithFormData: (formData) => api.post('/api/real-estates', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    }),
    
    // Keep the old create for backward compatibility (will use JSON endpoint)
    create: (data) => api.post('/api/real-estates', data),
    
    update: (id, data) => api.put(`/api/real-estates/${id}`, data),
    delete: (id) => api.delete(`/api/real-estates/${id}`)
  },
  auth: {
    getCurrentUser: () => api.get('/api/auth/current-user'),
    login: (credentials) => {
    return api.post('/api/auth/authenticate', credentials, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  },
    register: (userData) => api.post('/api/users/register', userData, {
      headers: {
        'Content-Security-Policy': 'default-src \'self\'',
      }
    }),
    logout: () => {
	  // Just clear client-side storage, no API call
	  localStorage.removeItem('jwtToken');
	  localStorage.removeItem('user');
	  return Promise.resolve(); // Return resolved promise
}
  },
  // Add more API groups as needed
};

export const axiosInstance = api;
export default API;