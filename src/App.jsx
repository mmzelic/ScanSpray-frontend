import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Maintenance from './pages/Maintenance';
import Main from './pages/Main';
import config from './config';
import { io } from 'socket.io-client';

export default function App() {
  const [auth, setAuth] = useState(false);
  const [status, setStatus] = useState({ 
    connected: false, 
    isSim: false, // Start false
    readBuffer: [],
    writeBuffer: []
  });

  useEffect(() => {
    if (!auth) return;

    const socket = io(config.SOCKET_URL);
    
    socket.on('connection_status', (connected) => {
      setStatus(prev => ({ ...prev, connected }));
    });

    // CRITICAL: Listen for the simulation flag from your server
    socket.on('initial_state', (data) => {
      setStatus(data); 
    });

    return () => socket.close();
  }, [auth]);

  return (
    <Router>
      <div className="app-container">
        
        {auth && (
          <Header 
            user={config.OPERATOR_ID} 
            connected={status.connected} 
            isSim={status.isSim} 
          />
        )}
        
        <div className="page-content">
          <Routes>
            <Route path="/login" element={<LoginScreen onLogin={() => setAuth(true)} />} />
            <Route path="/main" element={auth ? <Main plcStatus={status} /> : <Navigate to="/login" />} />
            <Route path="/maintenance" element={auth ? <Maintenance plcStatus={status} /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to={auth ? "/main" : "/login"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('GMR');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Use config values for validation
    if (username === config.AUTH_USER && password === config.AUTH_PASS) {
      onLogin();
      navigate('/main');
    } else {
      setError('INVALID CREDENTIALS ACCESS DENIED');
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError(''); // Clear error as soon as user types
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <h1>SCAN<span>&</span>SPRAY™</h1>
        <form onSubmit={handleLogin}>
          <div className="login-input-group">
            <label>Operator ID</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="GMR"
            />
          </div>
          <div className="login-input-group">
            <label>Security Key</label>
            <input 
              type="password" 
              value={password} 
              onChange={handlePasswordChange} // Updated this line
              placeholder="****"
            />
          </div>
          
          {/* Error Container with fixed height to prevent "jumping" */}
          <div className="error-container">
            {error && <div className="error-msg">{error}</div>}
          </div>

          <button type="submit">LOGIN</button>
        </form>
      </div>
    </div>
  );
}