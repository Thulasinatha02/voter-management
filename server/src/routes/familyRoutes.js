const express = require('express');
const router = express.Router();
const {
  getFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  toggleArchiveFamily,
} = require('../controllers/familyController');
const { protect, verifyWardAccess } = require('../middleware/auth');

router.use(protect);

router.get('/', verifyWardAccess, getFamilies);
router.get('/:id', getFamilyById);
router.post('/', verifyWardAccess, createFamily);
router.patch('/:id', updateFamily);
router.patch('/:id/archive', toggleArchiveFamily);

module.exports = router;
