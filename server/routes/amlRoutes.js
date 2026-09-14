const express = require('express');
const { getAmlAlerts, getAmlAlertById, reviewAmlAlert } = require('../controllers/amlController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authenticate);
router.use(authorize('EMPLOYEE', 'ADMIN'));

router.get('/alerts', getAmlAlerts);
router.get('/alerts/:id', getAmlAlertById);
router.put('/alerts/:id/review', reviewAmlAlert);

module.exports = router;
