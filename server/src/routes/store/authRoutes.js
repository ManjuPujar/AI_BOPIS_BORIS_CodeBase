const express = require('express');
const router = express.Router();
const {
  login,
  logout,
  getProfile,
} = require('../../controllers/store/authController');
const storeAuth = require('../../middleware/storeAuth');
const { authLimiter } = require('../../middleware/rateLimiter');
const validateRequest = require('../../middleware/validateRequest');
const { loginValidation } = require('../../validators/authValidator');

router.post('/login', authLimiter, loginValidation, validateRequest, login);
router.post('/logout', storeAuth, logout);
router.get('/me', storeAuth, getProfile);

module.exports = router;
