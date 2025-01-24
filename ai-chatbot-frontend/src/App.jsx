import React from 'react'
import Chat from './Chat'
import ChatHistory from './ChatHistory.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css';
import './ChatHistory.css';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/history" element={<ChatHistory />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App