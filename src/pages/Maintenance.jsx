import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import config from '../config';
import { digital, analog, reads } from '../plcDefinitions';

export default function Maintenance() {
  const [status, setStatus] = useState({ 
    connected: false, 
    readBuffer: Array(100).fill(0), 
    writeBuffer: Array(100).fill(0),
    isSim: false
  });

  const [socket, setSocket] = useState(null);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const newSocket = io(config.SOCKET_URL);
    setSocket(newSocket);
    newSocket.on('initial_state', (data) => setStatus(data));
    newSocket.on('connection_status', (con) => setStatus(p => ({ ...p, connected: con })));
    newSocket.on('read_update', (buf) => setStatus(p => ({ ...p, readBuffer: buf })));
    newSocket.on('write_update', (buf) => setStatus(p => ({ ...p, writeBuffer: buf })));
    return () => newSocket.close();
  }, []);

  // Logic Helpers
  const handleToggle = (reg, bit) => socket?.emit('cmd_toggle', { reg, bit });
  const handlePulse = (reg, bit) => {
    socket?.emit('cmd_set_bit', { reg, bit, value: 1 });
    setTimeout(() => socket?.emit('cmd_set_bit', { reg, bit, value: 0 }), config.PULSE_MS);
  };
  const handleSet = (reg, value, min, max) => {
    const clamped = Math.min(Math.max(parseInt(value, 10), min), max);
    socket?.emit('cmd_set', { reg, value: clamped });
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  const getReadValue = (r) => {
    const raw = status.readBuffer[r.addr - 200];
    if (r.bit !== null) return ((raw >> r.bit) & 1) ? 'True' : 'False';
    return raw;
  };

  const sortByAddr = (a, b) => (a.reg * 100 + (a.bit || 0)) - (b.reg * 100 + (b.bit || 0));
  const sortByReadAddr = (a, b) => (a.addr * 100 + (a.bit || 0)) - (b.addr * 100 + (b.bit || 0));

  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const dateString = currentTime.toLocaleDateString([], { year: 'numeric', month: 'short', day: '2-digit' });

  return (
    <main className="dashboard-grid">
      {/* COLUMN 1: DIGITAL OUTPUTS (Left) */}
      <div className="dashboard-column">

        <section className="panel">
          <h2>Maintained Controls (Toggle)</h2>
          {digital
            .filter((d) => d.type === "toggle")
            .sort(sortByAddr)
            .map((d, i) => (
              <DigitalRow key={i} item={d} status={status} onAction={handleToggle} connected={status.connected} />
            ))}
        </section>

        <section className="panel">
          <h2>Analog Setpoints</h2>
          {analog.sort(sortByAddr).map((a, i) => (
            <InputRow
              key={i}
              {...a}
              currentVal={status.writeBuffer[a.reg]}
              onSet={handleSet}
              connected={status.connected}
            />
          ))}
        </section>
        
        <section className="panel">
          <h2>Momentary Commands (Pulse)</h2>
          {digital
            .filter((d) => d.type === "pulse")
            .sort(sortByAddr)
            .map((d, i) => (
              <DigitalRow key={i} item={d} status={status} onAction={handlePulse} connected={status.connected} />
            ))}
        </section>
      </div>

      {/* COLUMN 2: ANALOG & SYSTEM FEEDBACK (Right) */}
      <div className="dashboard-column">
        
        <section className="panel">
          <h2>System Feedback (Reads)</h2>
          {reads.sort(sortByReadAddr).map((r, i) => (
            <div className="row" key={i}>
              <div className="label-group-inline">
                <span className="addr-tag">
                  {r.bit !== null ? `[${r.addr}:${r.bit}]` : `[${r.addr}]`}
                </span>
                <span className="label">{r.name}</span>
              </div>
              <span
                className={`value-display ${
                  getReadValue(r) === "ACTIVE" ? "active-text" : ""
                }`}
              >
                {getReadValue(r)}
              </span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

// DigitalRow component
function DigitalRow({ item, status, onAction, connected }) {
  const isActive = (status.writeBuffer[item.reg] >> item.bit) & 1;
  
  return (
    <div className="row">
      <div className="label-group-inline">
        <span className="addr-tag">[{item.reg}:{item.bit}]</span>
        <span className="label" style={{ opacity: connected ? 1 : 0.5 }}>{item.name}</span>
      </div>
      <button 
        className={isActive ? "btn-on" : "btn-off"} 
        onClick={() => onAction(item.reg, item.bit)}
        disabled={!connected} // LOCK BUTTON
        style={{ cursor: connected ? 'pointer' : 'not-allowed', opacity: connected ? 1 : 0.3 }}
      >
        {item.type === 'pulse' ? (isActive ? "ACTIVE" : "PULSE") : (isActive ? "ON" : "OFF")}
      </button>
    </div>
  );
}

function InputRow({ name, reg, currentVal, min, max, onSet, connected }) {
  const [tempVal, setTempVal] = useState("");

  const triggerUpdate = () => {
    // Safety check: if somehow triggered while offline, do nothing
    if (!connected) return;

    let finalVal = parseInt(tempVal, 10);
    if (isNaN(finalVal) || finalVal < min) {
      onSet(reg, min, min, max);
    } else {
      onSet(reg, finalVal, min, max);
    }
    setTempVal("");
  };

  return (
    <div className="row">
      <div className="label-group-inline" style={{ opacity: connected ? 1 : 0.5 }}>
        <span className="addr-tag">[{reg}]</span>
        <span className="label">{name}</span>
        <span className="limit-hint-inline">({min}-{max})</span>
      </div>

      <div className="control-group">
        <input 
          type="number" 
          className="no-spinner"
          placeholder={currentVal} 
          value={tempVal}
          disabled={!connected} // LOCK INPUT
          onKeyDown={(e) => {
            if (['-','e','E'].includes(e.key)) e.preventDefault();
            if (e.key === 'Enter' && connected) triggerUpdate();
          }}
          onChange={(e) => {
            let val = e.target.value;
            if (val === "") setTempVal("");
            else setTempVal(parseInt(val, 10) > max ? max.toString() : val);
          }}
          style={{ 
            backgroundColor: connected ? 'var(--gmr-black)' : '#1a1a1a',
            cursor: connected ? 'text' : 'not-allowed' 
          }}
        />
        <button 
          onClick={triggerUpdate}
          disabled={!connected} // LOCK BUTTON
          style={{ 
            opacity: connected ? 1 : 0.3,
            cursor: connected ? 'pointer' : 'not-allowed'
          }}
        >
          SET
        </button>
      </div>
    </div>
  );
}