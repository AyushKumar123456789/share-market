// File: frontend/src/App.jsx
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FriendsPage from './pages/FriendsPage'; 
import ProfilePage from './pages/ProfilePage'; 
import ChatPage from './pages/ChatPage';
import { useEffect, useContext } from 'react';
import API from './api';
import { AuthContext } from './context/AuthContext';

function App() {

  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

    useEffect(() => {
        // This is the Response Interceptor (the guard for incoming packages)
        const responseInterceptor = API.interceptors.response.use(
            response => response,
            error => {
                // Check if the error is a 401 Unauthorized
                if (error.response?.status === 401) {
                    console.log("Session expired, logging out.");
                    logout();
                    navigate('/login', { state: { message: "Your session has expired. Please log in again." } });
                }
                // Important: return a rejected promise to not swallow the error
                return Promise.reject(error);
            }
        );

        // Cleanup function to remove the interceptor when the component unmounts
        return () => {
            API.interceptors.response.eject(responseInterceptor);
        };
    }, [logout, navigate]);

  return (
    
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/friends" element={<FriendsPage />} /> 
        <Route path="/profile/:userId" element={<ProfilePage />} /> 
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/" element={<DashboardPage />} />
      </Routes>
    
  );
}

export default App;