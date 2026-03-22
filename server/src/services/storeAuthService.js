const jwt = require('jsonwebtoken');
const StoreUser = require('../models/StoreUser');
const config = require('../config/env');
const logger = require('../utils/logger');

const generateToken = (userId) => {
  return jwt.sign({ id: userId, type: 'store' }, config.STORE_JWT_SECRET, {
    expiresIn: config.STORE_JWT_EXPIRES_IN,
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId, type: 'store' }, config.STORE_JWT_SECRET + '_refresh', {
    expiresIn: '8h',
  });
};

const loginStoreUser = async (email, password) => {
  const user = await StoreUser.findOne({ email: email.toLowerCase(), isActive: true });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  logger.info(`Store user logged in: ${user.email} (${user.role})`);

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
};

const getProfile = async (userId) => {
  const user = await StoreUser.findById(userId)
    .select('-passwordHash')
    .populate('storeId', 'name storeCode address phone');

  if (!user) {
    throw new Error('Store user not found');
  }

  return user;
};

const logoutStoreUser = async (userId) => {
  const user = await StoreUser.findById(userId);
  if (!user) {
    throw new Error('Store user not found');
  }

  user.refreshToken = undefined;
  await user.save();

  logger.info(`Store user logged out: ${user.email}`);
};

module.exports = {
  loginStoreUser,
  generateToken,
  generateRefreshToken,
  getProfile,
  logoutStoreUser,
};
