const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const pool = require('./db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/api/auth/github/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE github_id = $1',
        [profile.id]
      );

      if (existingUser.rows.length > 0) {
        // User exists — return karo
        return done(null, existingUser.rows[0]);
      }

      // Naya user banao
      const newUser = await pool.query(
        'INSERT INTO users (name, email, github_id, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [
          profile.displayName || profile.username,
          profile.emails?.[0]?.value || `${profile.username}@github.com`,
          profile.id,
          'developer'
        ]
      );

      return done(null, newUser.rows[0]);

    } catch (error) {
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  done(null, user.rows[0]);
});

module.exports = passport;