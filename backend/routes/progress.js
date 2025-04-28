const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Add workout to history
router.post('/workouts', progressController.addWorkoutToHistory);

// Add meal to history
router.post('/meals', progressController.addMealToHistory);

// Get workout history
router.get('/workouts', progressController.getWorkoutHistory);

// Get meal history
router.get('/meals', progressController.getMealHistory);

// Get progress summary
router.get('/summary', progressController.getProgressSummary);

module.exports = router; 