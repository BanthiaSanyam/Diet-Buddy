const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('MongoDB Connection Test');
console.log('======================');

// Check environment variables
console.log('Environment variables loaded:', process.env.MONGODB_URI ? 'Yes' : 'No');
console.log('MongoDB URI available:', process.env.MONGODB_URI ? 'Yes' : 'No');

// Test connection with error handling
async function testConnection() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    
    // Use this URI for testing
    const mongoURI = 'mongodb+srv://roy123:Sanyamkimumy@cluster0.jorkd6p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    console.log('Using MongoDB URI:', mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    
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
    console.log(`SUCCESS: MongoDB Atlas Connected: ${conn.connection.host}`);
    
    // Create a basic model
    const Test = mongoose.model('Test', new mongoose.Schema({ name: String, date: { type: Date, default: Date.now } }));
    
    // Write a test document
    const testDoc = new Test({ name: 'Connection Test' });
    await testDoc.save();
    console.log('Test document written successfully!');
    
    // Clean up test document
    await Test.deleteOne({ _id: testDoc._id });
    console.log('Test document deleted successfully!');
    
    await mongoose.connection.close();
    console.log('Connection closed successfully!');
    
    return true;
  } catch (error) {
    console.error('MongoDB Atlas connection error:', error.message);
    console.error('Check your MongoDB credentials and network connection');
    
    if (error.name === 'MongoTimeoutError' || error.name === 'MongoServerSelectionError') {
      console.log('\nTROUBLESHOOTING TIPS:');
      console.log('1. Check that your MongoDB Atlas username and password are correct');
      console.log('2. Ensure your IP is whitelisted in MongoDB Atlas (https://cloud.mongodb.com)');
      console.log('3. Check your internet connection');
      console.log('4. Confirm your database name is correct in the connection string');
    }
    
    return false;
  }
}

// Run the test
testConnection()
  .then(success => {
    if (success) {
      console.log('All tests passed!');
    } else {
      console.log('Test failed. Check errors above.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  }); 