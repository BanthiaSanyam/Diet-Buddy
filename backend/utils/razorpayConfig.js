const Razorpay = require('razorpay');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Try to load environment variables from .env file
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env file found in backend directory, using existing environment variables');
}

// Get Razorpay credentials from environment
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

// Check if credentials are available
const hasValidCredentials = keyId && keySecret && keyId.trim() !== '' && keySecret.trim() !== '';

// Log status (not credentials themselves)
if (hasValidCredentials) {
  console.log(`Razorpay config initialized with key: ${keyId.substring(0, 10)}...`);
} else {
  console.warn('Razorpay credentials missing or invalid. Payment functionality will be limited.');
  console.warn('Using fallback test credentials. Real payments will not work.');
}

// Initialize Razorpay instance
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: hasValidCredentials ? keyId : 'rzp_test_placeholder',
    key_secret: hasValidCredentials ? keySecret : 'placeholder_secret'
  });
  
  // Test if we can connect to Razorpay
  if (hasValidCredentials) {
    console.log('Testing Razorpay API connection...');
    // We'll do a simple ping to see if our credentials work
    razorpay.payments.all({
      count: 1
    }).then(() => {
      console.log('✅ Razorpay API connection successful');
    }).catch(err => {
      console.error('❌ Razorpay API connection failed:', err.message || err);
      // If we get an authentication error, mark credentials as invalid
      if (err.message && err.message.includes('authentication')) {
        console.warn('⚠️ Razorpay credentials appear to be invalid');
        module.exports.hasValidCredentials = false;
      }
    });
  }
} catch (error) {
  console.error('Error initializing Razorpay:', error.message);
  // Fallback to a dummy instance
  razorpay = {
    orders: {
      create: () => Promise.reject(new Error('Razorpay not properly initialized'))
    },
    payments: {
      all: () => Promise.reject(new Error('Razorpay not properly initialized'))
    }
  };
}

// Verify connection to Razorpay API
const verifyConnection = async () => {
  if (!hasValidCredentials) {
    return {
      connected: false,
      message: 'No valid credentials configured'
    };
  }
  
  try {
    // Try to make a simple API call
    const result = await razorpay.payments.all({ count: 1 });
    return {
      connected: true,
      message: 'Successfully connected to Razorpay API'
    };
  } catch (error) {
    return {
      connected: false,
      message: `Failed to connect to Razorpay API: ${error.message}`,
      error: error.message
    };
  }
};

module.exports = {
  razorpay,
  keyId: hasValidCredentials ? keyId : 'rzp_test_placeholder',
  keySecret: hasValidCredentials ? keySecret : 'placeholder_secret',
  hasValidCredentials,
  verifyConnection
}; 