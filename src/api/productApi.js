// src/api/productApi.js
import axiosInstance from './axiosConfig';

export const productApi = {
  // Get all products (with pagination & search)
  getProducts: async (keyword = '', pageNumber = 1) => {
    const response = await axiosInstance.get('/products', {
      params: { keyword, pageNumber }
    });
    return response.data;
  },

   getProductsByCategory: async (category) => {
    const response = await axiosInstance.get('/products', {
      params: { category }
    });
    return response.data;
  },

  // Get single product
  getProductById: async (id) => {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  },

  // Create product (Admin only)
  createProduct: async (productData) => {
    const response = await axiosInstance.post('/products', productData);
    return response.data;
  },

  // Update product (Admin only)
  updateProduct: async (id, productData) => {
    const response = await axiosInstance.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product (Admin only)
  deleteProduct: async (id) => {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  },

  // Upload product image
 uploadProductImages: async (formData) => {
    const response = await axiosInstance.post(
      '/upload/multiple',
      formData,
       {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
    );
    return response.data;
  },
};