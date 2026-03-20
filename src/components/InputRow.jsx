import React, { useState } from 'react';

export default function InputRow({ name, reg, currentVal, min, max, onSet, connected }) {
  const [tempVal, setTempVal] = useState("");

  const triggerUpdate = () => {
    if (!connected) return;
    let finalVal = parseInt(tempVal, 10);
    if (isNaN(finalVal) || finalVal < min) {
      onSet(reg, min);
    } else {
      onSet(reg, finalVal);
    }
    setTempVal("");
  };

  return (
    <div className="row">
      <div className="label-group-inline" style={{ opacity: connected ? 1 : 0.5 }}>
        {reg && <span className="addr-tag">[{reg}]</span>}
        <span className="label">{name}</span>
        <span className="limit-hint-inline">({min}-{max})</span>
      </div>

      <div className="control-group">
        <input 
          type="number" 
          className="no-spinner"
          placeholder={currentVal} 
          value={tempVal}
          disabled={!connected}
          onKeyDown={(e) => {
            if (['-','e','E'].includes(e.key)) e.preventDefault();
            if (e.key === 'Enter' && connected) triggerUpdate();
          }}
          onChange={(e) => {
            let val = e.target.value;
            if (val === "") setTempVal("");
            else setTempVal(parseInt(val, 10) > max ? max.toString() : val);
          }}
        />
        <button 
          onClick={triggerUpdate}
          disabled={!connected}
          className="btn-set"
        >
          SET
        </button>
      </div>
    </div>
  );
}