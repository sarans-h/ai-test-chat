import React from 'react'
import Chat from './Chat'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Chat />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App