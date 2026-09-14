const express = require('express');
const {
  getDashboardSummary,
  getTransactionVolume,
  getRiskDistribution,
  getAuditLogs,
} = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/summary', authorize('EMPLOYEE', 'ADMIN'), getDashboardSummary);
router.get('/transaction-volume', authorize('EMPLOYEE', 'ADMIN'), getTransactionVolume);
router.get('/risk-distribution', authorize('EMPLOYEE', 'ADMIN'), getRiskDistribution);
router.get('/audit-logs', authorize('ADMIN'), getAuditLogs);

module.exports = router;
