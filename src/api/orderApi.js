import axiosInstance from './axiosConfig';

export const getOrderById = async (id) => {
  const { data } = await axiosInstance.get(`/orders/${id}`);
  return data;
};

export const getMyOrders = async () => {
  const { data } = await axiosInstance.get('/orders/myorders');
  return data;
};
// Add this to orderApi.js


export const getAllOrders = async () => {
  const { data } = await axiosInstance.get('/orders');
  return data;
};

export const updateOrderStatus = async (orderId, status) => {
  const { data } = await axiosInstance.put(`/orders/${orderId}/status`, { status });
  return data;
};

export const deleteOrder = async (orderId) => {
  const { data } = await axiosInstance.delete(`/orders/${orderId}`);
  return data;
};


export default {
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
};
