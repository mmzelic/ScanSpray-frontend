import React, { useState, useEffect } from 'react';
import { digital, analog } from '../plcDefinitions';
import PLCEnabled from '../components/PLCEnabled'; 
import InputRow from '../components/InputRow';
import config from '../config';

export default function Main({ plcStatus, socket }) {
  const { readBuffer, writeBuffer, connected } = plcStatus;

  const robotInCycle = (plcStatus.readBuffer[250] >> 1) & 1;

  // --- TIMER STATE (Moved here to prevent resets) ---
  const [plcTimer, setplcTimer] = useState(config.PLC_TIMEOUT_MINUTES * 60);

  // --- PLC Data Extraction ---
  const currentProgram = writeBuffer[41];
  const plcEnabledBit = (writeBuffer[42] >> 6) & 1;

  // --- PLC Handlers ---
  const handleSet = (reg, val) => socket?.emit('cmd_set', { reg, value: val });
  const handleToggle = (reg, bit) => socket?.emit('cmd_toggle', { reg, bit });
  const handlePulse = (reg, bit) => {
    socket?.emit('cmd_set_bit', { reg, bit, value: 1 });
    setTimeout(() => socket?.emit('cmd_set_bit', { reg, bit, value: 0 }), 500);
  };

  useEffect(() => {
    let interval = null;

    if (plcEnabledBit === 1) {
      interval = setInterval(() => {
        setplcTimer((prev) => {
          if (prev <= 1) {
            // FORCE WRITE 0 (Don't use toggle here)
            // This tells the backend specifically "Set this bit to 0"
            socket?.emit('cmd_set_bit', { reg: 42, bit: 6, value: 0 });
            
            clearInterval(interval);
            return config.PLC_TIMEOUT_MINUTES * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
      setplcTimer(config.PLC_TIMEOUT_MINUTES * 60);
    }

    return () => clearInterval(interval);
  }, [plcEnabledBit, socket]); // Added socket to dependencies

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
          <button className="btn-start-cycle" disabled={!connected && !robotInCycle && !plcEnabledBit} onClick={() => handlePulse(42, 1)}>
            START ROBOT CYCLE
          </button>
        </section>

        <section className="parameters-zone">
          <div className="param-group" >
             <h3>Air Controls</h3>
             <InputRow name={analog[0].name} reg={analog[0].reg} min={analog[0].min} max={analog[0].max} currentVal={writeBuffer[10]} onSet={handleSet} connected={connected} />
             <InputRow name={analog[1].name} reg={analog[1].reg} min={analog[1].min} max={analog[1].max}  currentVal={writeBuffer[11]} onSet={handleSet} connected={connected} />
          </div>
          <div className="param-group">
             <h3>Robot Motion</h3>
             <InputRow name={analog[5].name} reg={analog[5].reg} min={analog[5].min} max={analog[5].max}  currentVal={writeBuffer[40]} onSet={handleSet} connected={connected} />
             <InputRow name={analog[7].name} reg={analog[7].reg} min={analog[7].min} max={analog[7].max}  currentVal={writeBuffer[43]} onSet={handleSet} connected={connected} />
          </div>
        </section>

        <section className="alerts-zone">
          <h2>System Alerts</h2>
          <div className="alert-box">
            {((readBuffer[0] >> 0) & 0) ? <span className="err">E-STOP ACTIVE</span> : <span className="ok">No Faults</span>}
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
          <PLCEnabled 
            plcEnabled={plcEnabledBit} 
            timeLeft={plcTimer} 
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