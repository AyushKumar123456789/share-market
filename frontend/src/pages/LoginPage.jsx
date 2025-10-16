import React from 'react';
import { useLocation } from 'react-router-dom';
import Login from '../components/Login';
import AuthLayout from './AuthLayout';

const LoginPage = () => {
  const location = useLocation();
  const message = location.state?.message;

  return (
    <AuthLayout title="Login to Your Account">
      {message && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-lg text-sm">
          {message}
        </div>
      )}
      <Login />
    </AuthLayout>
  );
};

export default LoginPage;
