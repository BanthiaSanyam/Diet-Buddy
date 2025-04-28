const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;
console.log('MongoDB URI:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials

// Connect to MongoDB
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // Timeout after 10s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  connectTimeoutMS: 30000 // Give up initial connection after 30s
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas successfully!');
  
  // Check database by creating a simple model and document
  const TestModel = mongoose.model('TestConnection', new mongoose.Schema({
    message: String,
    timestamp: { type: Date, default: Date.now }
  }));
  
  return TestModel.create({ message: 'Connection test successful!' })
    .then(doc => {
      console.log('✅ Successfully created test document:', doc);
      return TestModel.findByIdAndDelete(doc._id);
    })
    .then(() => {
      console.log('✅ Successfully cleaned up test document');
      return mongoose.connection.db.admin().listDatabases();
    })
    .then(result => {
      console.log('Available databases:');
      result.databases.forEach(db => {
        console.log(` - ${db.name}`);
      });
    });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
})
.finally(() => {
  console.log('Closing connection...');
  mongoose.connection.close();
}); 