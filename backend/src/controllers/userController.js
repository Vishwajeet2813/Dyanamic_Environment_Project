const pool = require('../config/db');

// Sabhi users list karo (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await pool.query(
      'SELECT id, name, email, role, created_at FROM users'
    );

    res.json({ users: users.rows });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Role change karo (Admin only)
const changeRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Valid roles check karo
    const validRoles = ['developer', 'teamlead', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Use: developer, teamlead, admin' 
      });
    }

    // Role update karo
    const updatedUser = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      [role, id]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `✅ Role updated to ${role}`,
      user: updatedUser.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Current user profile
const getProfile = async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json({ user: user.rows[0] });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllUsers, changeRole, getProfile };