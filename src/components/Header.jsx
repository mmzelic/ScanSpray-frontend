import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header({ user, connected, isSim }) {
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="status-bar">
      <div className="brand-section">
        <div className="brand-name">PLC<span>S</span>pray™</div>
      </div>

      <div className="right-controls" style={{ display: 'flex', alignItems: 'center' }}>
        <div className="status-indicators">
          {isSim && <span className="sim-indicator">SIMULATION</span>}
          <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? '● ONLINE' : '○ OFFLINE'}
          </div>
        </div>

        <nav className="header-nav">
          <button className={location.pathname === '/main' ? 'active' : ''} onClick={() => navigate('/main')}>
            <span>▤</span>
          </button>
          <button className={location.pathname === '/logs' ? 'active' : ''} onClick={() => navigate('/logs')}>
            <span>📋</span>
          </button>
          <button className={location.pathname === '/maintenance' ? 'active' : ''} onClick={() => navigate('/maintenance')}>
            <span>⚙</span>
          </button>
        </nav>
      </div>
    </header>
  );
}