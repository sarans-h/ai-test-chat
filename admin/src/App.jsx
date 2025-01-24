import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000');

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

  const handleSelectChat = (customer) => {
    setSelectedChat(customer);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && selectedChat) {
      // Dummy logic to add the message to the chat history
      const newMessage = {
        role: 'user',
        content: inputMessage,
        timestamp: new Date().toISOString()
      };
      setSelectedChat(prevChat => ({
        ...prevChat,
        chatHistory: [...prevChat.chatHistory, newMessage]
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
                  <p><strong>{message.role}:</strong> {message.content}</p>
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

export default App;