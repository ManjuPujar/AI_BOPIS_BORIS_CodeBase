import api from './api';

export const createReturn = async (returnData) => {
  const response = await api.post('/returns', returnData);
  return response.data;
};

export const getMyReturns = async () => {
  const response = await api.get('/returns');
  return response.data;
};
