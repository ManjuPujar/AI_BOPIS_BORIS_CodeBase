const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
} = require('../../controllers/customer/authController');
const customerAuth = require('../../middleware/customerAuth');
const { authLimiter } = require('../../middleware/rateLimiter');
const validateRequest = require('../../middleware/validateRequest');
const {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require('../../validators/authValidator');

router.post('/register', authLimiter, registerValidation, validateRequest, register);
router.post('/login', authLimiter, loginValidation, validateRequest, login);
router.post('/logout', customerAuth, logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPasswordValidation, validateRequest, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validateRequest, resetPassword);

router.get('/me', customerAuth, getProfile);
router.put('/profile', customerAuth, updateProfile);
router.put('/change-password', customerAuth, changePasswordValidation, validateRequest, changePassword);

router.post('/addresses', customerAuth, addAddress);
router.put('/addresses/:addressId', customerAuth, updateAddress);
router.delete('/addresses/:addressId', customerAuth, deleteAddress);

module.exports = router;
