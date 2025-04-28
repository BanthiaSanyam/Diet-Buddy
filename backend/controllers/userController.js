const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Helper to check if database is connected
const isDatabaseConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Register a new user
exports.register = async (req, res) => {
  try {
    // Check database connection
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database unavailable. Please try again later.' });
    }

    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      // Log registration attempt with existing email
      await logger.logActivity({
        action: 'register',
        details: { 
          email,
          success: false,
          reason: 'User already exists'
        },
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user without any prefilled data
    user = new User({
      name,
      email,
      password
    });

    // Save user to database
    await user.save();
    console.log('User registered successfully:', { id: user.id, email: user.email });

    // Generate JWT token
    const payload = {
      userId: user.id,
      role: user.role
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'dietbuddy_jwt_secret_key_2024',
      { expiresIn: '7d' }
    );

    // Log successful registration
    await logger.logActivity({
      action: 'register',
      user: user.id,
      details: { 
        email: user.email,
        name: user.name,
        success: true
      },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    // Send response - exclude password
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.status(201).json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Register error:', error);
    
    // Log registration error
    await logger.logError({
      error,
      context: { 
        action: 'register',
        email: req.body?.email
      },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    // Check database connection
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database unavailable. Please try again later.' });
    }

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // Log login attempt with non-existent user
      await logger.logActivity({
        action: 'login',
        details: { 
          email,
          success: false,
          reason: 'User not found'
        },
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      
      // Log failed login attempt
      await logger.logActivity({
        action: 'login',
        details: { 
          email,
          userId: user.id,
          success: false,
          reason: 'Invalid password'
        },
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User logged in successfully:', { id: user.id, email: user.email });

    // Generate JWT token
    const payload = {
      userId: user.id,
      role: user.role
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'dietbuddy_jwt_secret_key_2024',
      { expiresIn: '7d' }
    );

    // Log successful login
    await logger.logActivity({
      action: 'login',
      user: user.id,
      details: { 
        email: user.email,
        success: true
      },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    // Send response - exclude password
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      measurements: user.measurements,
      fitnessGoal: user.fitnessGoal
    };

    res.json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Log login error
    await logger.logError({
      error,
      context: { 
        action: 'login',
        email: req.body?.email
      },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    // Check database connection
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database unavailable. Please try again later.' });
    }

    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('favouriteWorkouts')
      .populate('favouriteMeals');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    
    // Log profile retrieval error
    await logger.logError({
      error,
      user: req.user?.userId,
      context: { action: 'getProfile' },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    // Check database connection
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database unavailable. Please try again later.' });
    }
    
    const { name, email, measurements, fitnessGoal, password } = req.body;

    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (measurements) updateFields.measurements = measurements;
    if (fitnessGoal) updateFields.fitnessGoal = fitnessGoal;

    // If password is being updated, hash it
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log profile update
    await logger.logActivity({
      action: 'profile_update',
      user: user.id,
      details: { 
        fieldsUpdated: Object.keys(updateFields),
        passwordChanged: Boolean(password)
      },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    
    // Log profile update error
    await logger.logError({
      error,
      user: req.user?.userId,
      context: { 
        action: 'updateProfile',
        fieldsAttempted: Object.keys(req.body || {})
      },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update fitness goal
exports.updateFitnessGoal = async (req, res) => {
  try {
    // Check database connection
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database unavailable. Please try again later.' });
    }
    
    const { fitnessGoal } = req.body;

    // Validate fitness goal
    const validGoals = ['Strength Training', 'Cardio', 'HIIT', 'Flexibility'];
    if (!fitnessGoal || !validGoals.includes(fitnessGoal)) {
      return res.status(400).json({ 
        message: 'Invalid fitness goal',
        validOptions: validGoals
      });
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { fitnessGoal } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log fitness goal update
    await logger.logActivity({
      action: 'fitness_goal_update',
      user: user.id,
      details: { 
        fitnessGoal,
        previous: user.fitnessGoal
      },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: 'Fitness goal updated successfully',
      user
    });
  } catch (error) {
    console.error('Update fitness goal error:', error);
    
    // Log fitness goal update error
    await logger.logError({
      error,
      user: req.user?.userId,
      context: { 
        action: 'updateFitnessGoal',
        attemptedGoal: req.body?.fitnessGoal
      },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 