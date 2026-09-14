const express = require('express');
const { getCustomerById, getAllCustomers } = require('../controllers/customerController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('EMPLOYEE', 'ADMIN'), getAllCustomers);
router.get('/:id', getCustomerById);

module.exports = router;
