require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const API_URL = `http://localhost:${process.env.PORT || 5007}/api`;

// Test user data with unique email to avoid duplicates
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'Test123456'
};

// Store registration response for debugging
let registeredUserData = null;

// Verify MongoDB connection
const testDatabaseConnection = async () => {
  try {
    console.log('Testing MongoDB Atlas connection...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority'
    });
    console.log('✅ MongoDB Atlas connection successful');
    return true;
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:', error.message);
    console.error('Check your MongoDB Atlas credentials and network connection');
    return false;
  }
};

// Test server health
const testServerHealth = async () => {
  try {
    console.log('Testing server health...');
    await axios.get(`${API_URL}/health`);
    console.log('✅ Server is running and responding to API requests');
    return true;
  } catch (error) {
    try {
      // Try alternate health endpoint
      await axios.get(`${API_URL}/workouts`);
      console.log('✅ Server is running and responding to API requests via /workouts');
      return true;
    } catch (error2) {
      console.error('❌ Server health check failed:', error.message);
      return false;
    }
  }
};

// Directly check for test user in database
const checkTestUserInDb = async () => {
  try {
    console.log('Checking database for test user...');
    const user = await User.findOne({ email: testUser.email });
    
    if (user) {
      console.log('ℹ️ Found test user in database:', user._id);
      console.log('   Email:', user.email);
      console.log('   Password hash length:', user.password ? user.password.length : 'No password');
      return user;
    } else {
      console.log('ℹ️ Test user not found in database');
      return null;
    }
  } catch (error) {
    console.error('❌ Error checking for test user:', error.message);
    return null;
  }
};

// Test user registration
const testUserRegistration = async () => {
  try {
    console.log('Testing user registration...');
    // Check if test user already exists in database
    const existingUser = await checkTestUserInDb();
    
    if (existingUser) {
      console.log('ℹ️ Deleting existing test user before registration');
      await User.deleteOne({ email: testUser.email });
    }
    
    const response = await axios.post(`${API_URL}/auth/register`, testUser);
    console.log('✅ User registration successful');
    console.log('   User ID:', response.data.user.id);
    console.log('   Received token:', !!response.data.token);
    
    // Store registration data for debugging login
    registeredUserData = response.data;
    return response.data;
  } catch (error) {
    console.error('❌ User registration failed:', error.response?.data?.message || error.message);
    return null;
  }
};

// Test user login
const testUserLogin = async (userData) => {
  try {
    console.log('Testing user login...');
    
    // Check database state before login
    const dbUser = await checkTestUserInDb();
    
    const loginData = {
      email: registeredUserData?.user?.email || testUser.email,
      password: testUser.password
    };
    
    console.log('Attempting login with:', loginData.email);
    console.log('Password used for login:', loginData.password);
    
    if (dbUser) {
      // For debugging only - log the password hash
      console.log('Stored password hash in DB:', dbUser.password);
    }
    
    const response = await axios.post(`${API_URL}/auth/login`, loginData);
    console.log('✅ User login successful');
    console.log('   Received token:', !!response.data.token);
    return response.data.token;
  } catch (error) {
    console.error('❌ User login failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Error details:', JSON.stringify(error.response.data));
    }
    return null;
  }
};

// Test protected endpoint
const testProtectedEndpoint = async (token) => {
  if (!token) {
    console.error('❌ Cannot test protected endpoint: No token available');
    return false;
  }
  
  try {
    console.log('Testing protected endpoint (user profile)...');
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        'x-auth-token': token
      }
    });
    console.log('✅ Protected endpoint access successful');
    console.log('   User ID:', response.data._id || response.data.id);
    return true;
  } catch (error) {
    console.error('❌ Protected endpoint access failed:', error.response?.data?.message || error.message);
    return false;
  }
};

// Test meal data
const testMealData = async () => {
  try {
    console.log('Testing meal data...');
    const response = await axios.get(`${API_URL}/meals`);
    console.log(`✅ Meal data retrieved successfully, found ${response.data.length} meals`);
    return response.data.length > 0;
  } catch (error) {
    console.error('❌ Meal data retrieval failed:', error.response?.data?.message || error.message);
    return false;
  }
};

// Test workout data
const testWorkoutData = async () => {
  try {
    console.log('Testing workout data...');
    const response = await axios.get(`${API_URL}/workouts`);
    console.log(`✅ Workout data retrieved successfully, found ${response.data.length} workouts`);
    return response.data.length > 0;
  } catch (error) {
    console.error('❌ Workout data retrieval failed:', error.response?.data?.message || error.message);
    return false;
  }
};

// Run all verification tests
const runVerification = async () => {
  console.log('Starting DietBuddy setup verification...');
  
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.error('⚠️ Verification cannot continue without database connection');
    process.exit(1);
  }
  
  // Disconnect and reconnect to ensure a fresh connection
  await mongoose.disconnect();
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  const serverRunning = await testServerHealth();
  if (!serverRunning) {
    console.error('⚠️ Verification cannot continue without server connection');
    process.exit(1);
  }
  
  const userData = await testUserRegistration();
  const token = await testUserLogin(userData);
  const protectedEndpointWorks = await testProtectedEndpoint(token);
  const mealDataExists = await testMealData();
  const workoutDataExists = await testWorkoutData();
  
  console.log('\n--- Verification Summary ---');
  console.log(`Database Connection: ${dbConnected ? '✅' : '❌'}`);
  console.log(`Server Health: ${serverRunning ? '✅' : '❌'}`);
  console.log(`User Registration: ${userData ? '✅' : '❌'}`);
  console.log(`User Login: ${token ? '✅' : '❌'}`);
  console.log(`Protected Endpoints: ${protectedEndpointWorks ? '✅' : '❌'}`);
  console.log(`Meal Data: ${mealDataExists ? '✅' : '❌'}`);
  console.log(`Workout Data: ${workoutDataExists ? '✅' : '❌'}`);
  
  if (dbConnected && serverRunning && userData && token && protectedEndpointWorks && mealDataExists && workoutDataExists) {
    console.log('\n🎉 All checks passed! The DietBuddy app is properly set up and connected to MongoDB.');
  } else {
    console.log('\n⚠️ Some checks failed. Please review the issues above.');
  }
  
  // Clean up - disconnect from database
  await mongoose.disconnect();
};

// Run the verification
runVerification().catch(error => {
  console.error('Verification process failed with error:', error);
  mongoose.disconnect();
  process.exit(1);
}); 