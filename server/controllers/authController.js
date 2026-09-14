const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Account = require('../models/Account');
const { generateToken } = require('../utils/jwt');
const { generateId, createAuditLog } = require('../utils/helpers');

// @desc    Register a new customer
// @route   POST /api/auth/register
// @access  Public
const registerCustomer = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, accountType = 'SAVINGS' } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 1. Create User
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'CUSTOMER',
    });

    // 2. Create Customer
    const customerId = generateId('C');
    const customer = await Customer.create({
      customerId,
      userId: user._id,
      phone,
      address,
      riskLevel: 'LOW',
    });

    // 3. Create Account
    const accountNumber = generateId('ACC');
    const account = await Account.create({
      accountNumber,
      customerId: customer._id,
      accountType,
      balance: 10000.0, // Default welcome bonus for prototype testing
      status: 'ACTIVE',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        customerId: customer.customerId,
        accountId: account.accountNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id, user.role);

    let customerDetails = null;
    if (user.role === 'CUSTOMER') {
      customerDetails = await Customer.findOne({ userId: user._id });
    }

    await createAuditLog(user._id, 'LOGIN', 'User', user._id.toString(), {
      role: user.role,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        customerId: customerDetails ? customerDetails.customerId : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerCustomer,
  loginUser,
};
