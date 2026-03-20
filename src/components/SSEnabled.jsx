import React from 'react';

const SSEnabled = ({ ssEnabled, timeLeft, onToggle, connected }) => {
  
  // Format seconds to MM:SS
  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="ss-display-container">
      <div className="ss-header">
        <h2 style={{ 
          margin: 0, 
          fontSize: '14px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          width: '100%' 
        }}>
          <span>GRACO 2KS</span>
          {ssEnabled === 1 && (
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
              ({formatTime(timeLeft)})
            </span>
          )}
        </h2>
      </div>
      
      <div className="flag-row" style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold', fontSize: '13px' }}>SS ENABLED</span>
        <button 
          className={ssEnabled === 1 ? "btn-on" : "btn-off"}
          onClick={onToggle}
          disabled={!connected}
          style={{ minWidth: '80px' }}
        >
          {ssEnabled === 1 ? "ON" : "OFF"}
        </button>
      </div>
    </div>
  );
};

export default SSEnabled;