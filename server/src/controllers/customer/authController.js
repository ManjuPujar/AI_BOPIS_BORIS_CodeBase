const customerAuthService = require('../../services/customerAuthService');
const emailService = require('../../services/emailService');

const register = async (req, res, next) => {
  try {
    const result = await customerAuthService.registerCustomer(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await customerAuthService.loginCustomer(email, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await customerAuthService.clearRefreshToken(req.customer._id);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const result = await customerAuthService.refreshToken(req.body.refreshToken);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const resetToken = await customerAuthService.forgotPassword(req.body.email);
    await emailService.sendPasswordResetEmail(req.body.email, resetToken);
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    await customerAuthService.resetPassword(req.body.token, req.body.newPassword);
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const customer = await customerAuthService.getProfile(req.customer._id);
    res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const customer = await customerAuthService.updateProfile(req.customer._id, req.body);
    res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    await customerAuthService.changePassword(
      req.customer._id,
      req.body.currentPassword,
      req.body.newPassword
    );
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

const addAddress = async (req, res, next) => {
  try {
    const customer = await customerAuthService.addAddress(req.customer._id, req.body);
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const customer = await customerAuthService.updateAddress(
      req.customer._id,
      req.params.addressId,
      req.body
    );
    res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const customer = await customerAuthService.deleteAddress(
      req.customer._id,
      req.params.addressId
    );
    res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
