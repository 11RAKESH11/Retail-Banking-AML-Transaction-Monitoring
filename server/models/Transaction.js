const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },

    type: {
      type: String,
      enum: ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT'],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },

    direction: {
      type: String,
      enum: ['CREDIT', 'DEBIT'],
      required: true,
    },

    counterpartyAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
    },

    location: {
      city: String,
      state: String,
      country: {
        type: String,
        default: 'India',
      },
    },

    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'],
      default: 'COMPLETED',
    },

    description: {
      type: String,
      trim: true,
    },

    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    isSuspicious: {
      type: Boolean,
      default: false,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ account: 1, timestamp: -1 });
transactionSchema.index({ customer: 1, timestamp: -1 });
transactionSchema.index({ isSuspicious: 1 });
transactionSchema.index({ riskScore: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);