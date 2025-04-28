const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @desc    Send a message to the Gemini AI chatbot
 * @route   POST /api/chatbot/message
 * @access  Private
 */
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'No message provided' 
      });
    }

    // Initialize the model - using gemini-1.5-pro
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // Create a chat session with specific configuration for brief outputs
    const chat = model.startChat({
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 800,
        topP: 0.8,
      },
    });

    // Format prompt to force bullet points and concise answers
    const prompt = `You are FitGenie, a fitness assistant for Diet Buddy app. 
    
RULES (follow strictly):
- Answer ONLY in bullet points (use • symbol)
- Keep each bullet point under 10 words
- Use max 5 bullet points total
- No introductions or conclusions
- Be direct and specific
- Focus on practical, actionable advice
- Address the user's question directly

User question: ${message}`;

    // Send message to Gemini
    const result = await chat.sendMessage(prompt);
    const responseText = result.response.text();

    res.status(200).json({
      success: true,
      message: responseText
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing your request',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  }
};

module.exports = {
  sendMessage
}; 