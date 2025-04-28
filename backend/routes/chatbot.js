const express = require('express');
const router = express.Router();
const { sendMessage } = require('../controllers/chatbotController');

// @route   POST /api/chatbot/message
// @desc    Send a message to the Gemini AI chatbot
// @access  Public
router.post('/message', sendMessage);

module.exports = router; 