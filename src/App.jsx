import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';

// CHANGE THIS TO YOUR RASPBERRY PI'S IP ADDRESS
const SERVER_IP_ADDRESS = '192.168.50.100';
const SOCKET_URL = `http://${SERVER_IP_ADDRESS}:3001`; 

const ERROR_DICT = {
  2000: "Low pressure on the EX600 pressure sensor",
  7000: "Connection Lost",
  9000: "Emergency stop"
};

export default function App() {
  const [status, setStatus] = useState({ 
    connected: false, 
    readBuffer: Array(100).fill(0), 
    writeBuffer: Array(100).fill(0) 
  });
  
  // Create a persistent socket reference
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 1. Connect to Backend
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // 2. Listen for Events
    newSocket.on('initial_state', (data) => {
      setStatus(data);
    });

    newSocket.on('connection_status', (isConnected) => {
      setStatus(prev => ({ ...prev, connected: isConnected }));
    });

    newSocket.on('read_update', (newReadBuffer) => {
      setStatus(prev => ({ ...prev, readBuffer: newReadBuffer }));
    });

    newSocket.on('write_update', (newWriteBuffer) => {
      setStatus(prev => ({ ...prev, writeBuffer: newWriteBuffer }));
    });

    // Cleanup on unmount
    return () => newSocket.close();
  }, []);

  // --- Send Commands via WebSocket ---
  const handleToggle = (reg, bit) => {
    if (socket) socket.emit('cmd_toggle', { reg, bit });
  };

  const handleSet = (reg, value) => {
    if (socket) socket.emit('cmd_set', { reg, value });
  };

  // --- UI Helpers ---
  const getReadBit = (reg, bit) => (status.readBuffer[reg] >> bit) & 1 ? "ON" : "OFF";
  const getWriteBit = (reg, bit) => (status.writeBuffer[reg] >> bit) & 1 ? "ON" : "OFF";

  const activeErrors = [];
  for (let i = 11; i <= 15; i++) {
    const code = status.readBuffer[i];
    if (code !== 0) {
      activeErrors.push(`[${code}] ${ERROR_DICT[code] || "Unknown Error"}`);
    }
  }

  const toggles = [
    { name: "Error Reset", reg: 0, bit: 0 }, { name: "Process Reset", reg: 0, bit: 1 },
    { name: "Heartbeat", reg: 1, bit: 0 }, { name: "Gun Trigger", reg: 1, bit: 9 },
    { name: "Mix Mode", reg: 2, bit: 0 }, { name: "Color Change Req", reg: 2, bit: 1 },
    { name: "E-Stat Enable", reg: 3, bit: 0 }, { name: "E-Stat Err Reset", reg: 3, bit: 1 }, { name: "E-Stat Remote En", reg: 3, bit: 2 }
  ];

  const inputs = [
    { name: "Atomizing Air", reg: 10 }, { name: "Fan Air", reg: 11 },
    { name: "Flow Setpoint", reg: 12 }, { name: "Voltage Setpoint", reg: 13 },
    { name: "Recipe", reg: 20 }
  ];

  const reads = [
    { name: "General E-Stop", addr: 200, bit: 0 }, { name: "Gun Trigger Sts", addr: 201, bit: 0 },
    { name: "Safe to Move", addr: 203, bit: 0 }, { name: "E-Stat Error", addr: 203, bit: 1 },
    { name: "PLC Step", addr: 210, bit: null }, { name: "Error 0", addr: 211, bit: null },
    { name: "Error 1", addr: 212, bit: null }, { name: "Error 2", addr: 213, bit: null },
    { name: "Error 3", addr: 214, bit: null }, { name: "Error 4", addr: 215, bit: null },
    { name: "Atomizing Air FB", addr: 220, bit: null }, { name: "Fan Air FB", addr: 221, bit: null },
    { name: "2KS Flow SP", addr: 222, bit: null }, { name: "Voltage FB", addr: 223, bit: null },
    { name: "Recipe Echo", addr: 230, bit: null }, { name: "Active Recipe", addr: 231, bit: null }
  ];

  return (
    <div className="app-container">
      <div className={`status-bar ${status.connected ? 'connected' : 'disconnected'}`}>
        {status.connected ? "CONNECTED: 192.168.11.210" : "DISCONNECTED / RECONNECTING..."}
      </div>

      <div className="main-grid">
        <div className="panel">
          <h2>Signals FROM SnX (Registers 0-99)</h2>
          {toggles.map((t, i) => (
            <div className="row" key={i}>
              <span>{t.name}</span>
              <span className="mono">{getWriteBit(t.reg, t.bit)}</span>
              <button onClick={() => handleToggle(t.reg, t.bit)}>Toggle</button>
            </div>
          ))}
          <hr />
          {inputs.map((inp, i) => (
            <InputRow key={i} name={inp.name} reg={inp.reg} onSet={handleSet} />
          ))}
        </div>

        <div className="panel">
          <h2>Signals TO SS (Registers 200-299)</h2>
          {reads.map((r, i) => {
            const idx = r.addr - 200;
            const val = r.bit !== null ? getReadBit(idx, r.bit) : status.readBuffer[idx];
            return (
              <div className="row read-row" key={i}>
                <span>{r.name}:</span>
                <span className="mono val-blue">{val}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="error-panel">
        <h3>Current System Errors:</h3>
        {activeErrors.length === 0 ? (
          <p className="mono val-green">No Active Errors</p>
        ) : (
          activeErrors.map((err, i) => <p key={i} className="mono val-red">{err}</p>)
        )}
      </div>
    </div>
  );
}

function InputRow({ name, reg, onSet }) {
  const [val, setVal] = useState("");
  return (
    <div className="row">
      <span>{name}</span>
      <input type="number" value={val} onChange={(e) => setVal(e.target.value)} />
      <button onClick={() => { onSet(reg, val); setVal(""); }}>Set</button>
    </div>
  );
}