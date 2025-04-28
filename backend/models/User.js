const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const measurementSchema = new mongoose.Schema({
  age: Number,
  height: Number,
  weight: Number,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  measurements: measurementSchema,
  fitnessGoal: {
    type: String,
    enum: ['Strength Training', 'Cardio', 'HIIT', 'Flexibility']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isMember: {
    type: Boolean,
    default: false
  },
  membershipType: {
    type: String,
    enum: ['basic', 'monthly', 'premium'],
    default: 'basic'
  },
  membershipExpiry: {
    type: Date
  },
  favouriteWorkouts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout'
  }],
  favouriteMeals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meal'
  }],
  workoutHistory: [{
    workout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workout'
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  mealHistory: [{
    meal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meal'
    },
    consumedAt: {
      type: Date,
      default: Date.now
    }
  }],
  progress: [{
    date: { 
      type: Date, 
      default: Date.now 
    },
    workoutCompleted: Boolean,
    workoutId: String,
    workoutName: String,
    duration: Number,
    calories: Number,
    mealPlanFollowed: Boolean,
    mealId: String,
    mealName: String,
    steps: {
      type: Number,
      default: 0
    }
  }],
  measurements: [{
    date: {
      type: Date,
      default: Date.now
    },
    weight: Number,
    bodyFat: Number,
    muscleMass: Number,
    measurements: {
      chest: Number,
      waist: Number,
      hips: Number,
      thighs: Number,
      arms: Number
    }
  }],
  rewards: {
    coins: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  profileImage: {
    type: String,
    default: 'default-profile.jpg'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema); 