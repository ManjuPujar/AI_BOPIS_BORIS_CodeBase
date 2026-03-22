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

  const knownErrors = [
    'Invalid email or password',
    'A customer with this email already exists',
    'Order not found',
    'Authentication required',
    'Unauthorized access to order',
    'Email is required for guest checkout',
  ];
  const isKnown = knownErrors.some((msg) => err.message?.includes(msg)) || err.message?.startsWith('Cannot ') || err.message?.startsWith('Insufficient ');
  const statusCode = err.statusCode || (isKnown ? 400 : 500);
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
