const User = require('../models/User');

/**
 * Middleware to check if user is an admin
 * Requires authMiddleware to be applied before this middleware
 */
module.exports = async (req, res, next) => {
  try {
    // Get user from previous auth middleware
    const userId = req.user.userId;
    
    // Check if user exists and is an admin
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    // User is admin, proceed
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 