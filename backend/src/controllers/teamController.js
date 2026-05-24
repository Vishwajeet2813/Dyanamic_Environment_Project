const pool = require('../config/db');

// Team create karo
const createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const user = req.user;

    const newTeam = await pool.query(
      'INSERT INTO teams (name, lead_id) VALUES ($1, $2) RETURNING *',
      [name, user.id]
    );

    // Leader ko automatically member banao
    await pool.query(
      'INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)',
      [newTeam.rows[0].id, user.id]
    );

    res.status(201).json({
      message: '✅ Team created!',
      team: newTeam.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Sabhi teams list karo
const getTeams = async (req, res) => {
  try {
    const teams = await pool.query(`
      SELECT t.*, u.name as lead_name,
      COUNT(tm.user_id) as member_count
      FROM teams t
      LEFT JOIN users u ON t.lead_id = u.id
      LEFT JOIN team_members tm ON t.id = tm.team_id
      GROUP BY t.id, u.name
    `);

    res.json({ teams: teams.rows });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Team mein member add karo
const addMember = async (req, res) => {
  try {
    const { team_id, user_id } = req.body;

    // Check if already member
    const exists = await pool.query(
      'SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2',
      [team_id, user_id]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ 
        message: 'User already in team' 
      });
    }

    await pool.query(
      'INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)',
      [team_id, user_id]
    );

    res.json({ message: '✅ Member added!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Team members list karo
const getTeamMembers = async (req, res) => {
  try {
    const { id } = req.params;

    const members = await pool.query(`
      SELECT u.id, u.name, u.email, u.role
      FROM users u
      JOIN team_members tm ON u.id = tm.user_id
      WHERE tm.team_id = $1
    `, [id]);

    res.json({ members: members.rows });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Member remove karo
const removeMember = async (req, res) => {
  try {
    const { team_id, user_id } = req.body;

    await pool.query(
      'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2',
      [team_id, user_id]
    );

    res.json({ message: '✅ Member removed!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  createTeam, 
  getTeams, 
  addMember, 
  getTeamMembers,
  removeMember 
};