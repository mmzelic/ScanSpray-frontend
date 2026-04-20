import React, { useState, useEffect } from 'react';
import config from '../config';

const IMAGE_BASE = `${config.SOCKET_URL}/captures`;

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetchLogs = () => {
    fetch(`${config.SOCKET_URL}/api/logs`)
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err => console.error("Error fetching logs:", err));
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="logs-container">
      <div className="logs-header">
        <h2>Production Cycle History</h2>
        <button onClick={fetchLogs} className="btn-refresh">REFRESH</button>
      </div>

      <div className="table-wrapper">
        <table className="log-table">
          <thead>
            <tr>
              <th>Test</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i}>
                <td className="test-number">#{String(log.TestNumber).padStart(4, '0')}</td>
                <td>{log.Date}</td>
                <td>
                  <button className="btn-view" onClick={() => setSelected(log)}>
                    VIEW
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="log-detail-overlay" onClick={() => setSelected(null)}>
          <div className="log-detail-card" onClick={e => e.stopPropagation()}>
            <div className="log-detail-header">
              <span className="log-detail-title">
                TEST #{String(selected.TestNumber).padStart(4, '0')} &mdash; {selected.Date}
              </span>
              <button className="btn-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="log-detail-body">
              <div className="log-detail-stats">
                <StatRow label="Start Time"    value={selected.StartTime} />
                <StatRow label="End Time"      value={selected.EndTime} />
                <StatRow label="Duration"      value={`${selected['Duration(s)']} s`} highlight />
                <StatRow label="Robot Speed"   value={`${selected.Speed} mm/s`} />
                <StatRow label="Atomizing Air" value={selected.AtomAir} />
                <StatRow label="Fan Air"       value={selected.FanAir} />
                <StatRow label="Program"       value={selected.Program} />
                <StatRow label="2KS Recipe"     value={selected.Recipe} />
              </div>

              <div className="log-detail-image">
                {selected.ImageFile
                  ? <img src={`${IMAGE_BASE}/${selected.ImageFile}`} alt="Capture" />
                  : <div className="no-image">No image captured</div>
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({ label, value, highlight }) {
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${highlight ? 'highlight-orange' : ''}`}>{value}</span>
    </div>
  );
}
