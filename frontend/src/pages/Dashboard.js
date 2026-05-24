import React, { useState, useEffect } from 'react';
import { getEnvironments, createEnvironment, deleteEnvironment } from '../services/api';

const Dashboard = () => {
  const [environments, setEnvironments] = useState([]);
  const [user, setUser] = useState(null);
  const [envName, setEnvName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchEnvironments();
  }, []);

  const fetchEnvironments = async () => {
    try {
      const res = await getEnvironments();
      setEnvironments(res.data.environments);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createEnvironment({ name: envName });
      setMessage('✅ Environment created!');
      setEnvName('');
      fetchEnvironments();
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Error'));
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete karna hai?')) {
      try {
        await deleteEnvironment(id);
        setMessage('✅ Environment deleted!');
        fetchEnvironments();
      } catch (err) {
        setMessage('❌ Error deleting');
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.logo}>🚀 Dev Platform</h1>
        <div style={styles.userInfo}>
            {user?.role === 'admin' && (
                <a href="/admin" style={styles.navBtn}>👑 Admin</a>
            )}
            {(user?.role === 'teamlead' || user?.role === 'admin') && (
                <a href="/teams" style={styles.navBtn}>👥 Teams</a>
            )}
            <span style={{color: 'white'}}>👤 {user?.name} ({user?.role})</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Create Environment */}
      <div style={styles.card}>
        <h2>➕ New Environment</h2>
        <form onSubmit={handleCreate} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Environment name (e.g. my-app)"
            value={envName}
            onChange={(e) => setEnvName(e.target.value)}
            required
          />
          <button style={styles.createBtn} type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Environment'}
          </button>
        </form>
        {message && <p style={styles.message}>{message}</p>}
      </div>

      {/* Environments List */}
      <div style={styles.card}>
        <h2>🌐 My Environments ({environments.length})</h2>
        {environments.length === 0 ? (
          <p style={{color: '#666'}}>Koi environment nahi hai — banao!</p>
        ) : (
          environments.map(env => (
            <div key={env.id} style={styles.envCard}>
              <div>
                <h3 style={styles.envName}>{env.name}</h3>
                <p style={styles.envUrl}>
                🔗 <a 
                    href={env.url} 
                    rel="noreferrer"
                    onClick={(e) => {
                    e.preventDefault();
                    window.open(env.url, '_blank', 'noopener,noreferrer');
                    }}
                >
                    {env.url}
                </a>
                </p>
                <p style={styles.envNamespace}>📦 Namespace: {env.namespace}</p>
                <span style={styles.statusBadge}>{env.status}</span>
              </div>
              <div style={{display: 'flex', gap: '10px'}}>
                <a 
                  href={`/environment/${env.id}/logs`} 
                  style={styles.logsBtn}
                >
                  📋 Logs
                </a>
                <button 
                  onClick={() => handleDelete(env.id)} 
                  style={styles.deleteBtn}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
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
  logo: { margin: 0, fontSize: '24px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '15px' },
  navBtn: {
    color: 'white',
    textDecoration: 'none',
    backgroundColor: '#555',
    padding: '8px 15px',
    borderRadius: '5px'
  },
  logoutBtn: {
    padding: '8px 15px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  card: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  },
  form: { display: 'flex', gap: '10px' },
  input: {
    flex: 1,
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px'
  },
  createBtn: {
    padding: '12px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  message: { marginTop: '10px', fontWeight: 'bold' },
  envCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    border: '1px solid #eee',
    borderRadius: '8px',
    marginBottom: '10px'
  },
  envName: { margin: '0 0 5px 0', color: '#333' },
  envUrl: { margin: '0 0 5px 0', fontSize: '14px' },
  envNamespace: { margin: '0 0 5px 0', fontSize: '12px', color: '#666' },
  statusBadge: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px'
  },
  logsBtn: {
    padding: '8px 15px',
    backgroundColor: '#3498db',
    color: 'white',
    borderRadius: '5px',
    textDecoration: 'none',
    fontSize: '14px'
  },
  deleteBtn: {
    padding: '8px 15px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  }
};

export default Dashboard;