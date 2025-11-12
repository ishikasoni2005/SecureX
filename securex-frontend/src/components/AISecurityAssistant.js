import React, { useState, useRef, useEffect } from 'react';

function AISecurityAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your SecureX AI Assistant. I can help you analyze security threats, generate reports, and provide security recommendations. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('threat') || lowerMessage.includes('attack')) {
      return {
        id: Date.now() + 1,
        type: 'ai',
        content: `I've analyzed recent threat patterns. There have been ${Math.floor(Math.random() * 15) + 5} similar attacks in the last 24 hours. I recommend reviewing your firewall rules and running a deep security scan.`,
        timestamp: new Date(),
        actions: [
          { label: 'Run Security Scan', action: 'scan' },
          { label: 'View Threat Details', action: 'threats' }
        ]
      };
    } else if (lowerMessage.includes('report') || lowerMessage.includes('analytics')) {
      return {
        id: Date.now() + 1,
        type: 'ai',
        content: 'I can help you generate comprehensive security reports. Would you like a daily summary, weekly analytics, or a specific threat analysis report?',
        timestamp: new Date(),
        actions: [
          { label: 'Daily Report', action: 'daily_report' },
          { label: 'Weekly Analytics', action: 'weekly_analytics' },
          { label: 'Threat Analysis', action: 'threat_report' }
        ]
      };
    } else if (lowerMessage.includes('performance') || lowerMessage.includes('slow')) {
      return {
        id: Date.now() + 1,
        type: 'ai',
        content: 'System performance is currently at 92% efficiency. I detect some optimization opportunities in your security rule processing. Would you like me to suggest improvements?',
        timestamp: new Date(),
        actions: [
          { label: 'Optimize Rules', action: 'optimize' },
          { label: 'Performance Report', action: 'performance' }
        ]
      };
    } else {
      return {
        id: Date.now() + 1,
        type: 'ai',
        content: 'I understand you\'re asking about security matters. As your AI security assistant, I can help with threat analysis, security recommendations, report generation, and system optimization. Could you please be more specific about what you need help with?',
        timestamp: new Date(),
        actions: [
          { label: 'Threat Analysis', action: 'threats' },
          { label: 'Security Scan', action: 'scan' },
          { label: 'Generate Report', action: 'report' }
        ]
      };
    }
  };

  const handleAction = (action) => {
    // Handle AI assistant actions
    console.log('AI Action:', action);
    // In a real app, this would trigger specific functionality
  };

  const quickQuestions = [
    'Analyze recent threats',
    'Generate security report',
    'System performance check',
    'Security recommendations'
  ];

  return (
    <>
      <button 
        className="ai-assistant-btn"
        onClick={() => setIsOpen(true)}
      >
        <span className="ai-icon">🤖</span>
        AI Assistant
      </button>

      {isOpen && (
        <div className="ai-assistant-modal">
          <div className="ai-assistant-header">
            <div className="ai-title">
              <span className="ai-icon">🤖</span>
              <h3>SecureX AI Assistant</h3>
            </div>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="chat-container">
            <div className="messages-container">
              {messages.map(message => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-avatar">
                    {message.type === 'ai' ? '🤖' : '👤'}
                  </div>
                  <div className="message-content">
                    <div className="message-text">{message.content}</div>
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                    {message.actions && (
                      <div className="message-actions">
                        {message.actions.map((action, index) => (
                          <button
                            key={index}
                            className="action-btn"
                            onClick={() => handleAction(action.action)}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="message ai typing">
                  <div className="message-avatar">🤖</div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="quick-questions">
              <h4>Quick Questions</h4>
              <div className="questions-grid">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="question-chip"
                    onClick={() => setInputMessage(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-container">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about security threats, reports, or recommendations..."
                className="message-input"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="send-btn"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AISecurityAssistant;