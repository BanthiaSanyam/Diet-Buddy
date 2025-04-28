const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const API_URL = 'http://localhost:5007/api';

async function testRoutes() {
  console.log('Testing API routes...\n');
  
  try {
    // Test meals endpoints
    console.log('Testing GET /meals (All meals)');
    const mealsResponse = await axios.get(`${API_URL}/meals`);
    console.log(`Status: ${mealsResponse.status}`);
    console.log(`Total meals: ${mealsResponse.data.length}`);
    
    // Test meals by category
    console.log('\nTesting GET /meals/category/Vegetarian');
    const vegMealsResponse = await axios.get(`${API_URL}/meals/category/Vegetarian`);
    console.log(`Status: ${vegMealsResponse.status}`);
    console.log(`Vegetarian meals: ${vegMealsResponse.data.length}`);
    
    // Test meals by type
    console.log('\nTesting GET /meals/type/Dinner');
    const dinnerMealsResponse = await axios.get(`${API_URL}/meals/type/Dinner`);
    console.log(`Status: ${dinnerMealsResponse.status}`);
    console.log(`Dinner meals: ${dinnerMealsResponse.data.length}`);
    
    // Test featured meals
    console.log('\nTesting GET /meals/featured');
    const featuredMealsResponse = await axios.get(`${API_URL}/meals/featured`);
    console.log(`Status: ${featuredMealsResponse.status}`);
    console.log(`Featured meals: ${featuredMealsResponse.data.length}`);
    
    // Test workout endpoints
    console.log('\nTesting GET /workouts (All workout categories)');
    const workoutsResponse = await axios.get(`${API_URL}/workouts`);
    console.log(`Status: ${workoutsResponse.status}`);
    console.log(`Workout categories available: ${Object.keys(workoutsResponse.data).length}`);
    
    console.log('\nAPI routes test completed successfully!\n');
  } catch (error) {
    console.error('Error testing routes:', error.response?.data || error.message);
  }
}

// Make sure the server is running before executing this script
console.log('Make sure the backend server is running on port 5007\n');
testRoutes(); 