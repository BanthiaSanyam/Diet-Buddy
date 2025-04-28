/**
 * Chatbot API Service
 * Handles communication with the chatbot API endpoints
 */

// API base URL - gets the base URL from the environment or defaults to localhost
const API_URL = import.meta.env.VITE_API_URL || 'https://dietbuddy-ilq5.onrender.com';

/**
 * Send a message to the chatbot and get a response
 * @param {string} message - The user's message to send to the chatbot
 * @returns {Promise} - Promise with the chatbot's response
 */
export const sendMessage = async (message) => {
  try {
    const response = await fetch(`${API_URL}/chatbot/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get response from chatbot');
    }

    return data;
  } catch (error) {
    console.error('Error in chatbot service:', error);
    throw error;
  }
}; 
