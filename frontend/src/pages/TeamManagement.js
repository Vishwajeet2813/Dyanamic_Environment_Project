import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await API.get('/api/team/list');
      setTeams(res.data.teams);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/team/create', { name: teamName });
      setMessage('✅ Team created!');
      setTeamName('');
      fetchTeams();
    } catch (err) {
      setMessage('❌ Error creating team');
    }
  };

  const fetchMembers = async (teamId) => {
    try {
      const res = await API.get(`/api/team/${teamId}/members`);
      setMembers(res.data.members);
      setSelectedTeam(teamId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/team/addmember', {
        team_id: selectedTeam,
        user_id: parseInt(userId)
      });
      setMessage('✅ Member added!');
      setUserId('');
      fetchMembers(selectedTeam);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Error'));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>👥 Team Management</h1>
        <a href="/dashboard" style={styles.backBtn}>← Back</a>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      {/* Create Team */}
      <div style={styles.card}>
        <h2>➕ Create Team</h2>
        <form onSubmit={handleCreateTeam} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
          <button style={styles.btn} type="submit">Create</button>
        </form>
      </div>

      {/* Teams List */}
      <div style={styles.card}>
        <h2>🏢 Teams ({teams.length})</h2>
        {teams.map(team => (
          <div key={team.id} style={styles.teamCard}>
            <div>
              <h3 style={{margin: '0 0 5px 0'}}>{team.name}</h3>
              <p style={{margin: 0, color: '#666', fontSize: '14px'}}>
                Lead: {team.lead_name} | Members: {team.member_count}
              </p>
            </div>
            <button
              style={styles.viewBtn}
              onClick={() => fetchMembers(team.id)}
            >
              View Members
            </button>
          </div>
        ))}
      </div>

      {/* Members */}
      {selectedTeam && (
        <div style={styles.card}>
          <h2>👤 Members</h2>
          {members.map(member => (
            <div key={member.id} style={styles.memberCard}>
              <span>{member.name} ({member.email})</span>
              <span style={{
                ...styles.badge,
                backgroundColor: member.role === 'teamlead' ? '#f39c12' : '#4CAF50'
              }}>
                {member.role}
              </span>
            </div>
          ))}

          <h3>Add Member (User ID)</h3>
          <form onSubmit={handleAddMember} style={styles.form}>
            <input
              style={styles.input}
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
            <button style={styles.btn} type="submit">Add</button>
          </form>
        </div>
      )}
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
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  },
  form: { display: 'flex', gap: '10px' },
  input: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px'
  },
  btn: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  teamCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    border: '1px solid #eee',
    borderRadius: '8px',
    marginBottom: '10px'
  },
  viewBtn: {
    padding: '8px 15px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  memberCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #eee'
  },
  badge: {
    color: 'white',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px'
  },
  message: {
    padding: '10px',
    backgroundColor: '#f0f9f0',
    borderRadius: '5px',
    marginBottom: '15px',
    fontWeight: 'bold'
  }
};

export default TeamManagement;