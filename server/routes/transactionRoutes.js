const express = require('express');
const { check } = require('express-validator');
const {
  createTransaction,
  getAccountTransactions,
  getAllTransactions,
  getTransactionById,
} = require('../controllers/transactionController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  authorize('CUSTOMER'),
  [
    check('accountId', 'Account ID is required').not().isEmpty(),
    check('type', 'Valid transaction type required').isIn([
      'DEPOSIT',
      'WITHDRAWAL',
      'TRANSFER',
      'PAYMENT',
    ]),
    check('amount', 'Amount must be a positive number').isFloat({ gt: 0 }),
    check('location', 'Location is required').not().isEmpty(),
    validate,
  ],
  createTransaction
);

router.get('/', authorize('EMPLOYEE', 'ADMIN'), getAllTransactions);
router.get('/account/:accountId', getAccountTransactions);
router.get('/:id', getTransactionById);

module.exports = router;
