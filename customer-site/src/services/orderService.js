import api from './api';

export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getMyOrders = async (page = 1, limit = 10) => {
  const response = await api.get('/orders', { params: { page, limit } });
  return response.data;
};

export const getOrderById = async (orderId, email) => {
  const params = {};
  if (email) params.email = email;
  const response = await api.get(`/orders/${orderId}`, { params });
  return response.data;
};

export const cancelOrder = async (orderId, reason) => {
  const response = await api.post(`/orders/${orderId}/cancel`, { reason });
  return response.data;
};

export const lookupGuestOrders = async (email) => {
  const response = await api.get(`/orders/guest/lookup?email=${encodeURIComponent(email)}`);
  return response.data;
};

export const getPickupOtp = async (orderId, email) => {
  const params = {};
  if (email) params.email = email;
  const response = await api.get(`/orders/${orderId}/pickup-otp`, { params });
  return response.data;
};
