const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Customer = require('../models/Customer');
const { processNewTransaction } = require('../services/transactionService');

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private (CUSTOMER)
const createTransaction = async (req, res, next) => {
  try {
    const { accountId, type, amount, location, recipientAccount, description } = req.body;

    const result = await processNewTransaction({
      userId: req.user._id,
      accountId,
      type,
      amount: Number(amount),
      location,
      recipientAccount,
      description,
    });

    let customerMessage = 'Transaction processed successfully';
    if (result.transaction.status === 'FLAGGED') {
      customerMessage = 'Transaction processed and selected for additional review.';
    }

    res.status(201).json({
      success: true,
      message: customerMessage,
      data: {
        transactionId: result.transaction.transactionId,
        amount: result.transaction.amount,
        type: result.transaction.type,
        status: result.transaction.status,
        timestamp: result.transaction.timestamp,
        riskScore: req.user.role !== 'CUSTOMER' ? result.amlResult.riskScore : undefined,
        riskLevel: req.user.role !== 'CUSTOMER' ? result.amlResult.riskLevel : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transactions by accountId
// @route   GET /api/transactions/account/:accountId
// @access  Private
const getAccountTransactions = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const account = await Account.findOne({
      $or: [{ _id: accountId.match(/^[0-9a-fA-F]{24}$/) ? accountId : null }, { accountNumber: accountId }],
    });

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (req.user.role === 'CUSTOMER') {
      const customer = await Customer.findOne({ userId: req.user._id });
      if (!customer || account.customerId.toString() !== customer._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const total = await Transaction.countDocuments({ accountId: account._id });
    const transactions = await Transaction.find({ accountId: account._id })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions with search, filter, pagination
// @route   GET /api/transactions
// @access  Private (EMPLOYEE, ADMIN)
const getAllTransactions = async (req, res, next) => {
  try {
    const {
      search,
      type,
      riskLevel,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (type) query.type = type;
    if (riskLevel) query.riskLevel = riskLevel;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { recipientAccount: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate({
        path: 'customerId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('accountId', 'accountNumber balance status')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { transactionId: id }],
    })
      .populate({
        path: 'customerId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('accountId', 'accountNumber balance status');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (req.user.role === 'CUSTOMER') {
      const customer = await Customer.findOne({ userId: req.user._id });
      if (!customer || transaction.customerId._id.toString() !== customer._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getAccountTransactions,
  getAllTransactions,
  getTransactionById,
};
