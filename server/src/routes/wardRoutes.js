const express = require('express');
const router = express.Router();
const {
  getWards,
  getWardById,
  createWard,
  updateWard,
  toggleArchiveWard,
} = require('../controllers/wardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getWards);
router.get('/:id', getWardById);
router.post('/', authorize('superadmin', 'ward_officer'), createWard);
router.patch('/:id', authorize('superadmin', 'ward_officer'), updateWard);
router.patch('/:id/archive', authorize('superadmin'), toggleArchiveWard);

module.exports = router;
