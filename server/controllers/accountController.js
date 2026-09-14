const Account = require('../models/Account');
const Customer = require('../models/Customer');
const { createAuditLog } = require('../utils/helpers');

// @desc    Get account details by ID or accountNumber
// @route   GET /api/accounts/:id
// @access  Private
const getAccountById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const account = await Account.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { accountNumber: id }],
    }).populate({
      path: 'customerId',
      populate: { path: 'userId', select: 'name email' },
    });

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (
      req.user.role === 'CUSTOMER' &&
      account.customerId.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Freeze an account
// @route   PUT /api/accounts/:id/freeze
// @access  Private (EMPLOYEE, ADMIN)
const freezeAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Suspicious activity flagged by AML' } = req.body;

    const account = await Account.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { accountNumber: id }],
    });

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    account.status = 'FROZEN';
    await account.save();

    await createAuditLog(req.user._id, 'ACCOUNT_FROZEN', 'Account', account.accountNumber, {
      reason,
      frozenBy: req.user.name,
    });

    res.json({
      success: true,
      message: `Account ${account.accountNumber} has been frozen`,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfreeze an account
// @route   PUT /api/accounts/:id/unfreeze
// @access  Private (EMPLOYEE, ADMIN)
const unfreezeAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Cleared following investigation' } = req.body;

    const account = await Account.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { accountNumber: id }],
    });

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    account.status = 'ACTIVE';
    await account.save();

    await createAuditLog(req.user._id, 'ACCOUNT_UNFROZEN', 'Account', account.accountNumber, {
      reason,
      unfrozenBy: req.user.name,
    });

    res.json({
      success: true,
      message: `Account ${account.accountNumber} has been unfrozen`,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAccountById,
  freezeAccount,
  unfreezeAccount,
};
