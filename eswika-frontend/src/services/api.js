// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor pour ajouter le token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor pour gérer les erreurs
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  login: async (credentials) => {
    const response = await axiosInstance.post('/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      // localStorage.setItem('role', response.data.user_type.type);
    }
    return response;
  },

  register: (userData) => axiosInstance.post('/register', userData),

  adminLogin: async (credentials) => {
    const response = await axiosInstance.post('/admin/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  },

  checkAuthState: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const response = await axiosInstance.get('/check-auth');
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      return null;
    }
  },

  // Products
  getProducts: () => axiosInstance.get('/products'),
  addProduct: (productData) => axiosInstance.post('/products', productData),
  updateProduct: (id, productData) => axiosInstance.put(`/products/${id}`, productData),
  deleteProduct: (id) => axiosInstance.delete(`/products/${id}`),

  // Cart/Orders
  getOrders: () => axiosInstance.get('/orders'),
  createOrder: (orderData) => axiosInstance.post('/orders', orderData),
  removeFromCart: (orderId) => axiosInstance.delete(`/orders/${orderId}`),
  updateCartQuantity: (orderId, quantity) => 
    axiosInstance.put(`/orders/${orderId}`, { quantity }),
  updatePeelingOption: (orderId, peeling_requested) => 
    axiosInstance.put(`/orders/${orderId}`, { peeling_requested }),
  updateOrderStatus: (orderId, status) => 
    axiosInstance.put(`/orders/${orderId}`, { status }),

  // Admin
  getAdminStats: () => axiosInstance.get('/admin/statistics'),
  
  getUsers: (page = 1, perPage = 10) => 
    axiosInstance.get(`/admin/users?page=${page}&per_page=${perPage}`),
  
  getUserDetails: (userId) => axiosInstance.get(`/admin/users/${userId}`),
  
  deleteUser: (userId) => axiosInstance.delete(`/admin/users/${userId}`),
  
  updateUserStatus: (userId, status) => 
    axiosInstance.put(`/admin/users/${userId}/status`, { active: status }),

  addUser: (userData) => axiosInstance.post('/admin/users', userData),

  // Statistics
  getSalesStats: () => axiosInstance.get('/admin/sales/stats'),
  getMonthlyStats: () => axiosInstance.get('/admin/stats/monthly'),
  getTopSellers: () => axiosInstance.get('/admin/stats/top-sellers'),
  getProductStats: () => axiosInstance.get('/admin/stats/products'),

  // Orders Management (Admin/Farmer)
  getFarmerOrders: () => axiosInstance.get('/orders/farmer'),
  getAllOrders: () => axiosInstance.get('/admin/orders'),
  updateOrder: (orderId, orderData) => 
    axiosInstance.put(`/orders/${orderId}`, orderData),

  // User Profile
  updateProfile: (userData) => axiosInstance.put('/profile', userData),
  changePassword: (passwordData) => axiosInstance.put('/profile/password', passwordData),

  // Search and Filters
  searchProducts: (query) => axiosInstance.get(`/products/search?q=${query}`),
  filterProducts: (filters) => axiosInstance.post('/products/filter', filters),
  
  // Categories (if you decide to add them)
  getCategories: () => axiosInstance.get('/categories'),
  addCategory: (categoryData) => axiosInstance.post('/categories', categoryData),
  updateCategory: (id, categoryData) => 
    axiosInstance.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => axiosInstance.delete(`/categories/${id}`),

  // Reviews and Ratings
  getProductReviews: (productId) => axiosInstance.get(`/products/${productId}/reviews`),
  addReview: (productId, reviewData) => 
    axiosInstance.post(`/products/${productId}/reviews`, reviewData),
  updateReview: (productId, reviewId, reviewData) => 
    axiosInstance.put(`/products/${productId}/reviews/${reviewId}`, reviewData),
  deleteReview: (productId, reviewId) => 
    axiosInstance.delete(`/products/${productId}/reviews/${reviewId}`),

  // Dashboard Analytics
  getDashboardStats: () => axiosInstance.get('/admin/dashboard'),
  getRevenueStats: () => axiosInstance.get('/admin/revenue'),
  getUserStats: () => axiosInstance.get('/admin/users/stats'),
  getOrderStats: () => axiosInstance.get('/admin/orders/stats')
};