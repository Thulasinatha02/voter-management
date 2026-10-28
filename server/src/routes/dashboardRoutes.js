const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');
const { getWardReport, exportWardCsv, getAuditLogs } = require('../controllers/reportController');
const { protect, verifyWardAccess, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard/summary', verifyWardAccess, getDashboardSummary);
router.get('/reports/ward/:id', getWardReport);
router.get('/reports/ward/:id/export-csv', exportWardCsv);
router.get('/reports/audit-logs', authorize('superadmin', 'auditor'), getAuditLogs);

module.exports = router;
