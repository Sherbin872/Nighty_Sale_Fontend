// src/api/authApi.js
import axiosInstance from './axiosConfig';

export const authApi = {
  // Register new user
  register: async (userData) => {
    const response = await axiosInstance.post('/users', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await axiosInstance.post('/users/login', credentials);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },
};