import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-green-600 mb-6">
          ShareMarket
        </h1>
        <div className="bg-white p-8 rounded-xl shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;