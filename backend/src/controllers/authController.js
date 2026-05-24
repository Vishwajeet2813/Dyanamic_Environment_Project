const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1', 
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ 
        message: 'User already exists' 
      });
    }

    // Password encrypt karo
    const hashedPassword = await bcrypt.hash(password, 10);

    // User save karo
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, 'developer']
    );

    // JWT token banao
    const token = jwt.sign(
      { 
        id: newUser.rows[0].id, 
        email: newUser.rows[0].email,
        role: newUser.rows[0].role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '✅ User registered successfully!',
      token,
      user: {
        id: newUser.rows[0].id,
        name: newUser.rows[0].name,
        email: newUser.rows[0].email,
        role: newUser.rows[0].role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // User check karo
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1', 
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ 
        message: 'User not found' 
      });
    }

    // Password verify karo
    const isMatch = await bcrypt.compare(
      password, 
      user.rows[0].password
    );

    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Wrong password' 
      });
    }

    // JWT token banao
    const token = jwt.sign(
      { 
        id: user.rows[0].id,
        email: user.rows[0].email,
        role: user.rows[0].role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '✅ Login successful!',
      token,
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        role: user.rows[0].role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login };