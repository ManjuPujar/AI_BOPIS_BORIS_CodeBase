const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.storeUser) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.storeUser.role)) {
      return res.status(403).json({
        message: 'Access denied. You do not have the required permissions.',
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
