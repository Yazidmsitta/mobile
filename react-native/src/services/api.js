import axios from 'axios';
import { getAuthToken, removeAuthToken } from './storage';

// Change this URL based on your environment
// For emulator: http://10.0.2.2:8000/api/
// For physical device: http://YOUR_IP:8000/api/
// 
// IMPORTANT: 
// - If using Expo Go on physical device, use your computer's WiFi IP (e.g., 192.168.1.16)
// - If using Android emulator, use 10.0.2.2
// - Make sure Laravel server is running: php artisan serve --host=0.0.0.0 --port=8000
// - Ensure phone/emulator and computer are on the same WiFi network

// Configuration de l'URL de l'API
// Pour Expo Go sur téléphone physique: utilisez votre IP WiFi (192.168.1.16)
// Pour émulateur Android: utilisez 10.0.2.2
// 
// IMPORTANT: Modifiez cette valeur selon votre environnement
export const API_BASE_URL = 'http://192.168.1.16:8000/api/'; // IP WiFi pour téléphone physique avec Expo Go
// export const API_BASE_URL = 'http://10.0.2.2:8000/api/'; // Pour émulateur Android - décommentez cette ligne si vous utilisez un émulateur

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log network errors for debugging
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('Network Error Details:', {
        message: error.message,
        code: error.code,
        baseURL: API_BASE_URL,
        url: error.config?.url,
        method: error.config?.method,
      });
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid - don't throw error for logout
      if (error.config?.url?.includes('/auth/logout')) {
        // For logout, 401 is expected if token is already invalid
        return Promise.resolve({ data: { message: 'Already logged out' } });
      }
      await removeAuthToken();
      // You can dispatch a logout action here if using Redux/Context
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (name, email, password, passwordConfirmation, userType = 'CLIENT') => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
      user_type: userType,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
};

// Measurements API
export const measurementsAPI = {
  getAll: async () => {
    const response = await api.get('/measurements');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/measurements/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/measurements', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/measurements/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/measurements/${id}`);
    return response.data;
  },
};

// Gold Price API
export const goldPriceAPI = {
  getAll: async (filters = {}) => {
    const params = {};
    if (filters.period) params.period = filters.period;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    if (filters.karat) params.karat = filters.karat;
    
    const response = await api.get('/gold-prices', { params });
    return response.data;
  },
};

// Products API
export const productsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.minPrice) params.append('min_price', filters.minPrice);
    if (filters.maxPrice) params.append('max_price', filters.maxPrice);
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
};

// Vendor Products API (for vendors to manage their products)
export const vendorProductsAPI = {
  getAll: async () => {
    const response = await api.get('/vendor/products');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/vendor/products', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/vendor/products/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/vendor/products/${id}`);
    return response.data;
  },
};

// Settings API
export const settingsAPI = {
  get: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  update: async (data) => {
    const response = await api.put('/settings', data);
    return response.data;
  },
};

export default api;

