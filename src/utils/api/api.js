import axios from 'axios';

const isDevelopment = import.meta.env.MODE === 'development';

export const BACKEND_BASE_URL = isDevelopment
  ? "http://localhost:8080"
  : "https://mdexo-backend.onrender.com";

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
  const token = localStorage.getItem('jwtToken'); // Changed from 'authToken' to match your AuthContext
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
	  params: { listingType: 'FOR_RENT' } }),
	  searchPost: (payload) => api.post('/api/real-estates/search', payload),
    getById: (id, params) => api.get(`${API_ENDPOINTS.PROPERTIES}/${id}`, { params }),
    create: (data) => api.post(API_ENDPOINTS.PROPERTIES, data),
    update: (id, data) => api.put(`${API_ENDPOINTS.PROPERTIES}/${id}`, data),
    delete: (id) => api.delete(`${API_ENDPOINTS.PROPERTIES}/${id}`)
  },
  auth: {
    login: (credentials) => api.post('/api/authenticate', credentials, {
      headers: {
        'Content-Security-Policy': 'default-src \'self\'',
      }
    }),
    logout: () => {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('user');
      return api.post('/api/logout');
    }
  },
  // Add more API groups as needed
};

export { api as axiosInstance };
export default API;