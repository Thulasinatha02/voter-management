const express = require('express');
const router = express.Router();
const {
  getMembers,
  getMemberById,
  checkDuplicateMember,
  createMember,
  updateMember,
  toggleArchiveMember,
  deleteMember,
} = require('../controllers/memberController');
const { protect, verifyWardAccess } = require('../middleware/auth');

router.use(protect);

router.get('/check-duplicate', checkDuplicateMember);
router.get('/', verifyWardAccess, getMembers);
router.get('/:id', getMemberById);
router.post('/', verifyWardAccess, createMember);
router.patch('/:id', updateMember);
router.patch('/:id/archive', toggleArchiveMember);
router.delete('/:id', deleteMember);

module.exports = router;
