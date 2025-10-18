import axios from 'axios';

const isDevelopment = import.meta.env.MODE === 'development';

export const BACKEND_BASE_URL = isDevelopment
  ? "http://localhost:8080"
  : "https://mdexo-backend.onrender.com";

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

// Response interceptor to detect redirects and HTML responses
/*
api.interceptors.response.use(
  (response) => {
    // Check if response is HTML (redirect happened but axios followed it)
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('user');
      throw new Error('Authentication failed');
    }
    return response;
  },
  (error) => {
    // Clear tokens on auth errors but don't redirect
    if (error.response?.status === 302 || error.response?.status === 401) {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('user');
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
    
    createWithFormData: (formData) => {
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
    getCurrentUser: () => api.get('/api/auth/current-user'),
    login: (credentials) => {
      return api.post('/api/auth/authenticate', credentials, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
    },
    register: (userData) => api.post('/api/users/register', userData),
    logout: () => {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('user');
      return Promise.resolve();
    }
  },
};

export const axiosInstance = api;
export default API;