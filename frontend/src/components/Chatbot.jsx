import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../services/chatbotService';
import {CoachAvatar} from '../pages/coachavatar';
/**
 * Chatbot component that provides an AI assistant interface
 * Allows users to ask fitness and nutrition related questions
 */
const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const endOfMessagesRef = useRef(null);

  // Scroll to the bottom of messages when new messages are added
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message to the chatbot
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Add user message to chat
    setMessages((prev) => [...prev, { text: userMessage, sender: 'user' }]);
    
    setIsLoading(true);
    
    try {
      // Send message to chatbot API
      const response = await sendMessage(userMessage);
      
      // Add chatbot response to chat
      setMessages((prev) => [...prev, { text: response.message, sender: 'bot' }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        { 
          text: 'Sorry, I encountered an error. Please try again later.', 
          sender: 'bot',
          error: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle chatbot visibility
  const toggleChatbot = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="fixed bottom-1 right-2 z-50 pd-0">
      {/* Chatbot Button */}
      <button 
        onClick={toggleChatbot}
       className="bg-transparent p-0 m-0 border-none outline-none hover:bg-transparent active:bg-transparent focus:bg-transparent"
    >
        <CoachAvatar/>
      </button>

      {/* Chatbot Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 md:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col"  style={{ bottom: '7rem' }}>
          {/* Chatbot Header */}
          <div className="bg-green-700 text-white p-4 flex justify-between items-center">
            <div className="flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" 
                />
              </svg>
              <h3 className="font-bold text-lg">FitGenie Assistant</h3>
            </div>
            <button onClick={toggleChatbot} className="text-white hover:text-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto max-h-96 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100 shadow-sm">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8 mx-auto mb-2 text-green-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
                    />
                  </svg>
                  <p className="text-gray-700">Ask me about fitness or nutrition. I'll answer in short bullet points.</p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 ${
                    msg.sender === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-gray-200 text-black shadow-sm'
                        : msg.error
                        ? 'bg-red-100 text-red-800 shadow-sm'
                        : 'bg-green-100 text-gray-800 shadow-sm'
                    } ${msg.sender === 'bot' ? 'whitespace-pre-line' : ''}`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="text-left mb-3">
                <div className="inline-block p-3 rounded-lg bg-green-50 text-gray-800 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-600 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-green-600 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-green-600 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 text-black"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-green-700 hover:bg-green-800 text-white rounded-r-lg px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              disabled={isLoading || !input.trim()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 