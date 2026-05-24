import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

const EnvironmentLogs = () => {
  const { id } = useParams();
  const [logs, setLogs] = useState('');
  const [envInfo, setEnvInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [id]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/environment/${id}/logs`);
      setLogs(res.data.logs);
      setEnvInfo(res.data.namespace);
    } catch (err) {
      setLogs('No logs available');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>📋 Environment Logs</h1>
        <a href="/dashboard" style={styles.backBtn}>← Back</a>
      </div>

      <div style={styles.card}>
        <div style={styles.infoBar}>
          <span>📦 Namespace: {envInfo}</span>
          <button onClick={fetchLogs} style={styles.refreshBtn}>
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading logs...</p>
        ) : (
          <pre style={styles.logBox}>
            {logs || 'No logs available'}
          </pre>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '20px' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333',
    color: 'white',
    padding: '15px 25px',
    borderRadius: '10px',
    marginBottom: '20px'
  },
  backBtn: {
    color: 'white',
    textDecoration: 'none',
    backgroundColor: '#555',
    padding: '8px 15px',
    borderRadius: '5px'
  },
  card: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  infoBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  refreshBtn: {
    padding: '8px 15px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  logBox: {
    backgroundColor: '#1e1e1e',
    color: '#00ff00',
    padding: '20px',
    borderRadius: '8px',
    fontSize: '13px',
    overflow: 'auto',
    maxHeight: '500px',
    whiteSpace: 'pre-wrap'
  }
};

export default EnvironmentLogs;