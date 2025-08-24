// File: frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FriendsPage from './pages/FriendsPage'; 
import ProfilePage from './pages/ProfilePage'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/friends" element={<FriendsPage />} /> 
        <Route path="/profile/:userId" element={<ProfilePage />} /> 
        <Route path="/" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;