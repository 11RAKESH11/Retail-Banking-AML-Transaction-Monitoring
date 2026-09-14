const Customer = require('../models/Customer');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const AmlAlert = require('../models/AmlAlert');

// @desc    Get customer details by id or customerId
// @route   GET /api/customers/:id
// @access  Private (Owner CUSTOMER, or EMPLOYEE/ADMIN)
const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let customer = await Customer.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { customerId: id }],
    }).populate('userId', 'name email role');

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Role check: CUSTOMER can only view their own details
    if (req.user.role === 'CUSTOMER' && customer.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const accounts = await Account.find({ customerId: customer._id });
    const alerts = await AmlAlert.find({ customerId: customer._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        customer,
        accounts,
        alerts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get/Search all customers
// @route   GET /api/customers
// @access  Private (EMPLOYEE, ADMIN)
const getAllCustomers = async (req, res, next) => {
  try {
    const { search, riskLevel, page = 1, limit = 10 } = req.query;
    const query = {};

    if (riskLevel) {
      query.riskLevel = riskLevel;
    }

    let customers = await Customer.find(query)
      .populate({
        path: 'userId',
        select: 'name email role',
        match: search
          ? {
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
              ],
            }
          : undefined,
      })
      .sort({ createdAt: -1 });

    if (search) {
      customers = customers.filter(
        (c) => c.userId !== null || (c.customerId && c.customerId.includes(search))
      );
    }

    const total = customers.length;
    const paginated = customers.slice((page - 1) * limit, page * limit);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: paginated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomerById,
  getAllCustomers,
};
