import api from './api';

const inventoryService = {
  async getInventory(page = 1, limit = 20, search = '') {
    const params = { page, limit };
    if (search) params.sku = search;
    const response = await api.get('/inventory', { params });
    return response.data;
  },

  async getInventoryItem(id) {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  async updateInventory(id, quantityOnHand) {
    const response = await api.put(`/inventory/${id}`, { quantityOnHand });
    return response.data;
  },
};

export default inventoryService;
