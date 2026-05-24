const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getAllUsers, changeRole, getProfile } = require('../controllers/userController');

// Profile route
router.get('/profile', authMiddleware, getProfile);

// Admin only routes
router.get('/list', authMiddleware, getAllUsers);
router.put('/:id/role', authMiddleware, changeRole);

module.exports = router;