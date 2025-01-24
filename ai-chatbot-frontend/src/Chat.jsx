import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000');

const MESSAGE_TYPES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
  ERROR: 'error'
};

const EVENT_TYPES = {
  RESPONSE: 'ai-response',
  REALTIME: 'realtime',
  APPOINTMENT: 'appointment',
  ERROR: 'error'
};

function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionInfo, setSessionInfo] = useState({ hasEmail: false, messageCount: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on(EVENT_TYPES.RESPONSE, (data) => {
      const { message, sessionInfo } = data;
      setSessionInfo(prevInfo => ({
        ...prevInfo,
        ...sessionInfo
      }));
      setMessages(prev => [...prev, { 
        type: MESSAGE_TYPES.ASSISTANT, 
        content: message, // Message comes with tags already removed
        isVerified: sessionInfo?.hasEmail,
        tags: sessionInfo?.tags || []
      }]);
    });

    socket.on(EVENT_TYPES.REALTIME, ({ message, link, sessionInfo }) => {
      setSessionInfo(sessionInfo);
      setMessages(prev => [...prev, 
        { 
          type: MESSAGE_TYPES.SYSTEM, 
          content: message,
          isVerified: sessionInfo.hasEmail,
          tags: sessionInfo?.tags || []
        },
        { 
          type: MESSAGE_TYPES.SYSTEM, 
          content: `Realtime chat: ${link}`,
          isVerified: sessionInfo.hasEmail,
          tags: sessionInfo?.tags || []
        }
      ]);
    });

    socket.on(EVENT_TYPES.APPOINTMENT, ({ message, link, sessionInfo }) => {
      setSessionInfo(sessionInfo);
      setMessages(prev => [...prev, 
        { 
          type: MESSAGE_TYPES.SYSTEM, 
          content: message,
          isVerified: sessionInfo.hasEmail,
          tags: sessionInfo?.tags || []
        },
        { 
          type: MESSAGE_TYPES.SYSTEM, 
          content: `Appointment: ${link}`,
          isVerified: sessionInfo.hasEmail,
          tags: sessionInfo?.tags || []
        }
      ]);
    });

    socket.on(EVENT_TYPES.ERROR, (error) => {
      setMessages(prev => [...prev, { 
        type: MESSAGE_TYPES.ERROR, 
        content: error 
      }]);
    });

    return () => {
      socket.off('connect');
      socket.off(EVENT_TYPES.RESPONSE);
      socket.off(EVENT_TYPES.REALTIME);
      socket.off(EVENT_TYPES.APPOINTMENT);
      socket.off(EVENT_TYPES.ERROR);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      socket.emit('message', inputMessage);
      setMessages(prev => [...prev, { 
        type: MESSAGE_TYPES.USER, 
        content: inputMessage,
        isVerified: sessionInfo.hasEmail
      }]);
      setInputMessage('');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>TechGadget Store AI Chatbot</h1>
        {sessionInfo.hasEmail && (
          <div className="session-status">
            Verified User {sessionInfo.email}
          </div>
        )}
      </header>
      <div className="chat-container">
        <div className="messages">
          {!isConnected ? (
            <div className="message system">
              Connecting to chat...
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.type} ${message.isVerified ? 'verified' : ''}`}
              >
                {message.content}
                {message.tags?.length > 0 && (
                  <div className="message-tags">
                    {message.tags.map((tag, i) => (
                      <span key={i} className="tag">
                        {tag} {/* Remove the replace function to keep symbols */}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={sessionInfo.hasEmail ? "Type your message..." : "Type your message or provide email..."}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default Chat;