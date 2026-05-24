const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
  createTeam, 
  getTeams, 
  addMember,
  getTeamMembers,
  removeMember
} = require('../controllers/teamController');

router.post('/create', authMiddleware, createTeam);
router.get('/list', authMiddleware, getTeams);
router.post('/addmember', authMiddleware, addMember);
router.get('/:id/members', authMiddleware, getTeamMembers);
router.delete('/removemember', authMiddleware, removeMember);

module.exports = router;