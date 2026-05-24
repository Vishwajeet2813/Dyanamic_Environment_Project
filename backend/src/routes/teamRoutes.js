const express = require('express');
const router = express.Router();
const { authMiddleware, requireTeamLead } = require('../middleware/authMiddleware');
const { 
  createTeam, 
  getTeams, 
  addMember,
  getTeamMembers,
  removeMember
} = require('../controllers/teamController');

router.get('/list', authMiddleware, getTeams);
router.get('/:id/members', authMiddleware, getTeamMembers);
router.post('/create', authMiddleware, requireTeamLead, createTeam);
router.post('/addmember', authMiddleware, requireTeamLead, addMember);
router.delete('/removemember', authMiddleware, requireTeamLead, removeMember);

module.exports = router;