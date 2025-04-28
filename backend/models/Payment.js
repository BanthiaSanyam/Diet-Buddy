const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String,
    required: false // Will be filled after payment completion
  },
  razorpaySignature: {
    type: String,
    required: false // Will be filled after payment verification
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  },
  planType: {
    type: String,
    enum: ['monthly', 'premium'],
    required: true
  },
  status: {
    type: String,
    enum: ['created', 'attempted', 'failed', 'successful'],
    default: 'created'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  verificationDate: {
    type: Date
  },
  membershipExpiryDate: {
    type: Date
  },
  transactionDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  errorDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  webhookResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
});

// Index for efficiently finding payments by user
paymentSchema.index({ user: 1 });

// Index for efficiently finding payments by Razorpay order ID
paymentSchema.index({ razorpayOrderId: 1 });

// Index for efficiently finding payments by status
paymentSchema.index({ status: 1 });

// Index for efficiently finding recent payments
paymentSchema.index({ paymentDate: -1 });

module.exports = mongoose.model('Payment', paymentSchema); 