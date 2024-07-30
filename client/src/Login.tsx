import React, { useState } from 'react';
import './Login.css';

const Login = () => {
  const [activeButton, setActiveButton] = useState('Login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const toggleBackground = (button) => {
    setActiveButton(button);
    setUsername('');
    setPassword('');
  };

  const submitAction = () => {
    console.log(`Action: ${activeButton}`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);

    // Clear input fields
    setUsername('');
    setPassword('');
  };

  return (
    <div className="container">
      <div className="button-row">
        <button
          className={activeButton === 'Login' ? 'active' : ''}
          onClick={() => toggleBackground('Login')}>
          Login
        </button>
        <button
          className={activeButton === 'Sign-in' ? 'active' : ''}
          onClick={() => toggleBackground('Sign-in')}>
          Sign-in
        </button>
      </div>
      <div className="red-box">
        <input
          type="text"
          placeholder="Username"
          className="input-field"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button id="enter-button" onClick={submitAction}>
          {activeButton}
        </button>
      </div>
    </div>
  );
};

export default Login;
