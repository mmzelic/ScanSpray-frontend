import React from 'react';
import { digital, analog } from '../plcDefinitions';
import InputRow from '../components/InputRow'; // Assuming we moved the logic to a component

export default function Main({ plcStatus, socket }) {
  const { readBuffer, writeBuffer, connected } = plcStatus;

  // Helper to trigger PLC commands
  const handleSet = (reg, val) => socket?.emit('cmd_set', { reg, value: val });
  const handlePulse = (reg, bit) => {
    console.log("Attempting Pulse:", reg, bit); // Debug log
    socket?.emit('cmd_set_bit', { reg, bit, value: 1 });
    setTimeout(() => socket?.emit('cmd_set_bit', { reg, bit, value: 0 }), 500);
  };
  const handleToggle = (reg, bit) => {
    console.log("Attempting Toggle:", reg, bit); // Debug log
    socket?.emit('cmd_toggle', { reg, bit });
  };

  const currentProgram = writeBuffer[41];

  return (
    <div className="main-layout">
      {/* LEFT 2/3: PRIMARY CONTROLS */}
      <div className="operation-zone">
        
        {/* TOP 1/3: PROGRAM SELECTION */}
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
                  <img 
                    src={`/assets/prog${progId}.png`} 
                    alt={`Program ${progId}`}
                    onError={(e) => { e.target.style.display = 'none'; }} // Hide if image fails to load
                  />
                  {/* Show text overlay only if you want it, otherwise remove the span below */}
                  <span className="prog-label">PROGRAM {progId}</span>
                </div>
                <div className="selection-indicator">
                  {currentProgram === progId ? "● SELECTED" : "SELECT"}
                </div>
              </div>
            ))}
          </div>
          
          <button 
            className="btn-start-cycle"
            disabled={!connected}
            onClick={() => handlePulse(42, 1)}
          >
            START ROBOT CYCLE
          </button>
        </section>

        {/* MIDDLE SECTION: AIR & PARAMETERS */}
        <section className="parameters-zone">
          <div className="param-group">
             <h3>Air Controls</h3>
             <InputRow {...analog[0]} currentVal={writeBuffer[10]} onSet={handleSet} connected={connected} />
             <InputRow {...analog[1]} currentVal={writeBuffer[11]} onSet={handleSet} connected={connected} />
          </div>
          <div className="param-group">
             <h3>Robot Motion</h3>
             <InputRow {...analog[5]} currentVal={writeBuffer[40]} onSet={handleSet} connected={connected} /> {/* Speed */}
             <InputRow {...analog[7]} currentVal={writeBuffer[43]} onSet={handleSet} connected={connected} /> {/* Open Time */}
          </div>
        </section>

        {/* BOTTOM: ALERTS */}
        <section className="alerts-zone">
          <h2>System Alerts</h2>
          <div className="alert-box">
            {/* Logic for E-Stop or Safe to Move */}
            {((readBuffer[0] >> 0) & 1) ? <span className="err">E-STOP ACTIVE</span> : <span className="ok">SYSTEM NOMINAL</span>}
          </div>
        </section>
      </div>

      {/* RIGHT 1/3: FLAGS & MODES */}
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
                <button 
                  className={isSet ? "btn-on" : "btn-off"}
                  onClick={() => handleToggle(f.reg, f.bit)}
                  disabled={!connected}
                >{isSet ? "ON" : "OFF"}</button>
              </div>
            );
          })}
        </section>

        <section className="panel">
          <h2>Graco 2KS</h2>
          <FlagRow name="Mix Mode" reg={2} bit={0} writeBuffer={writeBuffer} onToggle={handleToggle} connected={connected} />
        </section>
      </div>
    </div>
  );
}

// Small helper for the sidebar rows
function FlagRow({ name, reg, bit, writeBuffer, onToggle, connected }) {
  const isSet = (writeBuffer[reg] >> bit) & 1;
  return (
    <div className="flag-row">
      <span>{name}</span>
      <button 
        className={isSet ? "btn-on" : "btn-off"}
        onClick={() => onToggle(reg, bit)}
        disabled={!connected}
      >{isSet ? "ON" : "OFF"}</button>
    </div>
  );
}