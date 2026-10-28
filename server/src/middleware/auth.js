const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secure_ward_management_jwt_secret_key_2026'
      );

      const user = await User.findById(decoded.id).select('-password');
      if (!user || !user.isActive) {
        return res.status(401).json({ success: false, message: 'User not authorized or inactive.' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Authorization token required.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user?.role}' does not have sufficient permissions.`,
      });
    }
    next();
  };
};

// Check if user is allowed to access/modify data for this wardId
const verifyWardAccess = (req, res, next) => {
  const wardId = req.params.wardId || req.query.wardId || req.body.wardId;

  // Superadmins and Auditors can access all wards
  if (req.user.role === 'superadmin' || req.user.role === 'auditor') {
    return next();
  }

  // If user has specific assigned wards
  if (wardId && req.user.assignedWards && req.user.assignedWards.length > 0) {
    const isAssigned = req.user.assignedWards.some(
      (id) => id.toString() === wardId.toString()
    );
    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission for the requested ward.',
      });
    }
  }

  next();
};

module.exports = { protect, authorize, verifyWardAccess };
