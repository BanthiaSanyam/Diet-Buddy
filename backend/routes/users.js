const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

// Get current user (protected)
router.get('/me', authMiddleware, userController.getProfile);

// Update user profile (protected)
router.put('/me', authMiddleware, userController.updateProfile);

// Add workout to favorites (protected)
router.post('/favorites/workouts/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const workoutId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.favouriteWorkouts.includes(workoutId)) {
      user.favouriteWorkouts.push(workoutId);
      await user.save();
    }
    
    res.json({ message: 'Workout added to favorites' });
  } catch (error) {
    console.error('Error adding workout to favorites:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove workout from favorites (protected)
router.delete('/favorites/workouts/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const workoutId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.favouriteWorkouts = user.favouriteWorkouts.filter(
      id => id.toString() !== workoutId
    );
    await user.save();
    
    res.json({ message: 'Workout removed from favorites' });
  } catch (error) {
    console.error('Error removing workout from favorites:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add meal to favorites (protected)
router.post('/favorites/meals/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const mealId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.favouriteMeals.includes(mealId)) {
      user.favouriteMeals.push(mealId);
      await user.save();
    }
    
    res.json({ message: 'Meal added to favorites' });
  } catch (error) {
    console.error('Error adding meal to favorites:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove meal from favorites (protected)
router.delete('/favorites/meals/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const mealId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.favouriteMeals = user.favouriteMeals.filter(
      id => id.toString() !== mealId
    );
    await user.save();
    
    res.json({ message: 'Meal removed from favorites' });
  } catch (error) {
    console.error('Error removing meal from favorites:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update fitness goal (protected)
router.post('/fitness-goal', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goal } = req.body;
    
    if (!goal) {
      return res.status(400).json({ message: 'Please provide a fitness goal' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.fitnessGoal = goal;
    await user.save();

    res.json({ 
      success: true,
      message: 'Fitness goal updated successfully',
      fitnessGoal: goal
    });
  } catch (error) {
    console.error('Error updating fitness goal:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 