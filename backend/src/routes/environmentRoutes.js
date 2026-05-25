const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { 
  createEnvironment, 
  getEnvironments, 
  deleteEnvironment,
  getEnvironmentStatus,
  getEnvironmentLogs,
  deployApp
} = require('../controllers/environmentController');

router.post('/create', authMiddleware, createEnvironment);
router.get('/list', authMiddleware, getEnvironments);
router.delete('/:id', authMiddleware, deleteEnvironment);
router.get('/:id/status', authMiddleware, getEnvironmentStatus);
router.get('/:id/logs', authMiddleware, getEnvironmentLogs);
router.post('/:id/deploy', authMiddleware, deployApp);

module.exports = router;