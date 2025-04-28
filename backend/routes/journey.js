const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// All journey routes require authentication
router.use(authMiddleware);

// Get all progress records for the authenticated user
router.get('/', async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user.userId })
      .sort({ date: -1 });
    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get latest progress record
router.get('/latest', async (req, res) => {
  try {
    const progress = await Progress.findOne({ user: req.user.userId })
      .sort({ date: -1 });
    
    if (!progress) {
      return res.status(404).json({ message: 'No progress records found' });
    }
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching latest progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Calculate BMI
const calculateBMI = (weight, height) => {
  // Weight in kg, height in cm
  return (weight / Math.pow(height/100, 2)).toFixed(2);
};

// Add new progress record
router.post('/', async (req, res) => {
  try {
    const { weight, height, measurements, notes } = req.body;
    
    if (!weight || !height) {
      return res.status(400).json({ message: 'Weight and height are required' });
    }
    
    // Calculate BMI
    const bmi = calculateBMI(weight, height);
    
    const newProgress = new Progress({
      user: req.user.userId,
      weight,
      height,
      bmi,
      measurements,
      notes
    });
    
    const progress = await newProgress.save();
    
    // Add reward coins for tracking progress
    try {
      const user = await User.findById(req.user.userId);
      if (user) {
        // Create reward if it doesn't exist
        if (!user.rewards) {
          user.rewards = { coins: 0 };
        }
        
        // Add 3 coins for tracking progress
        user.rewards.coins += 3;
        await user.save();
      }
    } catch (rewardError) {
      console.error('Error updating rewards:', rewardError);
      // Continue even if reward update fails
    }
    
    res.json(progress);
  } catch (error) {
    console.error('Error adding progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update progress record
router.put('/:id', async (req, res) => {
  try {
    const { weight, height, measurements, notes } = req.body;
    
    // Calculate BMI if weight and height are provided
    let bmi;
    if (weight && height) {
      bmi = calculateBMI(weight, height);
    }
    
    // Find progress record
    const progress = await Progress.findById(req.params.id);
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress record not found' });
    }
    
    // Check if user owns this record
    if (progress.user.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'Not authorized to update this record' });
    }
    
    // Update fields if provided
    if (weight) progress.weight = weight;
    if (height) progress.height = height;
    if (bmi) progress.bmi = bmi;
    if (measurements) progress.measurements = measurements;
    if (notes) progress.notes = notes;
    
    await progress.save();
    res.json(progress);
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete progress record
router.delete('/:id', async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id);
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress record not found' });
    }
    
    // Check if user owns this record
    if (progress.user.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'Not authorized to delete this record' });
    }
    
    await progress.remove();
    res.json({ message: 'Progress record removed' });
  } catch (error) {
    console.error('Error deleting progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get progress summary (for charts and statistics)
router.get('/summary', async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user.userId })
      .sort({ date: 1 });
    
    if (!progress || progress.length === 0) {
      return res.status(404).json({ message: 'No progress records found' });
    }
    
    // Extract data for charts
    const dates = progress.map(p => p.date);
    const weights = progress.map(p => p.weight);
    const bmis = progress.map(p => p.bmi);
    
    // Calculate changes
    let weightChange = 0;
    let bmiChange = 0;
    
    if (progress.length > 1) {
      const first = progress[0];
      const last = progress[progress.length - 1];
      
      weightChange = (last.weight - first.weight).toFixed(1);
      bmiChange = (last.bmi - first.bmi).toFixed(2);
    }
    
    res.json({
      dates,
      weights,
      bmis,
      weightChange,
      bmiChange,
      currentWeight: progress[progress.length - 1].weight,
      currentBMI: progress[progress.length - 1].bmi
    });
  } catch (error) {
    console.error('Error fetching progress summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 