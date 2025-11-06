import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const API = {
  realEstates: {
    search: (params) => api.get('/api/real-estates/search', { params }),
    getById: (id) => api.get(`/api/real-estates/${id}`),
    features: () => api.get('/api/real-estates/features'),
    create: (data) => api.post('/api/real-estates', data),
    getMyProperties: () => api.get('/api/real-estates/my-properties'),
  },
  auth: {
    login: (credentials) => api.post('/api/auth/authenticate', credentials),
    register: (userData) => api.post('/api/users/register', userData),
  },
  users: {
    getById: (userId) => api.get(`/api/users/${userId}`),
    getProfile: (userId) => api.get(`/api/users/${userId}/profile`),
    updateProfile: (userId, profileData) => api.put(`/api/users/${userId}/profile`, profileData),
  }
};

export const axiosInstance = api;
export default API;