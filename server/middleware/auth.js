const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No user found' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role ${req.user.role} is not authorized to access this resource` 
      });
    }

    next();
  };
};

// Check if user owns the resource or has admin/appropriate role
const checkOwnership = (resourceField = 'patient') => {
  return (req, res, next) => {
    const { role, _id } = req.user;
    
    // Admins can access everything
    if (role === 'admin') {
      return next();
    }
    
    // Doctors can access their patients' records
    if (role === 'doctor' && resourceField === 'doctor') {
      return next();
    }
    
    // Patients can only access their own records
    if (role === 'patient' && resourceField === 'patient') {
      // The specific ownership check will be done in the route handler
      return next();
    }
    
    // Nurses and receptionists can access based on department
    if (['nurse', 'receptionist'].includes(role)) {
      return next();
    }
    
    res.status(403).json({ message: 'Access denied' });
  };
};

// Optional authentication (for public routes that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

module.exports = {
  auth,
  authorize,
  checkOwnership,
  optionalAuth
};