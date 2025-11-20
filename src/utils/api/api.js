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
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
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
  // ===== ADMIN ENDPOINTS =====
  admin: {
    // Verify admin access
    verify: () => api.get('/api/admin/verify'),
    
    // Real Estate Management
    realEstates: {
      // Create real estate (with images)
      create: (formData) => api.post('/api/admin/real-estates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
      
      // Get all real estates (with search/filter)
      getAll: (params) => api.get('/api/admin/real-estates', { params }),
      
      // Get specific real estate
      getById: (propertyId) => api.get(`/api/admin/real-estates/${propertyId}`),
      
      // Update real estate (with images)
      update: (propertyId, formData) => api.put(`/api/admin/real-estates/${propertyId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
      
      // Delete real estate
      delete: (propertyId) => api.delete(`/api/admin/real-estates/${propertyId}`),
      
      // Activate property
      activate: (propertyId) => api.patch(`/api/admin/real-estates/${propertyId}/activate`),
      
      // Deactivate property
      deactivate: (propertyId) => api.patch(`/api/admin/real-estates/${propertyId}/deactivate`)
    },
    
    // User Management
    users: {
      // Create user
      create: (userData) => api.post('/api/admin/users', userData),
      
      // Get all users
      getAll: () => api.get('/api/admin/users'),
      
      // Update user
      update: (userId, userData) => api.put(`/api/admin/users/${userId}`, userData),
      
      // Delete user
      delete: (userId) => api.delete(`/api/admin/users/${userId}`)
    },
    
    // Dashboard
    dashboard: {
      // Get dashboard statistics
      stats: () => api.get('/api/admin/dashboard/stats')
    }
  },

  // ===== AGENCY ENDPOINTS =====
  agencies: {
    // === AGENCY MANAGEMENT ===
    
    // Create new agency (requires ROLE_ADMIN or ROLE_AGENCY_ADMIN)
    create: (agencyData) => api.post('/api/agencies', agencyData),
    
    // Get all agencies (public endpoint)
    getAll: () => api.get('/api/agencies'),
    
    // Get specific agency by ID (public endpoint)
    getById: (agencyId) => api.get(`/api/agencies/${agencyId}`),
    
    // Search agencies (public endpoint)
    search: (params) => api.get('/api/agencies/search', { params }),
    
    // Get current user's agency (agency admin only)
    getMyAgency: () => api.get('/api/agencies/my-agency'),
    
    // Update agency details (requires agency admin access)
    update: (agencyId, agencyData) => api.put(`/api/agencies/${agencyId}`, agencyData),
    
    // Activate agency
    activate: (agencyId) => api.post(`/api/agencies/${agencyId}/activate`),
    
    // Deactivate agency
    deactivate: (agencyId) => api.post(`/api/agencies/${agencyId}/deactivate`),
    
    // === AGENCY PROPERTIES ===
    
    // Get all properties listed under an agency
    getProperties: (agencyId) => api.get(`/api/agencies/${agencyId}/properties`),
    
    // Get agency properties with pagination
    getPropertiesPaged: (agencyId, params) => api.get(`/api/agencies/${agencyId}/properties/paged`, { params }),
    
    // Get agency statistics
    getStats: (agencyId) => api.get(`/api/agencies/${agencyId}/statistics`)
    
    // REMOVED: All membership and promotion endpoints since agents are deleted
  },

  // ===== AUTH ENDPOINTS =====
  auth: {
    // Login user
    login: (credentials) => api.post('/api/auth/authenticate', credentials),
    
    // Get current user info
    getMe: () => api.get('/api/auth/me'),
    
    // Refresh token
    refresh: () => api.post('/api/auth/refresh'),
    
    // Validate token
    validate: (token) => api.post('/api/auth/validate', { token }),
    
    // Logout user
    logout: () => api.post('/api/auth/logout')
  },

  // ===== EMAIL ENDPOINTS =====
  email: {
    // Send email
    send: (emailData) => api.post('/api/email/send-email', emailData),
    
    // Send contact form email
    sendContact: (contactData) => api.post('/api/email/contact', contactData)
  },

  // ===== REAL ESTATE ENDPOINTS =====
  realEstates: {
    // === PUBLIC ENDPOINTS (no auth required) ===
    
    // Search real estates with filters
    search: (params) => api.get('/api/real-estates/search', { params }),
    
    // Get real estate by ID
    getById: (id) => api.get(`/api/real-estates/${id}`),
    
    // Get all unique features
    features: () => api.get('/api/real-estates/features'),
    
    // Get active featured listings
    getFeatured: (limit = 10) => api.get('/api/real-estates/featured/active', { 
      params: { limit } 
    }),
    
    // === AUTHENTICATED USER ENDPOINTS ===
    
    // Get current user's properties
    getMyProperties: (params) => api.get('/api/real-estates/my-properties', { params }),
    
    // Create real estate (regular user)
    create: (formData) => api.post('/api/real-estates', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    // Create real estate for another user (admin/agent)
    createForUser: (formData) => api.post('/api/real-estates/for-user', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    // Create real estate (JSON only - no images)
    createJson: (data) => api.post('/api/real-estates', data, {
      headers: { 'Content-Type': 'application/json' }
    }),
    
    // Update real estate (JSON only)
    update: (propertyId, data) => api.put(`/api/real-estates/${propertyId}`, data, {
      headers: { 'Content-Type': 'application/json' }
    }),
    
    // Update real estate with images
    updateWithImages: (propertyId, formData) => api.put(`/api/real-estates/${propertyId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    // Delete real estate
    delete: (propertyId) => api.delete(`/api/real-estates/${propertyId}`),
    
    // === IMAGE MANAGEMENT ===
    
    // Add images to property
    addImages: (propertyId, formData) => api.post(`/api/real-estates/${propertyId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    // Replace all images
    replaceImages: (propertyId, formData) => api.put(`/api/real-estates/${propertyId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    // Remove specific images
    removeImages: (propertyId, imageUrls) => api.delete(`/api/real-estates/${propertyId}/images`, { 
      data: { imageUrls } 
    })
  },

  // ===== USER ENDPOINTS =====
  users: {
    // === PUBLIC ENDPOINTS ===
    
    // Register new user
    register: (userData) => api.post('/api/users/register', userData),
    
    // === AUTHENTICATED USER ENDPOINTS ===
    
    // Get current user profile
    getCurrent: () => api.get('/api/users/me'),
    
    // Get user by ID
    getById: (userId) => api.get(`/api/users/${userId}`),
    
    // Update user profile (user can update their own)
    update: (userId, userData) => api.put(`/api/users/${userId}`, userData),
    
    // Delete user account (user can delete themselves)
    delete: (userId) => api.delete(`/api/users/${userId}`),
    
    // === USER AGENCY INFO ===
    
    // Get current user's agency info
    getMyAgency: () => api.get('/api/users/me/agency'),
    
    // Check if user has agency
    hasAgency: () => api.get('/api/users/me/has-agency'),
    
    // Check if current user is admin
    isAdmin: () => api.get('/api/users/me/is-admin'),
    
    // === ADMIN ONLY ENDPOINTS ===
    
    // Get all users (admin only)
    getAll: () => api.get('/api/users'),
    
    // Create user (admin only)
    create: (userData) => api.post('/api/users', userData),
    
    // Get user statistics (admin only)
    getStats: () => api.get('/api/users/statistics'),
    
    // Get user's image count (admin only)
    getImageCount: (userId) => api.get(`/api/users/${userId}/image-count`)
    
    // REMOVED: requestAgentPromotion and requestInvestorPromotion
  },

  // ===== TRIAL ENDPOINTS =====
  trial: {
    // Get current user's trial status
    getMyStatus: () => api.get('/api/trial/my-status'),
    
    // Get detailed trial progress
    getMyProgress: () => api.get('/api/trial/my-progress'),
    
    // Check if user can start trial
    canStart: () => api.get('/api/trial/can-start'),
    
    // Start trial for current user
    start: () => api.post('/api/trial/start'),
    
    // Get agency trial status (agency admin only)
    getAgencyStatus: () => api.get('/api/trial/agency-status'),
    
    // === ADMIN ONLY ===
    
    // Get trial statistics (admin only)
    getStats: () => api.get('/api/trial/statistics'),
    
    // Extend trial for user (admin only)
    extend: (userId, additionalMonths) => api.post(`/api/trial/${userId}/extend-trial`, null, {
      params: { additionalMonths }
    }),
    
    // Expire trial for user (admin only)
    expire: (userId) => api.post(`/api/trial/${userId}/expire-trial`),
    
    // Get expiring trials (admin only)
    getExpiring: (daysThreshold = 7) => api.get('/api/trial/expiring-soon', {
      params: { daysThreshold }
    })
  },

  // ===== TIER ENDPOINTS =====
  tiers: {
    // === PUBLIC ENDPOINTS ===
    
    // Get all tier benefits
    getBenefits: () => api.get('/api/tiers/benefits'),
    
    // Get individual user tiers
    getIndividualTiers: () => api.get('/api/tiers/benefits/individual'),
    
    // Get agency tiers
    getAgencyTiers: () => api.get('/api/tiers/benefits/agency'),
    
    // Get investor tiers
    getInvestorTiers: () => api.get('/api/tiers/benefits/investor'),
    
    // Get benefits for specific tier
    getTierBenefits: (tier) => api.get(`/api/tiers/benefits/${tier}`),
    
    // Compare multiple tiers
    compare: (tiers) => api.get('/api/tiers/compare', {
      params: { tiers: tiers.join(',') }
    }),
    
    // === AUTHENTICATED ENDPOINTS ===
    
    // Get current user's tier information
    getMyTier: () => api.get('/api/tiers/my-tier')
  },

  // ===== INVESTOR ENDPOINTS =====
  investor: {
    // Get investor profile
    getProfile: () => api.get('/api/investor/profile'),
    
    // Create investor profile
    createProfile: (profileData) => api.post('/api/investor/profile', profileData),
    
    // Update investor profile
    updateProfile: (profileData) => api.put('/api/investor/profile', profileData),
    
    // Delete investor profile
    deleteProfile: () => api.delete('/api/investor/profile'),
    
    // Check if profile exists
    profileExists: () => api.get('/api/investor/profile/exists'),
    
    // Get investor dashboard
    getDashboard: () => api.get('/api/investor/dashboard')
  },

  // ===== FEATURED LISTINGS ENDPOINTS =====
  featured: {
    // === PUBLIC ENDPOINTS ===
    
    // Get active featured listings
    getActive: (limit = 10) => api.get('/api/featured/active', {
      params: { limit }
    }),
    
    // === AUTHENTICATED ENDPOINTS ===
    
    // Feature a listing
    feature: (realEstateId, featuredDays = 30) => api.post(`/api/featured/${realEstateId}`, null, {
      params: { featuredDays }
    }),
    
    // Unfeature a listing
    unfeature: (realEstateId) => api.delete(`/api/featured/${realEstateId}`),
    
    // Check if user can feature a listing
    canFeature: (realEstateId) => api.get(`/api/featured/can-feature/${realEstateId}`),
    
    // Get user's featured listings
    getMyFeatured: () => api.get('/api/featured/my-featured'),
    
    // === ADMIN ONLY ===
    
    // Get featured listings statistics
    getStats: () => api.get('/api/featured/statistics')
  },

  // ===== USAGE ENDPOINTS =====
  usage: {
    // Get current user usage stats
    getStats: () => api.get('/api/usage/stats'),
    
    // Get detailed usage information
    getDetailed: () => api.get('/api/usage/detailed'),
    
    // Check if user can create real estate
    canCreateRealEstate: () => api.get('/api/usage/can-create-realestate'),
    
    // Check if user can upload images
    canUploadImage: (countToUpload) => api.get('/api/usage/can-upload-image', {
      params: { countToUpload }
    }),
    
    // Check if user can upload multiple images
    canUploadImages: (imageCount) => api.get('/api/usage/can-upload-images', {
      params: { imageCount }
    }),
    
    // Check if user can feature listing
    canFeatureListing: () => api.get('/api/usage/can-feature-listing'),
    
    // Get featured usage info
    getFeaturedInfo: () => api.get('/api/usage/featured-info'),
    
    // Get agency usage stats (agency admin only)
    getAgencyStats: () => api.get('/api/usage/agency-stats'),
    
    // Get comprehensive usage summary
    getSummary: () => api.get('/api/usage/summary')
  },

  // ===== UPLOAD ENDPOINTS =====
  upload: {
    // Upload single file
    single: (formData) => api.post('/api/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    // Upload multiple files
    multiple: (formData) => api.post('/api/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    // Delete uploaded file
    delete: (fileUrl) => api.delete('/api/upload/delete', { data: { fileUrl } })
  },

  // ===== VERIFICATION ENDPOINTS =====
  verification: {
    // === USER ENDPOINTS ===
    
    // Submit verification
    submit: (verificationData) => api.post('/api/verification/submit', verificationData),
    
    // Get verification status
    getMyStatus: () => api.get('/api/verification/my-status'),
    
    // Get verification history
    getMyHistory: () => api.get('/api/verification/my-history'),
    
    // Check if user can apply for verification
    canApply: (verificationType) => api.get(`/api/verification/can-apply/${verificationType}`),
    
    // === PUBLIC ENDPOINTS ===
    
    // Get public user verification (public endpoint)
    getPublic: (userId) => api.get(`/api/verification/public/user/${userId}`),
    
    // === ADMIN ENDPOINTS ===
    
    // Get admin verification list
    getAdminList: (params) => api.get('/api/verification/admin/list', { params }),
    
    // Update verification status (admin only)
    updateStatus: (verificationId, statusData) => api.put(`/api/verification/admin/${verificationId}`, statusData)
  }
};

export const axiosInstance = api;
export default API;