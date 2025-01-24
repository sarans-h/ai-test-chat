import React, { useState, useEffect } from 'react';
import './ChatHistory.css';

const ChatHistory = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/customers')
      .then(response => response.json())
      .then(data => setCustomers(data))
      .catch(error => console.error('Error fetching customers:', error));
  }, []);

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
            onClick={() => setSelectedChat(customer)}
            className={`chat-item ${selectedChat === customer ? 'selected' : ''}`}
          >
            {customer.email}
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

export default ChatHistory;