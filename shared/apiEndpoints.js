const BASE = '/api';

const CUSTOMER_API = {
  AUTH: {
    REGISTER: `${BASE}/customer/auth/register`,
    LOGIN: `${BASE}/customer/auth/login`,
    LOGOUT: `${BASE}/customer/auth/logout`,
    REFRESH: `${BASE}/customer/auth/refresh-token`,
    ME: `${BASE}/customer/auth/me`,
    PROFILE: `${BASE}/customer/auth/profile`,
    CHANGE_PASSWORD: `${BASE}/customer/auth/change-password`,
    FORGOT_PASSWORD: `${BASE}/customer/auth/forgot-password`,
    RESET_PASSWORD: `${BASE}/customer/auth/reset-password`,
    ADDRESSES: `${BASE}/customer/auth/addresses`,
  },
  PRODUCTS: `${BASE}/customer/products`,
  STORES: `${BASE}/customer/stores`,
  CART: `${BASE}/customer/cart`,
  ORDERS: `${BASE}/customer/orders`,
  RETURNS: `${BASE}/customer/returns`,
};

const STORE_API = {
  AUTH: {
    LOGIN: `${BASE}/store/auth/login`,
    LOGOUT: `${BASE}/store/auth/logout`,
    ME: `${BASE}/store/auth/me`,
  },
  ORDERS: `${BASE}/store/orders`,
  RETURNS: `${BASE}/store/returns`,
  INVENTORY: `${BASE}/store/inventory`,
};

module.exports = { CUSTOMER_API, STORE_API };
