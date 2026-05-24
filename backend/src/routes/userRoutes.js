const express = require('express');
const router = express.Router();
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');
const { getAllUsers, changeRole, getProfile } = require('../controllers/userController');

router.get('/profile', authMiddleware, getProfile);
router.get('/list', authMiddleware, requireAdmin, getAllUsers);
router.put('/:id/role', authMiddleware, requireAdmin, changeRole);

module.exports = router;