const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const environmentRoutes = require('./routes/environmentRoutes');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/environment', environmentRoutes);

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