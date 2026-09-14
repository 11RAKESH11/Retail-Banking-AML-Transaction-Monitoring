const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const AmlAlert = require('../models/AmlAlert');
const AuditLog = require('../models/AuditLog');

// @desc    Get executive dashboard metrics summary
// @route   GET /api/dashboard/summary
// @access  Private (EMPLOYEE, ADMIN)
const getDashboardSummary = async (req, res, next) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const suspiciousTransactions = await Transaction.countDocuments({
      $or: [{ status: 'FLAGGED' }, { riskLevel: { $in: ['HIGH', 'CRITICAL'] } }],
    });
    const highRiskCustomers = await Customer.countDocuments({ riskLevel: 'HIGH' });
    const frozenAccounts = await Account.countDocuments({ status: 'FROZEN' });

    // Daily volume
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const dailyTransactions = await Transaction.aggregate([
      { $match: { timestamp: { $gte: startOfDay } } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalTransactions,
        suspiciousTransactions,
        highRiskCustomers,
        frozenAccounts,
        dailyVolumeAmount: dailyTransactions[0] ? dailyTransactions[0].totalAmount : 0,
        dailyVolumeCount: dailyTransactions[0] ? dailyTransactions[0].count : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction volume over time (for charts)
// @route   GET /api/dashboard/transaction-volume
// @access  Private (EMPLOYEE, ADMIN)
const getTransactionVolume = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const volumeData = await Transaction.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: volumeData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get risk score distribution
// @route   GET /api/dashboard/risk-distribution
// @access  Private (EMPLOYEE, ADMIN)
const getRiskDistribution = async (req, res, next) => {
  try {
    const distribution = await Transaction.aggregate([
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 },
        },
      },
    ]);

    const formatted = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    distribution.forEach((item) => {
      if (item._id) formatted[item._id] = item.count;
    });

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit logs
// @route   GET /api/dashboard/audit-logs
// @access  Private (ADMIN)
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, page = 1, limit = 20 } = req.query;
    const query = {};

    if (action) query.action = action;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('actorId', 'name email role')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getTransactionVolume,
  getRiskDistribution,
  getAuditLogs,
};
