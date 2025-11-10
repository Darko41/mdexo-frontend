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
      delete: (propertyId) => api.delete(`/api/admin/real-estates/${propertyId}`)
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
    
    // Update agency details (requires agency admin access)
    update: (agencyId, agencyData) => api.put(`/api/agencies/${agencyId}`, agencyData),
    
    // Delete agency (requires admin access)
    delete: (agencyId) => api.delete(`/api/agencies/${agencyId}`),
    
    // === MEMBERSHIP MANAGEMENT ===
    
    // Apply to join an agency (requires ROLE_AGENT)
    apply: (agencyId) => api.post(`/api/agencies/${agencyId}/apply`),
    
    // Get all memberships for an agency (requires agency admin access)
    getMemberships: (agencyId) => api.get(`/api/agencies/${agencyId}/memberships`),
    
    // Get pending membership applications for an agency (requires agency admin access)
    getPendingMemberships: (agencyId) => api.get(`/api/agencies/${agencyId}/pending-memberships`),
    
    // Approve a membership application (requires agency admin access)
    approveMembership: (membershipId) => api.post(`/api/agencies/memberships/${membershipId}/approve`),
    
    // Reject a membership application (requires agency admin access)
    rejectMembership: (membershipId) => api.post(`/api/agencies/memberships/${membershipId}/reject`),
    
    // Remove agent from agency (requires agency admin access)
    removeMember: (membershipId) => api.delete(`/api/agencies/memberships/${membershipId}`),
    
    // Update member position/role (requires agency admin access)
    updateMember: (membershipId, memberData) => api.put(`/api/agencies/memberships/${membershipId}`, memberData),
    
    cancelApplication: (membershipId) => api.delete(`/api/agencies/memberships/${membershipId}`),
    
    // === ROLE PROMOTION (ADMIN ONLY) ===
    
    // Promote user to agent role (requires ROLE_ADMIN)
    promoteToAgent: (userId) => api.post('/api/agencies/promote/agent', null, {
      params: { userId }
    }),
    
    // Promote user to agency admin and create agency (requires ROLE_ADMIN)
    promoteToAgencyAdmin: (userId, agencyData) => {
	  
	  const requestBody = {
	    userId: userId,
	    name: agencyData.name,
	    description: agencyData.description
	  };
  
  return api.post('/api/agencies/promote/agency-admin', requestBody);
},
    
    // Demote user from agent role (requires ROLE_ADMIN)
    demoteFromAgent: (userId) => api.post('/api/agencies/demote/agent', null, {
      params: { userId }
    }),
    
    // === AGENCY PROPERTIES ===
    
    // Get all properties listed under an agency (public endpoint)
    getProperties: (agencyId, params) => api.get(`/api/agencies/${agencyId}/properties`, { params }),
    
    // Get agency statistics (requires agency admin access)
    getStats: (agencyId) => api.get(`/api/agencies/${agencyId}/stats`),
    
    // === AGENT-SPECIFIC ENDPOINTS ===
    
    // Get current user's agency memberships (requires ROLE_AGENT)
    getMyMemberships: () => api.get('/api/agencies/my-memberships'),
    
    // Leave an agency (requires ROLE_AGENT and membership)
    leaveAgency: (agencyId) => api.delete(`/api/agencies/${agencyId}/leave`)
  },

  // ===== AUTH ENDPOINTS =====
  auth: {
    // Login user
    login: (credentials) => api.post('/api/auth/authenticate', credentials),
    
    // Register new user
    register: (userData) => api.post('/api/users/register', userData),
    
    // Refresh token
    refresh: () => api.post('/api/auth/refresh-token'),
    
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
    
    // Get featured/property listings
    getFeatured: () => api.get('/api/real-estates/featured'),
    
    // Get similar properties
    getSimilar: (propertyId) => api.get(`/api/real-estates/${propertyId}/similar`),
    
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
    
    // Assign agent to property
    assignAgent: (propertyId, agentId) => api.post(`/api/real-estates/${propertyId}/assign-agent/${agentId}`),
    
    // Toggle property favorite status
    toggleFavorite: (propertyId) => api.post(`/api/real-estates/${propertyId}/favorite`),
    
    // Get user's favorite properties
    getFavorites: () => api.get('/api/real-estates/favorites'),
    
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
    }),
    
    // Set primary image
    setPrimaryImage: (propertyId, imageUrl) => api.put(`/api/real-estates/${propertyId}/primary-image`, { imageUrl }),
    
    // === AGENCY PROPERTY MANAGEMENT ===
    
    // Get agency properties (for agency admins/agents)
    getAgencyProperties: (agencyId, params) => api.get(`/api/real-estates/agency/${agencyId}`, { params }),
    
    // Transfer property to agency
    transferToAgency: (propertyId, agencyId) => api.post(`/api/real-estates/${propertyId}/transfer-to-agency/${agencyId}`)
  },

  // ===== USER ENDPOINTS =====
  users: {
    // === PUBLIC ENDPOINTS ===
    
    // Register new user
    register: (userData) => api.post('/api/users/register', userData),
    
    // Check if email exists
    checkEmail: (email) => api.get(`/api/users/check-email/${email}`),
    
    // === AUTHENTICATED USER ENDPOINTS ===
    
    // Get current user profile
    getCurrent: () => api.get('/api/users/me'),
    
    // Get user by ID
    getById: (userId) => api.get(`/api/users/${userId}`),
    
    // Update user profile (user can update their own)
    update: (userId, userData) => api.put(`/api/users/${userId}`, userData),
    
    // Update user password
    updatePassword: (userId, passwordData) => api.put(`/api/users/${userId}/password`, passwordData),
    
    // Delete user account (user can delete themselves)
    delete: (userId) => api.delete(`/api/users/${userId}`),
    
    // Request agent promotion (user self-service)
    requestAgentPromotion: () => api.post('/api/users/request-agent-promotion'),
    
    // Upload profile picture
    uploadAvatar: (userId, formData) => api.post(`/api/users/${userId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    // Get user's agency memberships
    getMyAgencies: () => api.get('/api/users/my-agencies'),
    
    // === ADMIN ONLY ENDPOINTS ===
    
    // Get all users (admin only)
    getAll: () => api.get('/api/users'),
    
    // Create user (admin only)
    create: (userData) => api.post('/api/users', userData),
    
    // Get user statistics (admin only)
    getStats: () => api.get('/api/users/stats')
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
  }
};

export const axiosInstance = api;
export default API;