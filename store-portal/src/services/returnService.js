import api from './api';

const returnService = {
  async getReturns(status = '') {
    const params = {};
    if (status) params.status = status;
    const response = await api.get('/returns', { params });
    return response.data;
  },

  async acceptReturn(returnId) {
    const response = await api.post(`/returns/${returnId}/accept`);
    return response.data;
  },

  async completeReturn(returnId) {
    const response = await api.post(`/returns/${returnId}/complete`);
    return response.data;
  },

  async rejectReturn(returnId, reason) {
    const response = await api.post(`/returns/${returnId}/reject`, { reason });
    return response.data;
  },

  async verifyReturn(returnId, passed) {
    const response = await api.post(`/returns/${returnId}/verify`, { passed });
    return response.data;
  },

  async cancelReturn(returnId, reason) {
    const response = await api.post(`/returns/${returnId}/cancel`, { reason });
    return response.data;
  },
};

export default returnService;
