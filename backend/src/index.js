const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const db = require('./config/db');
const passport = require('./config/passport');
const authRoutes = require('./routes/authRoutes');
const environmentRoutes = require('./routes/environmentRoutes');
const userRoutes = require('./routes/userRoutes');
const oauthRoutes = require('./routes/oauthRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes);
app.use('/api/environment', environmentRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: '✅ Platform Backend Running!',
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});