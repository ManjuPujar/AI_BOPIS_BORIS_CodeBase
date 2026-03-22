import api from './api';

export const searchStores = async (zipcode, productId) => {
  const params = { zipcode };
  if (productId) params.productId = productId;
  const response = await api.get('/stores/search', { params });
  return response.data;
};

export const getStoreInventory = async (storeId, productId) => {
  const params = {};
  if (productId) params.productId = productId;
  const response = await api.get(`/stores/${storeId}/inventory`, { params });
  return response.data;
};
