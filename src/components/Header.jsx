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
        <div className="brand-name">SCAN<span>&</span>SPRAY™</div>
        
        {/* Only show if true. If PLC is live, isSim should be false */}
        {isSim === true && <span className="sim-indicator">SIMULATION MODE</span>}
        
        <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '● SYSTEM ONLINE' : '○ SYSTEM OFFLINE'}
        </div>
      </div>

      <nav className="nav-panel">
        <div className="user-info">
          <span className="nav-label">OP:</span>
          <span className="nav-value">{user}</span>
        </div>
        
        {/* Vertical Separator */}
        <div className="nav-divider"></div>

        <div className="time-info">
          <span className="nav-value">{time.toLocaleTimeString([], {hour12: false})}</span>
          <span className="nav-date">{time.toLocaleDateString([], {month: 'short', day: '2-digit'})}</span>
        </div>

        {/* Maintenance Toggle Button */}
        <button 
          className={`gear-btn ${location.pathname === '/maintenance' ? 'active' : ''}`}
          onClick={() => navigate(location.pathname === '/maintenance' ? '/main' : '/maintenance')}
          title="Maintenance & Troubleshooting"
        >
          ⚙
        </button>
      </nav>
    </header>
  );
}