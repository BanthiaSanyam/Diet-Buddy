const mongoose = require('mongoose');

const userLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous logs
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'register',
      'view_page',
      'complete_workout',
      'meal_tracking',
      'steps_tracking',
      'badge_earned',
      'payment',
      'profile_update',
      'error'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Flexible schema for different types of logs
    default: {}
  },
  ip: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries by timestamp
userLogSchema.index({ timestamp: -1 });
// Index for user-specific queries
userLogSchema.index({ user: 1, timestamp: -1 });
// Index for action-specific queries
userLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('UserLog', userLogSchema); 