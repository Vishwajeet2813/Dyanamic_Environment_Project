const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
  createEnvironment, 
  getEnvironments, 
  deleteEnvironment,
  getEnvironmentStatus
} = require('../controllers/environmentController');

// Sabhi routes protected hain
router.post('/create', authMiddleware, createEnvironment);
router.get('/list', authMiddleware, getEnvironments);
router.delete('/:id', authMiddleware, deleteEnvironment);
router.get('/:id/status', authMiddleware, getEnvironmentStatus);

module.exports = router;