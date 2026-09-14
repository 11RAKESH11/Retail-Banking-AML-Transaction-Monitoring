const express = require('express');
const { getAccountById, freezeAccount, unfreezeAccount } = require('../controllers/accountController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/:id', getAccountById);
router.put('/:id/freeze', authorize('EMPLOYEE', 'ADMIN'), freezeAccount);
router.put('/:id/unfreeze', authorize('EMPLOYEE', 'ADMIN'), unfreezeAccount);

module.exports = router;
