const User = require('../models/User');
const Workout = require('../models/Workout');
const Meal = require('../models/Meal');
const logger = require('../utils/logger');

// Fallback data for when database isn't available
const fallbackProgress = {
  workouts: [
    { 
      date: new Date('2024-05-01'),
      workoutCompleted: true,
      workoutId: '1',
      workoutName: 'Full Body HIIT',
      calories: 350
    },
    { 
      date: new Date('2024-05-03'),
      workoutCompleted: true,
      workoutId: '2',
      workoutName: 'Core Crusher',
      calories: 200
    },
    { 
      date: new Date('2024-05-05'),
      workoutCompleted: true,
      workoutId: '3',
      workoutName: 'Power Lifts',
      calories: 450
    }
  ],
  meals: [
    {
      date: new Date('2024-05-01'),
      mealPlanFollowed: true,
      mealId: '1',
      mealName: 'Vegetable Stir Fry',
      calories: 320
    },
    {
      date: new Date('2024-05-02'),
      mealPlanFollowed: true,
      mealId: '2',
      mealName: 'Grilled Chicken Salad',
      calories: 350
    },
    {
      date: new Date('2024-05-03'),
      mealPlanFollowed: true,
      mealId: '3',
      mealName: 'Oatmeal with Fruits',
      calories: 280
    }
  ],
  measurements: [
    {
      date: new Date('2024-05-01'),
      weight: 75,
      bodyFat: 18,
      muscleMass: 35
    },
    {
      date: new Date('2024-05-15'),
      weight: 74,
      bodyFat: 17.5,
      muscleMass: 35.5
    }
  ],
  summary: {
    workoutsCompleted: 3,
    caloriesBurned: 1000,
    mealsTracked: 3,
    weightChange: -1,
    streak: 5
  }
};

// Helper to check if database is connected
const isDatabaseConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Add workout to user's history
exports.addWorkoutToHistory = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({ 
        message: 'Database not available. Cannot add workout to history.',
        fallbackData: fallbackProgress.workouts[0]
      });
    }

    const { workoutId, workoutName, duration, calories, completed = true } = req.body;
    
    if (!workoutId) {
      return res.status(400).json({ message: 'Workout ID is required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const progress = {
      date: new Date(),
      workoutCompleted: completed,
      workoutId,
      workoutName,
      duration,
      calories
    };

    user.progress.push(progress);
    await user.save();

    // Log workout completion
    await logger.logWorkoutComplete({
      user: user.id,
      details: {
        workoutId,
        workoutName,
        duration,
        calories,
        completed
      },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    res.json({ progress });
  } catch (error) {
    console.error('Error adding workout to history:', error.message);
    
    // Log error
    await logger.logError({
      error,
      user: req.user?.userId,
      context: { 
        action: 'addWorkoutToHistory',
        workoutId: req.body?.workoutId,
        workoutName: req.body?.workoutName
      },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    res.status(500).json({ message: 'Failed to add workout to history' });
  }
};

// Add meal to user's history
exports.addMealToHistory = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({ 
        message: 'Database not available. Cannot add meal to history.',
        fallbackData: fallbackProgress.meals[0]
      });
    }

    const { mealId, mealName, calories, followed = true } = req.body;
    
    if (!mealId) {
      return res.status(400).json({ message: 'Meal ID is required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const progress = {
      date: new Date(),
      mealPlanFollowed: followed,
      mealId,
      mealName,
      calories
    };

    user.progress.push(progress);
    await user.save();

    // Log meal tracking
    await logger.logMealTracking({
      user: user.id,
      details: {
        mealId,
        mealName,
        calories,
        followed
      },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    res.json({ progress });
  } catch (error) {
    console.error('Error adding meal to history:', error.message);
    
    // Log error
    await logger.logError({
      error,
      user: req.user?.userId,
      context: { 
        action: 'addMealToHistory',
        mealId: req.body?.mealId,
        mealName: req.body?.mealName
      },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    res.status(500).json({ message: 'Failed to add meal to history' });
  }
};

// Get user's workout history
exports.getWorkoutHistory = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      console.log('Using fallback data for getWorkoutHistory');
      return res.json({ workouts: fallbackProgress.workouts });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Extract workout history from user's progress
    const workoutHistory = user.progress
      .filter(p => p.workoutCompleted)
      .map(p => ({
        date: p.date,
        workoutCompleted: p.workoutCompleted,
        workoutId: p.workoutId,
        workoutName: p.workoutName,
        duration: p.duration,
        calories: p.calories
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Log activity view
    await logger.logPageView({
      user: user.id,
      details: { 
        page: 'workout-history',
        recordsCount: workoutHistory.length
      },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    res.json({ workouts: workoutHistory });
  } catch (error) {
    console.error('Error fetching workout history:', error.message);
    
    // Log error
    await logger.logError({
      error,
      user: req.user?.userId,
      context: { action: 'getWorkoutHistory' },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ workouts: fallbackProgress.workouts });
  }
};

// Get user's meal history
exports.getMealHistory = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      console.log('Using fallback data for getMealHistory');
      return res.json({ meals: fallbackProgress.meals });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Extract meal history from user's progress
    const mealHistory = user.progress
      .filter(p => p.mealPlanFollowed !== undefined)
      .map(p => ({
        date: p.date,
        mealPlanFollowed: p.mealPlanFollowed,
        mealId: p.mealId,
        mealName: p.mealName,
        calories: p.calories
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ meals: mealHistory });
  } catch (error) {
    console.error('Error fetching meal history:', error.message);
    res.json({ meals: fallbackProgress.meals });
  }
};

// Get user's measurements history
exports.getMeasurementsHistory = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      console.log('Using fallback data for getMeasurementsHistory');
      return res.json({ measurements: fallbackProgress.measurements });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Extract measurement history
    const measurementHistory = user.measurements || [];
    
    res.json({ measurements: measurementHistory });
  } catch (error) {
    console.error('Error fetching measurement history:', error.message);
    res.json({ measurements: fallbackProgress.measurements });
  }
};

// Get user's progress summary
exports.getProgressSummary = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      console.log('Using fallback data for getProgressSummary');
      return res.json(fallbackProgress.summary);
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate summary statistics
    const workoutsCompleted = user.progress.filter(p => p.workoutCompleted).length;
    const caloriesBurned = user.progress
      .filter(p => p.workoutCompleted && p.calories)
      .reduce((total, p) => total + (p.calories || 0), 0);
    
    const mealsTracked = user.progress.filter(p => p.mealPlanFollowed !== undefined).length;
    
    // Calculate weight change if measurements exist
    let weightChange = 0;
    if (user.measurements && user.measurements.length >= 2) {
      const sortedMeasurements = [...user.measurements].sort((a, b) => new Date(a.date) - new Date(b.date));
      const firstWeight = sortedMeasurements[0].weight;
      const lastWeight = sortedMeasurements[sortedMeasurements.length - 1].weight;
      weightChange = lastWeight - firstWeight;
    }

    // Calculate streak (consecutive days with either workout or meal tracking)
    let streak = 0;
    // Streak logic would be implemented here

    const summary = {
      workoutsCompleted,
      caloriesBurned,
      mealsTracked,
      weightChange,
      streak
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching progress summary:', error.message);
    res.json(fallbackProgress.summary);
  }
};

// Update measurements
exports.updateMeasurements = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({ 
        message: 'Database not available. Cannot update measurements.',
        fallbackData: fallbackProgress.measurements[0]
      });
    }

    const { weight, bodyFat, muscleMass, chest, waist, hips, thighs, arms } = req.body;
    
    if (!weight) {
      return res.status(400).json({ message: 'Weight is required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const measurement = {
      date: new Date(),
      weight,
      bodyFat,
      muscleMass,
      measurements: {
        chest,
        waist,
        hips,
        thighs,
        arms
      }
    };

    if (!user.measurements) {
      user.measurements = [];
    }
    
    user.measurements.push(measurement);
    await user.save();

    res.json({ measurement });
  } catch (error) {
    console.error('Error updating measurements:', error.message);
    res.status(500).json({ message: 'Failed to update measurements' });
  }
}; 