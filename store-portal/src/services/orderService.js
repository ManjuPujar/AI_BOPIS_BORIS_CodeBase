import api from './api';

const orderService = {
  async getOrders(status = '', page = 1, limit = 20) {
    const params = { page, limit, _t: Date.now() };
    if (status) params.status = status;
    const response = await api.get('/orders', { params, headers: { 'Cache-Control': 'no-cache' } });
    return response.data;
  },

  async getOrderById(orderId) {
    const response = await api.get(`/orders/${orderId}`, { params: { _t: Date.now() }, headers: { 'Cache-Control': 'no-cache' } });
    return response.data;
  },

  async acceptOrder(orderId, pickupReadyTime) {
    const response = await api.post(`/orders/${orderId}/accept`, { pickupReadyTime });
    return response.data;
  },

  async updateOrderStatus(orderId, status) {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  rejectOrder: async (orderId, reason) => {
    const response = await api.post(`/orders/${orderId}/reject`, { reason });
    return response.data;
  },

  async verifyOtp(orderId, otp) {
    const response = await api.post(`/orders/${orderId}/verify-otp`, { otp });
    return response.data;
  },

  async regenerateOtp(orderId) {
    const response = await api.post(`/orders/${orderId}/regenerate-otp`);
    return response.data;
  },
};

export default orderService;
