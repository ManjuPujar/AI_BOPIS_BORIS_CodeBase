const storeAuthService = require('../../services/storeAuthService');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await storeAuthService.loginStoreUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await storeAuthService.logoutStoreUser(req.storeUser._id);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const profile = await storeAuthService.getProfile(req.storeUser._id);
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  getProfile,
};
