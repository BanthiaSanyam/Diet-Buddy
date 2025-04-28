const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Authentication Routes
router.post('/register', register);
router.post('/login', login);

// Profile Routes
router.get('/profile', authMiddleware, getProfile);
router.patch('/profile', authMiddleware, updateProfile);

// Compatibility routes (aliases to the endpoints above)
router.get('/me', authMiddleware, getProfile); // Alias for /profile
router.patch('/me', authMiddleware, updateProfile); // Alias for /profile

module.exports = router; 