const express = require('express');
const { getAllRules, updateRule, toggleRule } = require('../controllers/ruleController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('EMPLOYEE', 'ADMIN'), getAllRules);
router.put('/:id', authorize('ADMIN'), updateRule);
router.put('/:id/toggle', authorize('ADMIN'), toggleRule);

module.exports = router;
