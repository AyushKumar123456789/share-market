import React from 'react';
import Signup from './components/Signup';
import Login from './components/Login';

const App = () => {
  return (
    <div>
      <h1>MERN Auth App</h1>
      <Signup />
      <Login />
    </div>
  );
};

export default App;