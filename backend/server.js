const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Middlewares
const loggerMiddleware = require('./middleware/loggerMiddleware');

// Utility
const logger = require('./utils/logger');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const workoutRoutes = require('./routes/workouts');
const mealRoutes = require('./routes/meals');
const progressRoutes = require('./routes/progress');
const paymentRoutes = require('./routes/payments');
const communityRoutes = require('./routes/community');
const blogRoutes = require('./routes/blogs');
const journeyRoutes = require('./routes/journey');
const rewardsRoutes = require('./routes/rewards');
const logsRoutes = require('./routes/logs');
const chatbotRoutes = require('./routes/chatbot');
const progressPhotosRoutes = require('./routes/progressPhotos');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Explicitly check the loaded MongoDB URI
console.log('MongoDB URI from env:', process.env.MONGODB_URI ? 'Available' : 'Not available');

// Check for required environment variables
if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is required');
  process.exit(1);
}

// Check for required environment variables
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is required');
  process.exit(1);
}

// Check Razorpay credentials
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('WARNING: Razorpay credentials are missing or invalid. Payment functionality will be limited.');
  console.warn('Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.');
  
  // Create placeholder values for development (these won't work for real payments)
  if (process.env.NODE_ENV === 'development') {
    console.log('Setting placeholder Razorpay credentials for development');
    process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
    process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
  }
} else {
  console.log(`Razorpay credentials loaded successfully.`);
  console.log(`Key ID: ${process.env.RAZORPAY_KEY_ID.substring(0, 10)}...`);
  // Don't log the secret key, just confirm it exists
  console.log(`Secret: ${process.env.RAZORPAY_KEY_SECRET ? '******** (available)' : 'MISSING'}`);
}

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// MongoDB Atlas logging middleware
app.use(loggerMiddleware);

// MongoDB Connection with Atlas-specific options
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    
    // Use the MongoDB Atlas URI from environment variables
    const mongoURI = process.env.MONGODB_URI;
    console.log('Using MongoDB Atlas URI from environment variables');
    
    const mongoOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      directConnection: false,
      retryWrites: true,
      w: 'majority',
      ssl: true
    };
    
    const conn = await mongoose.connect(mongoURI, mongoOptions);
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('MongoDB Atlas connection error:', error.message);
    console.error('Check your MongoDB credentials and network connection');
    
    // Proceed with server startup even if database connection fails
    console.warn('Starting server without database connection. Features requiring database will be limited.');
    return false;
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/workouts', workoutRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/journey', journeyRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/progress-photos', progressPhotosRoutes);

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running', 
    time: new Date().toISOString(),
    dbConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API is running', 
    time: new Date().toISOString(),
    dbConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.url}` });
});

// Error handling middleware
app.use(async (err, req, res, next) => {
  // Log the error to MongoDB Atlas
  try {
    await logger.logError({
      error: err,
      user: req.user?.userId,
      context: {
        path: req.path,
        method: req.method,
        query: req.query,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      }
    });
  } catch (logError) {
    console.error('Error logging to MongoDB:', logError);
  }

  // Log to console
  console.error('Server error:', err);
  
  // Send response
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.stack
  });
});

// Initialize database and start server
const PORT = process.env.PORT || 5007;
connectDB().then(connected => {
  if (connected) {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API URL: http://localhost:${PORT}/api`);
    });
  } else {
    console.error('WARNING: Server started without database connection. Some features may not work.');
    app.listen(PORT, () => {
      console.log(`Server running WITHOUT DATABASE on port ${PORT}`);
    });
  }
}); 
