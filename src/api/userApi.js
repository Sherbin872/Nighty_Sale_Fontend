import axiosInstance from './axiosConfig';

/**
 * User API calls
 * Note: These routes require the user to be logged in and have Admin privileges.
 */

// Get all users (Admin only)
export const getAllUsers = async () => {
  const response = await axiosInstance.get('/users');
  return response.data;
};

// Delete a user (Admin only)
export const deleteUser = async (id) => {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response.data;
};

// Update user role / details (Admin only)
export const updateUserRole = async (id, userData) => {
  // userData will look like: { isAdmin: true } or { isAdmin: false }
  const response = await axiosInstance.put(`/users/${id}`, userData);
  return response.data;
};

// Get user details by ID (Admin only - useful if you add an Edit User page later)
export const getUserById = async (id) => {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data;
};