import React, { useState, useRef, useEffect } from 'react';

// Simple chat service using Gemini API
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

async function sendChatMessage(message, conversationHistory = []) {
  const systemPrompt = `You are CollegelyBot, a friendly and knowledgeable college advisor chatbot for Collegely. Your role is to help students with all aspects of college planning and preparation.

You can help with:
- College selection and recommendations
- Admission requirements and strategies  
- Financial aid and scholarship guidance
- Major and career exploration
- Application timeline and deadlines
- Essay writing tips
- Interview preparation
- Campus life questions
- Academic planning
- Study abroad opportunities

Guidelines:
- Be encouraging, supportive, and positive
- Provide specific, actionable advice
- Ask follow-up questions to better understand student needs
- Keep responses concise but helpful (2-4 sentences typically)
- If you don't know something, be honest and suggest resources
- Always maintain a friendly, approachable tone
- Use the student's name if they provide it

Current conversation context: ${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Student message: ${message}

Respond as CollegelyBot:`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: systemPrompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return "I'm having trouble connecting right now. Please try again in a moment!";
  }
}

export default function CollegeChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: "Hi! I'm Collegely AI, your personal college advisor! 🎓 I'm here to help with college planning, applications, scholarships, and more. What can I help you with today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get conversation history for context
      const conversationHistory = messages.slice(-10); // Last 10 messages for context
      const botResponse = await sendChatMessage(inputMessage, conversationHistory);
      
      const botMessage = {
        role: 'bot',
        content: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'bot',
        content: "Sorry, I encountered an error. Please try again!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "How do I choose the right college?",
    "What are good safety schools?",
    "How can I improve my application?",
    "Tell me about financial aid.",
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <>
{/* Chat Toggle Button */}
<div className="chatbot-toggle">
  <button
    onClick={() => setIsOpen(!isOpen)}
    className="chatbot-toggle-btn"
    aria-label="Open college advisor chat"
  >
    {isOpen ? (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ) : (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )}
  </button>
  {/* Tooltip removed */}
</div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="flex items-center">
              <div className="chatbot-avatar">🎓</div>
              <div>
                <h3 className="chatbot-title">Collegely AI</h3>
                <p className="chatbot-subtitle">Your College Advisor</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="chatbot-close"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chatbot-message ${message.role === 'user' ? 'user' : 'bot'}`}
              >
                {message.role === 'bot' && (
                  <div className="chatbot-message-avatar">🎓</div>
                )}
                <div className="chatbot-message-content">
                  <p>{message.content}</p>
                  <span className="chatbot-message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="chatbot-message bot">
                <div className="chatbot-message-avatar">🎓</div>
                <div className="chatbot-message-content">
                  <div className="chatbot-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="chatbot-quick-questions">
              <p className="text-sm text-gray-400 mb-2">Quick Questions:</p>
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="chatbot-quick-btn"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSendMessage} className="chatbot-input-form">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me about applications, scholarships..."
              className="chatbot-input"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="chatbot-send-btn"
              aria-label="Send message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>

          {/* Close Button */}
          <div className="chatbot-close-container">
            <button
              onClick={() => setIsOpen(false)}
              className="chatbot-close-btn"
              aria-label="Close chatbot"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close Chat
            </button>
          </div>
        </div>
      )}
    </>
  );
}