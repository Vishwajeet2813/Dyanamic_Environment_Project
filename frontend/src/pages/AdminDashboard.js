import React, { useState, useEffect } from 'react';
import { getAllUsers, changeRole } from '../services/api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await changeRole(id, role);
      setMessage(`✅ Role updated to ${role}`);
      fetchUsers();
    } catch (err) {
      setMessage('❌ Error updating role');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>👑 Admin Dashboard</h1>
        <a href="/dashboard" style={styles.backBtn}>← Back</a>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      <div style={styles.card}>
        <h2>👥 All Users ({users.length})</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={styles.td}>{user.id}</td>
                <td style={styles.td}>{user.name}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: 
                      user.role === 'admin' ? '#e74c3c' :
                      user.role === 'teamlead' ? '#f39c12' : '#4CAF50'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={styles.td}>
                  <select
                    style={styles.select}
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="developer">Developer</option>
                    <option value="teamlead">Team Lead</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    backgroundColor: '#f5f5f5',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd'
  },
  td: { padding: '12px', borderBottom: '1px solid #eee' },
  badge: {
    color: 'white',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px'
  },
  select: {
    padding: '6px',
    borderRadius: '5px',
    border: '1px solid #ddd'
  },
  message: {
    padding: '10px',
    backgroundColor: '#f0f9f0',
    borderRadius: '5px',
    marginBottom: '15px',
    fontWeight: 'bold'
  }
};

export default AdminDashboard;