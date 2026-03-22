const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const config = require('../config/env');

const optionalCustomerAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.customer = null;
      return next();
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.CUSTOMER_JWT_SECRET);
    const customer = await Customer.findById(decoded.id).select('-password');
    req.customer = customer || null;
    next();
  } catch {
    req.customer = null;
    next();
  }
};

module.exports = optionalCustomerAuth;
