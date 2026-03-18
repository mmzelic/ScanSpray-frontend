import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('GMR');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === config.AUTH_USER && password === config.AUTH_PASS) {
      onLogin();
      navigate('/main');
    } else {
      setError('INVALID CREDENTIALS ACCESS DENIED');
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <h1>SCAN<span>&</span>SPRAY™</h1>
        <form onSubmit={handleLogin}>
          <div className="login-input-group">
            <label>Operator ID</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="GMR" />
          </div>
          <div className="login-input-group">
            <label>Security Key</label>
            <input type="password" value={password} onChange={handlePasswordChange} placeholder="****" />
          </div>
          <div className="error-container">
            {error && <div className="error-msg">{error}</div>}
          </div>
          <button type="submit">LOGIN</button>
        </form>
      </div>
    </div>
  );
}