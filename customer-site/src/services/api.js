import axios from 'axios';
import { getToken, removeToken, removeRefreshToken } from '../utils/tokenStorage';

const api = axios.create({
  baseURL: (process.env.REACT_APP_API_URL || 'http://localhost:5000/api') + '/customer',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const hadToken = !!getToken();
      removeToken();
      removeRefreshToken();
      if (hadToken && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
