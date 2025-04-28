const express = require('express');
const crypto = require('crypto');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Payment = require('../models/Payment');
const logger = require('../utils/logger');
const razorpayConfig = require('../utils/razorpayConfig');

const router = express.Router();

// Get Razorpay instance and credentials from config
const { razorpay, keyId, keySecret, hasValidCredentials } = razorpayConfig;

// Log initialization status
console.log(`Payment routes initialized with Razorpay. Valid credentials: ${hasValidCredentials ? 'YES' : 'NO'}`);

// Add Razorpay key to response
router.get('/get-key', authMiddleware, async (req, res) => {
  try {
    // Make sure we always provide a valid response
    res.json({
      keyId: keyId || '',
      configured: hasValidCredentials,
      message: hasValidCredentials 
        ? 'Using configured Razorpay credentials' 
        : 'Using fallback credentials (test mode only)'
    });
  } catch (error) {
    console.error('Error in get-key route:', error);
    // Even on error, return a valid JSON response
    res.status(500).json({
      keyId: '',
      configured: false,
      error: 'Failed to retrieve Razorpay key',
      message: 'Payment system configuration error'
    });
  }
});

// Create order for membership payment
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    // Find user by userId from token
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }
    
    // Verify Razorpay credentials are available
    if (!hasValidCredentials) {
      console.error('Razorpay credentials missing or invalid in environment');
      
      // Log the error
      await logger.logError({
        error: new Error('Razorpay credentials missing or invalid'),
        user: user._id,
        context: { action: 'create_order' },
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      // Only in development mode, automatically fall back to dummy order
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: creating dummy order due to missing credentials');
        return createDummyOrder(user, 99900, 'premium', res);
      }
      
      return res.status(500).json({ 
        message: 'Payment gateway not properly configured',
        error: 'RAZORPAY_CONFIG_MISSING'
      });
    }
    
    const options = {
      amount: 99900, // amount in smallest currency unit (99900 paise = ₹999)
      currency: 'INR',
      receipt: `order_${user._id}_${Date.now()}`,
      payment_capture: 1
    };

    try {
      console.log('Attempting to create Razorpay order with options:', JSON.stringify(options, null, 2));
      
      // Create order in Razorpay
      const order = await razorpay.orders.create(options);
      console.log('Order created successfully:', order.id);
      
      // Create payment record in our database
      const payment = new Payment({
        user: user._id,
        razorpayOrderId: order.id,
        amount: order.amount,
        currency: order.currency,
        planType: 'premium',
        status: 'created',
        paymentDate: new Date(),
        transactionDetails: order
      });
      await payment.save();
      
      // Log payment creation
      await logger.logActivity({
        action: 'payment',
        user: user._id,
        details: {
          event: 'order_created',
          orderId: order.id,
          amount: order.amount / 100, // Convert to rupees for readability
          planType: 'premium'
        },
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      return res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: keyId
      });
    } catch (razorpayError) {
      console.error('Razorpay API error details:', razorpayError);
      
      // Log payment error
      await logger.logError({
        error: razorpayError,
        user: user._id,
        context: {
          action: 'create_order',
          amount: options.amount / 100, // Convert to rupees for readability
          planType: 'premium'
        },
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      // Check if we should use a dummy order in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: creating dummy order due to Razorpay API error');
        return createDummyOrder(user, options.amount, 'premium', res);
      } else {
        // In production, return a proper error to the client
        return res.status(500).json({ 
          message: 'Unable to create payment order',
          error: razorpayError.message || 'Razorpay API error'
        });
      }
    }
  } catch (error) {
    console.error('Order creation system error:', error);
    
    // Log system error
    await logger.logError({
      error,
      user: req.user?.userId,
      context: { action: 'create_order' },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    return res.status(500).json({ 
      message: 'Unable to process payment request',
      error: error.message 
    });
  }
});

// Helper function to create dummy orders (for development mode only)
async function createDummyOrder(user, amount, planType, res) {
  try {
    const dummyOrderId = `dummy_order_${Date.now()}`;
    
    // Create payment record with error details
    const payment = new Payment({
      user: user._id,
      razorpayOrderId: dummyOrderId,
      amount: amount,
      currency: 'INR',
      planType: planType,
      status: 'created',
      paymentDate: new Date(),
      errorDetails: {
        message: 'Using dummy order due to Razorpay configuration issues',
        isDummyOrder: true
      }
    });
    await payment.save();
    
    console.log(`Created dummy order ${dummyOrderId} for user ${user._id}`);
    
    return res.json({
      orderId: dummyOrderId,
      amount: amount,
      currency: 'INR',
      keyId: keyId || 'rzp_test_dummy_id',
      isDummyOrder: true
    });
  } catch (error) {
    console.error('Error creating dummy order:', error);
    return res.status(500).json({
      message: 'Failed to create even a dummy order',
      error: error.message
    });
  }
}

// Verify payment signature
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    // Find user by userId from token
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      isDummyOrder
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || (!isDummyOrder && (!razorpay_payment_id || !razorpay_signature))) {
      return res.status(400).json({ 
        message: 'Invalid payment data',
        status: 'failed',
        error: 'MISSING_PAYMENT_DATA'
      });
    }

    // Find the payment record
    let payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    
    if (!payment) {
      console.log(`Payment record not found for order: ${razorpay_order_id}`);
      // Create a new payment record if not found (might happen in dev or if DB resets)
      payment = new Payment({
        user: user._id,
        razorpayOrderId: razorpay_order_id,
        amount: 99900, // Default for premium plan
        currency: 'INR',
        planType: 'premium',
        status: 'attempted',
        paymentDate: new Date()
      });
    } else {
      console.log(`Found payment record for order: ${razorpay_order_id}, status: ${payment.status}`);
      // Update payment status to attempted
      payment.status = 'attempted';
      payment.razorpayPaymentId = razorpay_payment_id;
    }
    
    // For dummy orders in development, skip verification
    if (isDummyOrder) {
      console.log('Processing dummy payment verification');
      
      // Update payment record
      payment.status = 'successful';
      payment.razorpayPaymentId = razorpay_payment_id || `dummy_payment_${Date.now()}`;
      payment.razorpaySignature = razorpay_signature || 'dummy_signature';
      payment.verificationDate = new Date();
      
      // Calculate expiry date (1 year from now)
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      payment.membershipExpiryDate = expiryDate;
      
      await payment.save();
      
      // Update user membership status
      user.isMember = true;
      user.membershipType = 'premium';
      user.membershipExpiry = expiryDate;
      await user.save();
      
      // Log successful payment
      await logger.logActivity({
        action: 'payment',
        user: user._id,
        details: {
          event: 'payment_successful',
          orderId: razorpay_order_id,
          paymentId: payment.razorpayPaymentId,
          amount: payment.amount / 100, // Convert to rupees for readability
          planType: 'premium',
          membershipExpiry: expiryDate,
          isDummyOrder: true
        },
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      return res.json({
        message: 'Development payment processed successfully',
        status: 'success',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isMember: user.isMember,
          membershipType: user.membershipType,
          membershipExpiry: user.membershipExpiry
        }
      });
    }

    // Normal verification process for real payments
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', keySecret)
      .update(sign)
      .digest('hex');

    console.log(`Verifying payment: Order ${razorpay_order_id}, Payment ${razorpay_payment_id}`);
    console.log(`Signature provided: ${razorpay_signature.substring(0, 10)}...`);
    console.log(`Signature expected: ${expectedSign.substring(0, 10)}...`);

    if (razorpay_signature === expectedSign) {
      console.log('Payment signature verified successfully');
      
      // Update payment record
      payment.status = 'successful';
      payment.razorpaySignature = razorpay_signature;
      payment.verificationDate = new Date();
      
      // Calculate expiry date (1 year from now)
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      payment.membershipExpiryDate = expiryDate;
      
      await payment.save();
      
      // Update user membership status
      user.isMember = true;
      user.membershipType = 'premium';
      user.membershipExpiry = expiryDate;
      await user.save();
      
      // Log successful payment
      await logger.logActivity({
        action: 'payment',
        user: user._id,
        details: {
          event: 'payment_successful',
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          amount: payment.amount / 100, // Convert to rupees for readability
          planType: 'premium',
          membershipExpiry: expiryDate
        },
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      res.json({
        message: 'Payment verified successfully',
        status: 'success',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isMember: user.isMember,
          membershipType: user.membershipType,
          membershipExpiry: user.membershipExpiry
        }
      });
    } else {
      console.log('Payment signature verification failed');
      
      // Update payment record with failed status
      payment.status = 'failed';
      payment.errorDetails = {
        message: 'Invalid signature',
        providedSignature: razorpay_signature.substring(0, 10) + '...',
        expectedSignatureStart: expectedSign.substring(0, 10) + '...'
      };
      await payment.save();
      
      // Log failed payment
      await logger.logActivity({
        action: 'payment',
        user: user._id,
        details: {
          event: 'payment_failed',
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          reason: 'Invalid signature'
        },
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      res.status(400).json({ 
        message: 'Invalid payment signature', 
        status: 'failed', 
        error: 'SIGNATURE_VERIFICATION_FAILED' 
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    
    // Log system error
    await logger.logError({
      error,
      user: req.user?.userId,
      context: { 
        action: 'verify_payment',
        orderId: req.body?.razorpay_order_id,
        paymentId: req.body?.razorpay_payment_id
      },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    res.status(500).json({ 
      message: 'Payment verification failed',
      status: 'failed',
      error: error.message 
    });
  }
});

// Development test mode for upgrading users
router.post('/test-upgrade', authMiddleware, async (req, res) => {
  try {
    // If not in development mode, don't allow test upgrades
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ 
        message: 'Test upgrades are only available in development mode',
        success: false
      });
    }
    
    // Find user by userId from token
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found', success: false });
    }
    
    // Get plan type from request body (defaults to premium if not specified)
    const planType = req.body.planType || 'premium';
    
    // Calculate expiry date based on plan type
    const expiryDate = new Date();
    if (planType === 'premium') {
      // Premium (yearly) - add one year
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else if (planType === 'monthly') {
      // Monthly - add one month
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
      return res.status(400).json({ 
        message: 'Invalid plan type. Must be "premium" or "monthly"',
        success: false
      });
    }
    
    // Set the amount based on plan type
    const amount = planType === 'premium' ? 99900 : 9900;
    
    // Create dummy payment record
    const payment = new Payment({
      user: user._id,
      razorpayOrderId: `test_order_${Date.now()}`,
      razorpayPaymentId: `test_payment_${Date.now()}`,
      amount,
      currency: 'INR',
      planType,
      status: 'successful',
      paymentDate: new Date(),
      verificationDate: new Date(),
      membershipExpiryDate: expiryDate,
      transactionDetails: {
        isDummyTransaction: true,
        testMode: true,
        createdBy: 'test-upgrade-endpoint'
      }
    });
    
    await payment.save();
    
    // Update user membership status
    user.isMember = true;
    user.membershipType = planType;
    user.membershipExpiry = expiryDate;
    await user.save();
    
    // Log activity
    await logger.logActivity({
      action: 'payment',
      user: user._id,
      details: {
        event: 'test_upgrade',
        planType,
        amount: amount / 100,
        expiryDate,
        testMode: true
      },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    res.json({
      success: true,
      message: `Successfully upgraded to ${planType === 'premium' ? 'yearly' : 'monthly'} premium (TEST MODE)`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isMember: true,
        membershipType: planType,
        membershipExpiry: expiryDate
      },
      payment: {
        id: payment._id,
        orderId: payment.razorpayOrderId,
        paymentId: payment.razorpayPaymentId,
        amount: payment.amount,
        status: payment.status,
        testMode: true
      },
      expiryDate
    });
  } catch (error) {
    console.error('Test upgrade error:', error);
    
    // Log error
    await logger.logError({
      error,
      user: req.user?.userId,
      context: { action: 'test_upgrade' },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    res.status(500).json({ 
      message: 'Error processing test upgrade', 
      error: error.message,
      success: false
    });
  }
});

// Create order for monthly membership payment
router.post('/create-monthly-order', authMiddleware, async (req, res) => {
  try {
    // Find user by userId from token
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const options = {
      amount: 9900, // amount in smallest currency unit (9900 paise = ₹99)
      currency: 'INR',
      receipt: `monthly_order_${user._id}_${Date.now()}`,
      payment_capture: 1
    };

    try {
      // Create order in Razorpay
      const order = await razorpay.orders.create(options);
      
      // Create payment record in our database
      const payment = new Payment({
        user: user._id,
        razorpayOrderId: order.id,
        amount: order.amount,
        currency: order.currency,
        planType: 'monthly',
        status: 'created',
        paymentDate: new Date(),
        transactionDetails: order
      });
      await payment.save();
      
      // Log payment creation
      await logger.logActivity({
        action: 'payment',
        user: user._id,
        details: {
          event: 'order_created',
          orderId: order.id,
          amount: order.amount / 100, // Convert to rupees for readability
          planType: 'monthly'
        },
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: keyId || 'rzp_test_dummy_id',
        planType: 'monthly'
      });
    } catch (razorpayError) {
      console.log('Razorpay API error:', razorpayError.message);
      
      // Log payment error
      await logger.logError({
        error: razorpayError,
        user: user._id,
        context: {
          action: 'create_monthly_order',
          amount: options.amount / 100, // Convert to rupees for readability
          planType: 'monthly'
        },
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      // If Razorpay API fails, provide a dummy order ID for development
      const dummyOrderId = `dummy_monthly_order_${Date.now()}`;
      
      // Create payment record with error details
      const payment = new Payment({
        user: user._id,
        razorpayOrderId: dummyOrderId,
        amount: options.amount,
        currency: options.currency,
        planType: 'monthly',
        status: 'created',
        paymentDate: new Date(),
        errorDetails: {
          message: razorpayError.message,
          isDummyOrder: true
        }
      });
      await payment.save();
      
      res.json({
        orderId: dummyOrderId,
        amount: options.amount,
        currency: options.currency,
        keyId: keyId || 'rzp_test_dummy_id',
        isDummyOrder: true,
        planType: 'monthly'
      });
    }
  } catch (error) {
    // Log system error
    await logger.logError({
      error,
      user: req.user?.userId,
      context: { action: 'create_monthly_order' },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    res.status(500).json({ message: error.message });
  }
});

// Verify monthly payment signature
router.post('/verify-monthly', authMiddleware, async (req, res) => {
  try {
    // Find user by userId from token
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      isDummyOrder
    } = req.body;

    // Find the payment record
    let payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    
    if (!payment) {
      // Create a new payment record if not found (might happen in dev or if DB resets)
      payment = new Payment({
        user: user._id,
        razorpayOrderId: razorpay_order_id,
        amount: 9900, // Default for monthly plan
        currency: 'INR',
        planType: 'monthly',
        status: 'attempted',
        paymentDate: new Date()
      });
    } else {
      // Update payment status to attempted
      payment.status = 'attempted';
      payment.razorpayPaymentId = razorpay_payment_id;
    }

    // For dummy orders in development, skip verification
    if (isDummyOrder) {
      console.log('Processing dummy monthly payment verification');
      
      // Update payment record
      payment.status = 'successful';
      payment.razorpayPaymentId = razorpay_payment_id || `dummy_payment_${Date.now()}`;
      payment.razorpaySignature = razorpay_signature || 'dummy_signature';
      payment.verificationDate = new Date();
      
      // Calculate expiry date (1 month from now)
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      payment.membershipExpiryDate = expiryDate;
      
      await payment.save();
      
      // Update user membership status
      user.isMember = true;
      user.membershipType = 'monthly';
      user.membershipExpiry = expiryDate;
      await user.save();
      
      // Log successful payment
      await logger.logActivity({
        action: 'payment',
        user: user._id,
        details: {
          event: 'payment_successful',
          orderId: razorpay_order_id,
          paymentId: payment.razorpayPaymentId,
          amount: payment.amount / 100, // Convert to rupees for readability
          planType: 'monthly',
          membershipExpiry: expiryDate,
          isDummyOrder: true
        },
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      return res.json({
        message: 'Development payment processed successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isMember: user.isMember,
          membershipType: user.membershipType,
          membershipExpiry: user.membershipExpiry
        }
      });
    }

    // Normal verification process for real payments
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', keySecret || 'dummy_secret')
      .update(sign)
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Update payment record
      payment.status = 'successful';
      payment.razorpaySignature = razorpay_signature;
      payment.verificationDate = new Date();
      
      // Calculate expiry date (1 month from now)
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      payment.membershipExpiryDate = expiryDate;
      
      await payment.save();
      
      // Update user membership status
      user.isMember = true;
      user.membershipType = 'monthly';
      user.membershipExpiry = expiryDate;
      await user.save();
      
      // Log successful payment
      await logger.logActivity({
        action: 'payment',
        user: user._id,
        details: {
          event: 'payment_successful',
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          amount: payment.amount / 100, // Convert to rupees for readability
          planType: 'monthly',
          membershipExpiry: expiryDate
        },
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      res.json({
        message: 'Payment verified successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isMember: user.isMember,
          membershipType: user.membershipType,
          membershipExpiry: user.membershipExpiry
        }
      });
    } else {
      // Update payment record with failed status
      payment.status = 'failed';
      payment.errorDetails = {
        message: 'Invalid signature',
        providedSignature: razorpay_signature,
        expectedSignature: expectedSign
      };
      await payment.save();
      
      // Log failed payment
      await logger.logActivity({
        action: 'payment',
        user: user._id,
        details: {
          event: 'payment_failed',
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          reason: 'Invalid signature'
        },
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      res.status(400).json({ message: 'Invalid signature', status: 'failed' });
    }
  } catch (error) {
    // Log system error
    await logger.logError({
      error,
      user: req.user?.userId,
      context: { 
        action: 'verify_monthly_payment',
        orderId: req.body?.razorpay_order_id,
        paymentId: req.body?.razorpay_payment_id
      },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    res.status(500).json({ message: error.message, status: 'failed' });
  }
});

// Get payment history for a user
router.get('/history', authMiddleware, async (req, res) => {
  try {
    // Find user by userId from token
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get all payments for this user, sorted by date (newest first)
    const payments = await Payment.find({ user: user._id })
      .sort({ paymentDate: -1 })
      .limit(10); // Limit to last 10 payments
    
    res.json({
      success: true,
      payments: payments.map(payment => ({
        id: payment._id,
        razorpayOrderId: payment.razorpayOrderId,
        razorpayPaymentId: payment.razorpayPaymentId,
        amount: payment.amount,
        currency: payment.currency,
        planType: payment.planType,
        status: payment.status,
        paymentDate: payment.paymentDate,
        verificationDate: payment.verificationDate,
        membershipExpiryDate: payment.membershipExpiryDate
      }))
    });
  } catch (error) {
    console.error('Payment history error:', error);
    
    // Log system error
    await logger.logError({
      error,
      user: req.user?.userId,
      context: { action: 'get_payment_history' },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    res.status(500).json({ 
      message: 'Error retrieving payment history', 
      error: error.message 
    });
  }
});

// Get subscription status
router.get('/subscription-status', authMiddleware, async (req, res) => {
  try {
    // Find user by userId from token
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If user is not a member, return basic status
    if (!user.isMember) {
      return res.json({
        status: 'free',
        plan: 'basic',
        membershipExpiry: null
      });
    }
    
    // Calculate subscription period metrics
    let startDate = null;
    let totalDays = 0;
    let daysRemaining = 0;
    let percentComplete = 0;
    
    // Find the most recent successful payment
    const latestPayment = await Payment.findOne({
      user: user._id,
      status: 'successful'
    }).sort({ paymentDate: -1 });
    
    if (latestPayment && user.membershipExpiry) {
      startDate = latestPayment.paymentDate;
      const endDate = new Date(user.membershipExpiry);
      const currentDate = new Date();
      
      // Total subscription length in days
      totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      // Days remaining in subscription
      daysRemaining = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));
      daysRemaining = Math.max(0, daysRemaining); // Ensure non-negative
      
      // Percentage of subscription that's complete
      percentComplete = Math.round(((totalDays - daysRemaining) / totalDays) * 100);
      percentComplete = Math.min(100, Math.max(0, percentComplete)); // Ensure between 0-100
    }
    
    // Determine status
    let status = 'active';
    
    if (user.membershipExpiry) {
      const expiryDate = new Date(user.membershipExpiry);
      const currentDate = new Date();
      
      if (expiryDate < currentDate) {
        status = 'expired';
      } else if (daysRemaining < 7) {
        status = 'expiring soon';
      }
    }
    
    res.json({
      status,
      plan: user.membershipType,
      membershipExpiry: user.membershipExpiry,
      daysRemaining,
      totalDays,
      percentComplete,
      paymentId: latestPayment?.razorpayPaymentId,
      paymentDate: latestPayment?.paymentDate
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    
    // Log system error
    await logger.logError({
      error,
      user: req.user?.userId,
      context: { action: 'get_subscription_status' },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    res.status(500).json({ 
      message: 'Error retrieving subscription status', 
      error: error.message 
    });
  }
});

// Add route to check Razorpay connection status
router.get('/check-connection', authMiddleware, async (req, res) => {
  try {
    // Check if the user is an admin
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get connection status
    const connectionStatus = await razorpayConfig.verifyConnection();
    
    // Return different responses for development vs production
    if (process.env.NODE_ENV === 'development') {
      // In development, provide detailed information
      res.json({
        configured: hasValidCredentials,
        connection: connectionStatus,
        environment: process.env.NODE_ENV,
        testModeAvailable: true,
        keyId: keyId ? keyId.substring(0, 8) + '...' : 'Not configured',
        message: connectionStatus.connected 
          ? 'Razorpay properly configured and connected' 
          : 'Razorpay not properly configured. Test mode is available in development.'
      });
    } else {
      // In production, provide limited information for security
      res.json({
        status: connectionStatus.connected ? 'ready' : 'unavailable',
        configured: hasValidCredentials,
        testModeAvailable: false,
        message: connectionStatus.connected 
          ? 'Payment system is ready' 
          : 'Payment system is temporarily unavailable.'
      });
    }
  } catch (error) {
    console.error('Error checking Razorpay connection:', error);
    
    // Log error
    await logger.logError({
      error,
      user: req.user?.userId,
      context: { action: 'check_razorpay_connection' },
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    res.status(500).json({ 
      message: 'Error checking payment system status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router; 