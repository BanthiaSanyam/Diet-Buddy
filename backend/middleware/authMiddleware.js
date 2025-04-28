const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth middleware - Token received:', token ? 'Yes' : 'No');

    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'Authentication required. Please login.' });
    }

    // Get JWT secret
    const jwtSecret = process.env.JWT_SECRET || 'dietbuddy_jwt_secret_key_2024';
    
    // Verify token
    try {
      const decoded = jwt.verify(token, jwtSecret);
      console.log('Token verified successfully for user ID:', decoded.userId);
      
      // Add user from payload
      req.user = decoded;
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Your session has expired. Please login again.' });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token. Please login again.' });
      }
      res.status(401).json({ message: 'Authentication failed. Please login again.' });
    }
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(500).json({ message: 'Server error during authentication.' });
  }
};

// Middleware for admin users only
authMiddleware.adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Middleware for premium members only
authMiddleware.memberOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    if (user.role !== 'admin' && !user.isMember) {
      return res.status(403).json({ message: 'This feature requires a premium membership.' });
    }
    next();
  } catch (error) {
    console.error('Member authorization error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = authMiddleware; 