const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');
const { getWardReport, exportWardCsv, getAuditLogs } = require('../controllers/reportController');
const { protect, verifyWardAccess, checkPermission } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard/summary', verifyWardAccess, checkPermission('dashboard'), getDashboardSummary);
router.get('/reports/ward/:id', checkPermission('wardReports'), getWardReport);
router.get('/reports/ward/:id/export-csv', checkPermission('wardReports'), exportWardCsv);
router.get('/reports/audit-logs', checkPermission('auditLogs'), getAuditLogs);

module.exports = router;
