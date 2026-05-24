const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT verify karo
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      message: 'No token provided' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ 
      message: 'Invalid token' 
    });
  }
};

// Sirf Admin access kar sake
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: '❌ Access denied! Admin only.' 
    });
  }
  next();
};

// Sirf TeamLead ya Admin access kar sake
const requireTeamLead = (req, res, next) => {
  if (req.user.role !== 'teamlead' && req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: '❌ Access denied! Team Lead or Admin only.' 
    });
  }
  next();
};

module.exports = { authMiddleware, requireAdmin, requireTeamLead };