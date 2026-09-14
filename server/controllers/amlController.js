const AmlAlert = require('../models/AmlAlert');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Customer = require('../models/Customer');
const { createAuditLog } = require('../utils/helpers');

// @desc    Get all AML alerts with filter and pagination
// @route   GET /api/aml/alerts
// @access  Private (EMPLOYEE, ADMIN)
const getAmlAlerts = async (req, res, next) => {
  try {
    const { status, riskLevel, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (riskLevel) query.riskLevel = riskLevel;

    const total = await AmlAlert.countDocuments(query);
    const alerts = await AmlAlert.find(query)
      .populate({
        path: 'customerId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('transactionId')
      .populate('accountId', 'accountNumber status balance')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AML alert details by ID
// @route   GET /api/aml/alerts/:id
// @access  Private (EMPLOYEE, ADMIN)
const getAmlAlertById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const alert = await AmlAlert.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { alertId: id }],
    })
      .populate({
        path: 'customerId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('transactionId')
      .populate('accountId', 'accountNumber status balance')
      .populate('reviewedBy', 'name email');

    if (!alert) {
      return res.status(404).json({ success: false, message: 'AML Alert not found' });
    }

    // Fetch customer's recent transactions for investigation context
    const recentTransactions = await Transaction.find({ accountId: alert.accountId._id })
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        alert,
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Review/update AML alert status (UNDER_REVIEW, CLEARED, CONFIRMED)
// @route   PUT /api/aml/alerts/:id/review
// @access  Private (EMPLOYEE, ADMIN)
const reviewAmlAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reviewComment, freezeAccount = false } = req.body;

    if (!['UNDER_REVIEW', 'CLEARED', 'CONFIRMED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid alert status. Must be UNDER_REVIEW, CLEARED, or CONFIRMED',
      });
    }

    const alert = await AmlAlert.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { alertId: id }],
    });

    if (!alert) {
      return res.status(404).json({ success: false, message: 'AML Alert not found' });
    }

    alert.status = status;
    alert.reviewComment = reviewComment || alert.reviewComment;
    alert.reviewedBy = req.user._id;
    alert.reviewedAt = new Date();

    await alert.save();

    let accountFrozen = false;
    if (freezeAccount && alert.accountId) {
      const account = await Account.findById(alert.accountId);
      if (account) {
        account.status = 'FROZEN';
        await account.save();
        accountFrozen = true;

        await createAuditLog(req.user._id, 'ACCOUNT_FROZEN', 'Account', account.accountNumber, {
          triggeredByAlert: alert.alertId,
          reason: reviewComment || 'Account frozen during alert confirmation',
        });
      }
    }

    await createAuditLog(req.user._id, 'ALERT_REVIEWED', 'AmlAlert', alert.alertId, {
      status,
      reviewComment,
      accountFrozen,
    });

    res.json({
      success: true,
      message: `Alert ${alert.alertId} status updated to ${status}`,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAmlAlerts,
  getAmlAlertById,
  reviewAmlAlert,
};
