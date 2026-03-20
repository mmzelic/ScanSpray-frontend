import React, { useState, useEffect } from 'react';
import config from '../config';

export default function Logs() {
  const [logs, setLogs] = useState([]);

  const fetchLogs = () => {
    fetch(`${config.SOCKET_URL.replace(':3001', ':3001/api/logs')}`)
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err => console.error("Error fetching logs:", err));
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Refresh every 5s
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
              <th>Date</th>
              <th>Start/End</th>
              <th>Duration</th>
              <th>Prog</th>
              <th>2ks Recipe</th>
              <th>Air (A/F)</th>
              <th>Speed</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i}>
                <td>{log.Date}</td>
                <td><small>{log.StartTime} - {log.EndTime}</small></td>
                <td className="highlight-orange">{log.Duration}s</td>
                <td>{log.Program}</td>
                <td>{log.Recipe}</td>
                <td>{log.AtomAir}/{log.FanAir}</td>
                <td>{log.Speed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}