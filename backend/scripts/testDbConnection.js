const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Function to test MongoDB connection
async function testConnection(uri, name) {
  console.log(`Testing connection to ${name}...`);
  console.log(`URI (sanitized): ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000
    });
    
    console.log(`✅ Successfully connected to ${name}`);
    console.log(`Connection details: ${conn.connection.host}`);
    
    // Test if we can write to the database
    const testCollectionName = 'connection_test';
    console.log(`Testing write access with collection: ${testCollectionName}`);
    
    const TestModel = mongoose.model(testCollectionName, new mongoose.Schema({
      testField: String,
      timestamp: { type: Date, default: Date.now }
    }));
    
    // Try to write a document
    const testDoc = new TestModel({ testField: 'test_connection_' + Date.now() });
    await testDoc.save();
    console.log('✅ Successfully wrote test document to database');
    
    // Try to read it back
    const foundDoc = await TestModel.findById(testDoc._id);
    console.log('✅ Successfully read test document from database');
    
    // Delete the test document
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('✅ Successfully deleted test document from database');
    
    return true;
  } catch (error) {
    console.error(`❌ Connection to ${name} failed:`, error.message);
    console.error('Full error:', error);
    return false;
  } finally {
    // Close the connection
    if (mongoose.connection.readyState) {
      await mongoose.connection.close();
      console.log(`Closed connection to ${name}`);
    }
  }
}

// Main function to test all connection strings
async function testAllConnections() {
  console.log('=== MongoDB Connection Test ===');
  
  // Test primary connection string
  if (process.env.MONGODB_URI) {
    const primaryResult = await testConnection(process.env.MONGODB_URI, 'Primary MongoDB');
    
    // If primary fails, test backup
    if (!primaryResult && process.env.MONGODB_URI_BACKUP) {
      console.log('\nTrying backup connection...');
      await testConnection(process.env.MONGODB_URI_BACKUP, 'Backup MongoDB');
    }
  } else {
    console.error('❌ No MongoDB URI found in environment variables');
  }
  
  // Exit process
  process.exit(0);
}

// Run the tests
testAllConnections().catch(err => {
  console.error('Unhandled error during connection tests:', err);
  process.exit(1);
}); 