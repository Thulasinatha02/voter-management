const express = require('express');
const router = express.Router();
const {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  toggleArchiveMember,
} = require('../controllers/memberController');
const { protect, verifyWardAccess } = require('../middleware/auth');

router.use(protect);

router.get('/', verifyWardAccess, getMembers);
router.get('/:id', getMemberById);
router.post('/', verifyWardAccess, createMember);
router.patch('/:id', updateMember);
router.patch('/:id/archive', toggleArchiveMember);

module.exports = router;
