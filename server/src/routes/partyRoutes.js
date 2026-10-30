const express = require('express');
const router = express.Router();
const {
  getParties,
  getPartyById,
  createParty,
  updateParty,
  toggleArchiveParty,
} = require('../controllers/partyController');
const { protect, authorize, checkPermission } = require('../middleware/auth');

router.use(protect);

router.get('/', getParties);
router.get('/:id', getPartyById);
router.post('/', checkPermission('partyManagement'), createParty);
router.patch('/:id', checkPermission('partyManagement'), updateParty);
router.patch('/:id/archive', authorize('superadmin'), toggleArchiveParty);

module.exports = router;
