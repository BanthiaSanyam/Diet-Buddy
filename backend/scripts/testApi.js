const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_URL = `http://localhost:${process.env.PORT || 5008}/api`;

// Test user data
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'test123456'
};

let authToken;

// Helper to make API requests with optional token
async function apiRequest(method, endpoint, data = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      data,
      headers
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Test health endpoint
async function testHealth() {
  console.log('\n=== Testing Health Endpoint ===');
  const result = await apiRequest('get', '/health');
  
  if (result.success) {
    console.log('✅ Health check passed');
    console.log('Server status:', result.data.status);
    console.log('Database status:', result.data.dbConnection);
  } else {
    console.error('❌ Health check failed:', result.error);
  }
  
  return result.success;
}

// Test registration
async function testRegistration() {
  console.log('\n=== Testing User Registration ===');
  console.log('Registering test user:', testUser.email);
  
  const result = await apiRequest('post', '/users/register', testUser);
  
  if (result.success) {
    console.log('✅ Registration successful');
    console.log('User ID:', result.data.user.id);
    authToken = result.data.token;
    console.log('Token received:', authToken ? '✅' : '❌');
  } else {
    console.error('❌ Registration failed:', result.error);
  }
  
  return result.success;
}

// Test login
async function testLogin() {
  console.log('\n=== Testing User Login ===');
  console.log('Logging in as:', testUser.email);
  
  const result = await apiRequest('post', '/users/login', {
    email: testUser.email,
    password: testUser.password
  });
  
  if (result.success) {
    console.log('✅ Login successful');
    authToken = result.data.token;
    console.log('Token received:', authToken ? '✅' : '❌');
  } else {
    console.error('❌ Login failed:', result.error);
  }
  
  return result.success;
}

// Test fetching user profile
async function testProfile() {
  console.log('\n=== Testing Profile Fetch ===');
  
  if (!authToken) {
    console.error('❌ No auth token available');
    return false;
  }
  
  const result = await apiRequest('get', '/users/profile', null, authToken);
  
  if (result.success) {
    console.log('✅ Profile fetch successful');
    console.log('User data:', result.data);
  } else {
    console.error('❌ Profile fetch failed:', result.error);
  }
  
  return result.success;
}

// Main test function
async function runTests() {
  console.log('=== API Tests ===');
  console.log('API URL:', API_URL);
  
  try {
    // Run tests in sequence
    const healthOk = await testHealth();
    if (!healthOk) {
      throw new Error('Server health check failed');
    }
    
    const registrationOk = await testRegistration();
    const loginOk = await testLogin();
    
    if (authToken) {
      await testProfile();
    }
    
    console.log('\n=== Test Summary ===');
    console.log('Health Check:', healthOk ? '✅' : '❌');
    console.log('Registration:', registrationOk ? '✅' : '❌');
    console.log('Login:', loginOk ? '✅' : '❌');
    console.log('Profile:', authToken ? '✅' : '❌');
    
  } catch (error) {
    console.error('\n❌ Tests failed with error:', error.message);
  }
}

// Run the tests
runTests(); 