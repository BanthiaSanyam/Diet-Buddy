const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Register a new user
router.post('/register', userController.register);

// Login user
router.post('/login', userController.login);

// Get user profile (protected route)
router.get('/profile', authMiddleware, userController.getProfile);

// Update user profile (protected route)
router.put('/profile', authMiddleware, userController.updateProfile);

// Update fitness goal (protected route)
router.put('/fitness-goal', authMiddleware, userController.updateFitnessGoal);

// Debug endpoint to check authentication
router.get('/debug', authMiddleware, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Authentication successful',
    userId: req.user.userId,
    tokenData: req.user
  });
});

module.exports = router; 