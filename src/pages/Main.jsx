import React, { useState, useEffect } from 'react';
import { digital, analog } from '../plcDefinitions';
import SSEnabled from '../components/SSEnabled'; 
import InputRow from '../components/InputRow';
import config from '../config';

export default function Main({ plcStatus, socket }) {
  const { readBuffer, writeBuffer, connected } = plcStatus;

  // --- TIMER STATE (Moved here to prevent resets) ---
  const [ssTimer, setSsTimer] = useState(config.SS_TIMEOUT_MINUTES * 60);

  // --- PLC Data Extraction ---
  const currentProgram = writeBuffer[41];
  const ssEnabledBit = (writeBuffer[42] >> 6) & 1;

  // --- PLC Handlers ---
  const handleSet = (reg, val) => socket?.emit('cmd_set', { reg, value: val });
  const handleToggle = (reg, bit) => socket?.emit('cmd_toggle', { reg, bit });
  const handlePulse = (reg, bit) => {
    socket?.emit('cmd_set_bit', { reg, bit, value: 1 });
    setTimeout(() => socket?.emit('cmd_set_bit', { reg, bit, value: 0 }), 500);
  };

  useEffect(() => {
    let interval = null;

    if (ssEnabledBit === 1) {
      interval = setInterval(() => {
        setSsTimer((prev) => {
          if (prev <= 1) {
            // FORCE WRITE 0 (Don't use toggle here)
            // This tells the backend specifically "Set this bit to 0"
            socket?.emit('cmd_set_bit', { reg: 42, bit: 6, value: 0 });
            
            clearInterval(interval);
            return config.SS_TIMEOUT_MINUTES * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
      setSsTimer(config.SS_TIMEOUT_MINUTES * 60);
    }

    return () => clearInterval(interval);
  }, [ssEnabledBit, socket]); // Added socket to dependencies

  return (
    <div className="main-layout">
      {/* LEFT COLUMN */}
      <div className="operation-zone">
        <section className="program-selector">
          <h2>Robot Program Selection</h2>
          <div className="program-grid">
            {[1, 2, 3].map((progId) => (
              <div 
                key={progId}
                className={`program-card ${currentProgram === progId ? 'active' : ''} ${!connected ? 'locked' : ''}`}
                onClick={() => connected && handleSet(41, progId)}
              >
                <div className="img-container">
                  <img src={`/assets/prog${progId}.png`} alt={`Prog ${progId}`} />
                  <span className="prog-label">PROGRAM {progId}</span>
                </div>
                <div className="selection-indicator">
                  {currentProgram === progId ? "● SELECTED" : "SELECT"}
                </div>
              </div>
            ))}
          </div>
          <button className="btn-start-cycle" disabled={!connected} onClick={() => handlePulse(42, 1)}>
            START ROBOT CYCLE
          </button>
        </section>

        <section className="parameters-zone">
          <div className="param-group">
             <h3>Air Controls</h3>
             <InputRow {...analog[0]} currentVal={writeBuffer[10]} onSet={handleSet} connected={connected} />
             <InputRow {...analog[1]} currentVal={writeBuffer[11]} onSet={handleSet} connected={connected} />
          </div>
          <div className="param-group">
             <h3>Robot Motion</h3>
             <InputRow {...analog[5]} currentVal={writeBuffer[40]} onSet={handleSet} connected={connected} />
             <InputRow {...analog[7]} currentVal={writeBuffer[43]} onSet={handleSet} connected={connected} />
          </div>
        </section>

        <section className="alerts-zone">
          <h2>System Alerts</h2>
          <div className="alert-box">
            {((readBuffer[0] >> 0) & 1) ? <span className="err">E-STOP ACTIVE</span> : <span className="ok">SYSTEM NOMINAL</span>}
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN */}
      <div className="status-sidebar">
        <section className="panel">
          <h2>System Flags</h2>
          {[
            { name: "Flag 1", reg: 42, bit: 2 },
            { name: "Flag 2", reg: 42, bit: 3 },
            { name: "Flag 3", reg: 42, bit: 4 },
            { name: "Flag 8", reg: 42, bit: 5 }
          ].map((f, i) => {
            const isSet = (writeBuffer[f.reg] >> f.bit) & 1;
            return (
              <div key={i} className="flag-row">
                <span>{f.name}</span>
                <button className={isSet ? "btn-on" : "btn-off"} onClick={() => handleToggle(f.reg, f.bit)} disabled={!connected}>
                  {isSet ? "ON" : "OFF"}
                </button>
              </div>
            );
          })}
        </section>

        {/* GRACO PANEL */}
        <section className="panel graco-panel">
          <SSEnabled 
            ssEnabled={ssEnabledBit} 
            timeLeft={ssTimer} 
            onToggle={() => handleToggle(42, 6)} 
            connected={connected}
          />
          <div style={{ height: '1px', background: 'var(--border)', margin: '15px 0', opacity: 0.3 }} />
          <FlagRow name="Mix Mode" reg={2} bit={0} writeBuffer={writeBuffer} onToggle={handleToggle} connected={connected} />
        </section>
      </div>
    </div>
  );
}

function FlagRow({ name, reg, bit, writeBuffer, onToggle, connected }) {
  const isSet = (writeBuffer[reg] >> bit) & 1;
  return (
    <div className="flag-row">
      <span>{name}</span>
      <button className={isSet ? "btn-on" : "btn-off"} onClick={() => onToggle(reg, bit)} disabled={!connected}>
        {isSet ? "ON" : "OFF"}
      </button>
    </div>
  );
}