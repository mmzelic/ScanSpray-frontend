import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import config from '../config';

export default function Main() {
  const [status, setStatus] = useState({ readBuffer: Array(100).fill(0), writeBuffer: Array(100).fill(0) });
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(config.SOCKET_URL);
    setSocket(newSocket);
    newSocket.on('read_update', (buf) => setStatus(p => ({ ...p, readBuffer: buf })));
    newSocket.on('write_update', (buf) => setStatus(p => ({ ...p, writeBuffer: buf })));
    return () => newSocket.close();
  }, []);

  // Helper to get specific read values
  const getVal = (addr, bit = null) => {
    const raw = status.readBuffer[addr - 200];
    if (bit !== null) return ((raw >> bit) & 1);
    return raw;
  };

  return (
    <div className="main-op-container">
      {/* 1. LARGE STATUS HERO */}
      <div className="op-hero">
        <div className="status-card">
          <label>SYSTEM STATUS</label>
          <div className={`status-value ${getVal(200, 0) ? 'active' : ''}`}>
            {getVal(200, 0) ? 'SPRAYING' : 'READY'}
          </div>
        </div>
        
        <div className="status-card">
          <label>ACTIVE RECIPE</label>
          <div className="status-value orange">{status.writeBuffer[20] || '--'}</div>
        </div>
      </div>

      {/* 2. CRITICAL TELEMETRY GRID */}
      <div className="telemetry-grid">
        <div className="tele-box">
          <label>ATOM AIR</label>
          <span>{status.writeBuffer[10]} <small>PSI</small></span>
        </div>
        <div className="tele-box">
          <label>FAN AIR</label>
          <span>{status.writeBuffer[11]} <small>PSI</small></span>
        </div>
        <div className="tele-box">
          <label>VOLTAGE</label>
          <span>{status.writeBuffer[13]} <small>kV</small></span>
        </div>
      </div>

      {/* 3. ALERTS / NOTIFICATIONS AREA */}
      <div className="alerts-panel">
        <h3>SYSTEM ALERTS</h3>
        {getVal(200, 1) ? (
          <div className="alert-item error">E-STOP ACTIVE</div>
        ) : (
          <div className="alert-item nominal">ALL SYSTEMS NOMINAL</div>
        )}
      </div>
    </div>
  );
}