import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Maintenance from './pages/Maintenance';
import Main from './pages/Main';
import Logs from './pages/Logs';
import config from './config';
import { io } from 'socket.io-client';

export default function App() {
  const [auth, setAuth] = useState(false);
  const [status, setStatus] = useState({ 
    connected: false, 
    isSim: false, 
    readBuffer: new Array(100).fill(0),
    writeBuffer: new Array(100).fill(0)
  });

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!auth) return;

    // Initialize Socket
    const newSocket = io(config.SOCKET_URL);
    setSocket(newSocket);

    // 1. Initial State Sync (happens once on connect)
    newSocket.on('initial_state', (data) => {
      console.log("Initial State Received:", data);
      setStatus(data); 
    });

    // 2. Connection Status (Physical PLC link)
    newSocket.on('connection_status', (connected) => {
      setStatus(prev => ({ ...prev, connected }));
    });

    // 3. READ Update (PLC -> UI)
    newSocket.on('read_update', (data) => {
      setStatus(prev => ({ 
        ...prev, 
        readBuffer: [...data] // Spread into new array to force React update
      }));
    });

    // 4. WRITE Update (UI -> PLC -> UI) - FIXES THE BUTTONS
    newSocket.on('write_update', (data) => {
      console.log("Write Buffer Updated from Backend");
      setStatus(prev => ({ 
        ...prev, 
        writeBuffer: [...data] // Spread into new array to force React update
      }));
    });

    return () => newSocket.close();
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
            
            {/* Pass status and socket down to children */}
            <Route 
                path="/main" 
                element={auth ? <Main plcStatus={status} socket={socket}/> : <Navigate to="/login" />} 
            />
            <Route 
                path="/maintenance" 
                element={auth ? <Maintenance plcStatus={status} socket={socket}/> : <Navigate to="/login" />} 
            />
            <Route path="/logs" element={auth ? <Logs socket={socket}/> : <Navigate to="/login" />} />
            
            <Route path="*" element={<Navigate to={auth ? "/main" : "/login"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

// --- LoginScreen remains the same as your provided code ---
function LoginScreen({ onLogin }) {
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