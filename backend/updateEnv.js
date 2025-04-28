const fs = require('fs');
const path = require('path');

// Path to the .env file
const envPath = path.resolve(__dirname, '.env');

console.log('========================');
console.log('RAZORPAY API KEY CHECKER');
console.log('========================');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.error('\n❌ ERROR: .env file not found in the backend directory!');
  console.log('Please create a .env file with the following content:');
  console.log(`
PORT=5007
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NODE_ENV=development
`);
  process.exit(1);
}

// Read .env file
let envContent = fs.readFileSync(envPath, 'utf8');
console.log('\n✅ .env file found');

// Check for Razorpay variables
const razorpayKeyIdRegex = /RAZORPAY_KEY_ID\s*=\s*(.+)/;
const razorpayKeySecretRegex = /RAZORPAY_KEY_SECRET\s*=\s*(.+)/;

const keyIdMatch = envContent.match(razorpayKeyIdRegex);
const keySecretMatch = envContent.match(razorpayKeySecretRegex);

if (keyIdMatch && keySecretMatch) {
  console.log('\n✅ Razorpay API keys found in .env file:');
  console.log(`RAZORPAY_KEY_ID=${keyIdMatch[1].substring(0, 5)}...`);
  console.log(`RAZORPAY_KEY_SECRET=${keySecretMatch[1].substring(0, 5)}...`);
  
  // Validate that keys are not empty
  if (keyIdMatch[1].trim() === '' || keySecretMatch[1].trim() === '') {
    console.log('\n⚠️ WARNING: Razorpay keys are empty!');
  }
} else {
  console.log('\n⚠️ WARNING: Razorpay API keys not found or incorrectly formatted in .env file');
  
  // If keys are missing, add them
  if (!keyIdMatch) {
    envContent += '\nRAZORPAY_KEY_ID=rzp_test_YnzptP6DIDWFly';
  }
  
  if (!keySecretMatch) {
    envContent += '\nRAZORPAY_KEY_SECRET=ctnoLBxFSdWpbgi6uOn5FbMi';
  }
  
  // Write updated .env file
  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Added Razorpay API keys to .env file');
}

console.log('\n========================');
console.log('INSTRUCTIONS:');
console.log('1. Make sure your Razorpay API keys are correct');
console.log('2. If you changed the .env file, restart the server:');
console.log('   - npm run dev');
console.log('   - or: node server.js');
console.log('========================\n');

// Force reload of environment variables
require('dotenv').config({ path: envPath });
console.log('Checking environment variables after reload:');
console.log(`RAZORPAY_KEY_ID: ${process.env.RAZORPAY_KEY_ID ? 'Available' : 'Not available'}`);
console.log(`RAZORPAY_KEY_SECRET: ${process.env.RAZORPAY_KEY_SECRET ? 'Available' : 'Not available'}`);
console.log('========================\n'); 