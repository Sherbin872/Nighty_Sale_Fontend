// src/api/adminApi.js
import axiosInstance from './axiosConfig';

export const adminApi = {
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/admin/stats');
    return response.data;
  }
};