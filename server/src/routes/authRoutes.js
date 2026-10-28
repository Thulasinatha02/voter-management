const express = require('express');
const router = express.Router();
const { login, getMe, createUser, listUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('superadmin', 'auditor'), listUsers);
router.post('/users', protect, authorize('superadmin'), createUser);

module.exports = router;
