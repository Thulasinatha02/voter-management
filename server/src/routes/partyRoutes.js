const express = require('express');
const router = express.Router();
const {
  getParties,
  getPartyById,
  createParty,
  updateParty,
  toggleArchiveParty,
} = require('../controllers/partyController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getParties);
router.get('/:id', getPartyById);
router.post('/', authorize('superadmin', 'ward_officer'), createParty);
router.patch('/:id', authorize('superadmin', 'ward_officer'), updateParty);
router.patch('/:id/archive', authorize('superadmin'), toggleArchiveParty);

module.exports = router;
