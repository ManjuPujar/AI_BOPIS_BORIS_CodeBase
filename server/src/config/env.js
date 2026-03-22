const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/converse_bopis',
  CUSTOMER_JWT_SECRET: process.env.CUSTOMER_JWT_SECRET || 'converse-customer-dev-secret-key-2024',
  STORE_JWT_SECRET: process.env.STORE_JWT_SECRET || 'converse-store-dev-secret-key-2024',
  CUSTOMER_JWT_EXPIRES_IN: process.env.CUSTOMER_JWT_EXPIRES_IN || '7d',
  STORE_JWT_EXPIRES_IN: process.env.STORE_JWT_EXPIRES_IN || '8h',
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@converse.com',
  GEOCODE_API_KEY: process.env.GEOCODE_API_KEY,
  NODE_ENV: process.env.NODE_ENV || 'development',
  USE_MEMORY_DB: process.env.USE_MEMORY_DB || 'false',
};

module.exports = config;
