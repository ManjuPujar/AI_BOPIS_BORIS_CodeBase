const logger = require('../utils/logger');
const config = require('../config/env');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message}`, {
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
  });

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      message: 'Validation Error',
      errors: messages,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      message: `Duplicate value for field: ${field}. This ${field} already exists.`,
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token has expired' });
  }

  const authErrors = [
    'Invalid email or password',
    'Current password is incorrect',
    'Invalid or expired reset token',
    'Invalid or expired refresh token',
    'Refresh token has been revoked',
    'No account found with that email',
  ];
  const conflictErrors = [
    'A customer with this email already exists',
  ];
  const notFoundErrors = [
    'Order not found',
    'Customer not found',
    'Store user not found',
    'Address not found',
  ];
  const badRequestErrors = [
    'Authentication required',
    'Unauthorized access to order',
    'Email is required for guest checkout',
    'Refresh token is required',
  ];

  let statusCode = err.statusCode;
  if (!statusCode) {
    const msg = err.message || '';
    if (authErrors.some((e) => msg.includes(e))) statusCode = 400;
    else if (conflictErrors.some((e) => msg.includes(e))) statusCode = 409;
    else if (notFoundErrors.some((e) => msg.includes(e))) statusCode = 404;
    else if (badRequestErrors.some((e) => msg.includes(e)) || msg.startsWith('Cannot ') || msg.startsWith('Insufficient ')) statusCode = 400;
    else statusCode = 500;
  }

  res.status(statusCode).json({
    message: statusCode >= 500 ? 'Internal server error. Please try again later.' : (err.message || 'Something went wrong'),
    ...(config.NODE_ENV === 'development' && statusCode >= 500 && { detail: err.message, stack: err.stack }),
  });
};

module.exports = errorHandler;
