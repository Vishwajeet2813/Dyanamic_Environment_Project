const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// GitHub login start
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

// GitHub callback
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    // JWT token banao
    const token = jwt.sign(
      {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Frontend pe redirect karo token ke saath
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

module.exports = router;