const express = require('express');
const router = express.Router();
const {
  login,
  getMe,
  createUser,
  listUsers,
  updateUser,
  deleteUser,
  toggleUserStatus,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('superadmin', 'auditor'), listUsers);
router.post('/users', protect, authorize('superadmin'), createUser);
router.patch('/users/:id', protect, authorize('superadmin'), updateUser);
router.delete('/users/:id', protect, authorize('superadmin'), deleteUser);
router.patch('/users/:id/toggle-status', protect, authorize('superadmin'), toggleUserStatus);

module.exports = router;
