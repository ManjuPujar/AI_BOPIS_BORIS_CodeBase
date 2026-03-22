const jwt = require('jsonwebtoken');
const StoreUser = require('../models/StoreUser');
const config = require('../config/env');

const storeAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, config.STORE_JWT_SECRET);

    const storeUser = await StoreUser.findById(decoded.id).select('-password');
    if (!storeUser) {
      return res.status(401).json({ message: 'Store user not found, authorization denied' });
    }

    req.storeUser = storeUser;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(401).json({ message: 'Authorization denied' });
  }
};

module.exports = storeAuth;
