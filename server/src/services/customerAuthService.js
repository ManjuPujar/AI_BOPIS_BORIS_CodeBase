const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Customer = require('../models/Customer');
const config = require('../config/env');
const logger = require('../utils/logger');

const generateToken = (customerId) => {
  return jwt.sign({ id: customerId, type: 'customer' }, config.CUSTOMER_JWT_SECRET, {
    expiresIn: config.CUSTOMER_JWT_EXPIRES_IN,
  });
};

const generateRefreshToken = (customerId) => {
  return jwt.sign({ id: customerId, type: 'customer' }, config.CUSTOMER_JWT_SECRET + '_refresh', {
    expiresIn: '30d',
  });
};

const registerCustomer = async ({ firstName, lastName, email, password, phone }) => {
  const existing = await Customer.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new Error('A customer with this email already exists');
  }

  const customer = await Customer.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    passwordHash: password,
    phone,
  });

  const accessToken = generateToken(customer._id);
  const refreshToken = generateRefreshToken(customer._id);

  customer.refreshToken = refreshToken;
  await customer.save();

  logger.info(`New customer registered: ${customer.email}`);

  return {
    customer: customer.toJSON(),
    accessToken,
    refreshToken,
  };
};

const loginCustomer = async (email, password) => {
  const customer = await Customer.findOne({ email: email.toLowerCase(), isActive: true });
  if (!customer) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await customer.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const accessToken = generateToken(customer._id);
  const refreshToken = generateRefreshToken(customer._id);

  customer.refreshToken = refreshToken;
  customer.lastLogin = new Date();
  await customer.save();

  logger.info(`Customer logged in: ${customer.email}`);

  return {
    customer: customer.toJSON(),
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token) => {
  if (!token) {
    throw new Error('Refresh token is required');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.CUSTOMER_JWT_SECRET + '_refresh');
  } catch (err) {
    throw new Error('Invalid or expired refresh token');
  }

  const customer = await Customer.findById(decoded.id);
  if (!customer || !customer.isActive) {
    throw new Error('Customer not found');
  }

  if (customer.refreshToken !== token) {
    throw new Error('Refresh token has been revoked');
  }

  const accessToken = generateToken(customer._id);

  return { accessToken };
};

const forgotPassword = async (email) => {
  const customer = await Customer.findOne({ email: email.toLowerCase() });
  if (!customer) {
    throw new Error('No account found with that email');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  customer.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  customer.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
  await customer.save();

  logger.info(`Password reset requested for: ${customer.email}`);

  return resetToken;
};

const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const customer = await Customer.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!customer) {
    throw new Error('Invalid or expired reset token');
  }

  customer.passwordHash = newPassword;
  customer.resetPasswordToken = undefined;
  customer.resetPasswordExpires = undefined;
  customer.refreshToken = undefined;
  await customer.save();

  logger.info(`Password reset completed for: ${customer.email}`);
};

const changePassword = async (customerId, currentPassword, newPassword) => {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }

  const isMatch = await customer.comparePassword(currentPassword);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  customer.passwordHash = newPassword;
  customer.refreshToken = undefined;
  await customer.save();

  logger.info(`Password changed for customer: ${customer.email}`);
};

const getProfile = async (customerId) => {
  const customer = await Customer.findById(customerId).select('-passwordHash');
  if (!customer) {
    throw new Error('Customer not found');
  }
  return customer;
};

const updateProfile = async (customerId, updates) => {
  const allowedFields = ['firstName', 'lastName', 'phone'];
  const sanitized = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      sanitized[key] = updates[key];
    }
  }

  const customer = await Customer.findByIdAndUpdate(customerId, sanitized, {
    new: true,
    runValidators: true,
  }).select('-passwordHash');

  if (!customer) {
    throw new Error('Customer not found');
  }

  return customer;
};

const addAddress = async (customerId, address) => {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }

  if (address.isDefault) {
    customer.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  customer.addresses.push(address);
  await customer.save();

  return customer.addresses;
};

const updateAddress = async (customerId, addressId, address) => {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }

  const addr = customer.addresses.id(addressId);
  if (!addr) {
    throw new Error('Address not found');
  }

  if (address.isDefault) {
    customer.addresses.forEach((a) => {
      a.isDefault = false;
    });
  }

  Object.assign(addr, address);
  await customer.save();

  return customer.addresses;
};

const deleteAddress = async (customerId, addressId) => {
  const customer = await Customer.findByIdAndUpdate(
    customerId,
    { $pull: { addresses: { _id: addressId } } },
    { new: true }
  ).select('-passwordHash');

  if (!customer) {
    throw new Error('Customer not found');
  }

  return customer.addresses;
};

const clearRefreshToken = async (customerId) => {
  await Customer.findByIdAndUpdate(customerId, { $unset: { refreshToken: 1 } });
  logger.info(`Refresh token cleared for customer: ${customerId}`);
};

module.exports = {
  registerCustomer,
  loginCustomer,
  generateToken,
  generateRefreshToken,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  clearRefreshToken,
};
