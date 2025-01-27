import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000');

const EVENT_TYPES = {
  RESPONSE: 'ai-response',
  REALTIME: 'realtime',
  APPOINTMENT: 'appointment',
  ERROR: 'error',
  HANDOVER: 'handover',
  AI_RESUME: 'ai-resume',
  REPRESENTATIVE_MESSAGE: 'representative-message', // Listen for representative messages
  JOIN_AS_REPRESENTATIVE: 'joinAsRepresentative', // New event type
  LEAVE_AS_REPRESENTATIVE: 'leaveAsRepresentative', // New event type
  ADMIN_RESPONSE: 'admin-response'
};

const App = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/customers')
      .then(response => response.json())
      .then(data => {
        const customersWithStatus = data.map(customer => ({
          ...customer,
          isOnline: false
        }));
        setCustomers(customersWithStatus);
        customersWithStatus.forEach(customer => {
          socket.emit('checkRoomStatus', customer.roomId, (response) => {
            setCustomers(prevCustomers => prevCustomers.map(c => 
              c.roomId === customer.roomId ? { ...c, isOnline: response.isActive } : c
            ));
          });
        });
      })
      .catch(error => console.error('Error fetching customers:', error));
  }, []);

  useEffect(() => {
    const handleServerResponse = (data) => {
      if (selectedChat && data.sessionInfo?.email === selectedChat.email) {
        let role;
        if (data.sessionInfo.isAdmin) {
          role = 'admin';
        } else if (data.sessionInfo.type === 'representative') {
          role = 'representative';
        } else {
          role = data.sessionInfo.type;
        }

        setSelectedChat((prevChat) => ({
          ...prevChat,
          chatHistory: [
            ...prevChat.chatHistory,
            {
              role,
              content: data.message,
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      }
    };

    const handleUserDisconnected = ({ roomId, email, timestamp }) => {
      if (selectedChat && email === selectedChat.email) {
        setSelectedChat((prevChat) => ({
          ...prevChat,
          chatHistory: [
            ...prevChat.chatHistory,
            {
              role: 'system',
              content: `User has disconnected at ${new Date(timestamp).toLocaleTimeString()}.`,
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      }
    };

    socket.on(EVENT_TYPES.RESPONSE, handleServerResponse);
    socket.on(EVENT_TYPES.REALTIME, handleServerResponse);
    socket.on(EVENT_TYPES.APPOINTMENT, handleServerResponse);
    socket.on(EVENT_TYPES.HANDOVER, handleServerResponse);
    socket.on(EVENT_TYPES.AI_RESUME, handleServerResponse);
    socket.on(EVENT_TYPES.REPRESENTATIVE_MESSAGE, handleServerResponse); // Listen for representative messages
    socket.on('user-message', ({ roomId, message, sessionInfo }) => {
      if (selectedChat && sessionInfo.email === selectedChat.email) {
        setSelectedChat((prevChat) => ({
          ...prevChat,
          chatHistory: [
            ...prevChat.chatHistory,
            {
              role: 'user',
              content: message,
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      }
    });

    socket.on(EVENT_TYPES.ADMIN_RESPONSE, handleServerResponse);
    
    // Listen for user-disconnected events
    socket.on('user-disconnected', handleUserDisconnected);

    return () => {
      socket.off(EVENT_TYPES.RESPONSE, handleServerResponse);
      socket.off(EVENT_TYPES.REALTIME, handleServerResponse);
      socket.off(EVENT_TYPES.APPOINTMENT, handleServerResponse);
      socket.off(EVENT_TYPES.HANDOVER, handleServerResponse);
      socket.off(EVENT_TYPES.AI_RESUME, handleServerResponse);
      socket.off(EVENT_TYPES.REPRESENTATIVE_MESSAGE, handleServerResponse);
      socket.off('user-message');
      socket.off(EVENT_TYPES.ADMIN_RESPONSE, handleServerResponse);
      socket.off('user-disconnected');
    };
  }, [selectedChat]);

  const handleSelectChat = (customer) => {
    if (selectedChat && selectedChat.roomId !== customer.roomId) {
      socket.emit(EVENT_TYPES.LEAVE_AS_REPRESENTATIVE, selectedChat.roomId);
    }
    setSelectedChat(customer);
    socket.emit(EVENT_TYPES.JOIN_AS_REPRESENTATIVE, customer.roomId); // Emit join as representative
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && selectedChat) {
      socket.emit(EVENT_TYPES.REPRESENTATIVE_MESSAGE, { roomId: selectedChat.roomId, message: inputMessage }); // Emit representative message
      setSelectedChat((prevChat) => ({
        ...prevChat,
        chatHistory: [
          ...prevChat.chatHistory,
          {
            role: 'representative', // Updated role
            content: inputMessage,
            timestamp: new Date().toISOString(),
          },
        ],
      }));
      setInputMessage('');
    }
  };

  return (
    <div className="chat-history-container">
      <div className="chat-list">
        {customers.map((customer, index) => (
          <div
            key={index}
            onClick={() => handleSelectChat(customer)}
            className={`chat-item ${selectedChat === customer ? 'selected' : ''}`}
          >
            {customer.email} {customer.isOnline ? '(Online)' : '(Offline)'}
          </div>
        ))}
      </div>
      <div className="chat-content">
        {selectedChat ? (
          <div>
            <h2>Chat with {selectedChat.email}</h2>
            <div className="messages">
              {selectedChat.chatHistory.map((message, index) => (
                <div key={index} className={`message ${message.role}`}>
                  <p><strong>{capitalizeFirstLetter(message.role)}:</strong> {message.content}</p>
                  <p><small>{new Date(message.timestamp).toLocaleString()}</small></p>
                </div>
              ))}
            </div>
            <div className="input-form">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        ) : (
          <div>Please select a chat from the list.</div>
        )}
      </div>
    </div>
  );
}

// Add helper function to capitalize role names
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default App;