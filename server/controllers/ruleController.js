const AmlRule = require('../models/AmlRule');
const { createAuditLog } = require('../utils/helpers');

// @desc    Get all AML rules
// @route   GET /api/aml/rules
// @access  Private (EMPLOYEE, ADMIN)
const getAllRules = async (req, res, next) => {
  try {
    const rules = await AmlRule.find().sort({ createdAt: 1 });
    res.json({
      success: true,
      data: rules,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update AML rule configuration (threshold, riskPoints, enabled, etc.)
// @route   PUT /api/aml/rules/:id
// @access  Private (ADMIN)
const updateRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, enabled, threshold, riskPoints, configuration } = req.body;

    const rule = await AmlRule.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { ruleCode: id }],
    });

    if (!rule) {
      return res.status(404).json({ success: false, message: 'AML Rule not found' });
    }

    if (name !== undefined) rule.name = name;
    if (description !== undefined) rule.description = description;
    if (enabled !== undefined) rule.enabled = enabled;
    if (threshold !== undefined) rule.threshold = threshold;
    if (riskPoints !== undefined) rule.riskPoints = riskPoints;
    if (configuration !== undefined) rule.configuration = configuration;

    await rule.save();

    await createAuditLog(req.user._id, 'AML_RULE_UPDATED', 'AmlRule', rule.ruleCode, {
      threshold: rule.threshold,
      riskPoints: rule.riskPoints,
      enabled: rule.enabled,
    });

    res.json({
      success: true,
      message: `Rule ${rule.ruleCode} updated successfully`,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle enable/disable state of an AML rule
// @route   PUT /api/aml/rules/:id/toggle
// @access  Private (ADMIN)
const toggleRule = async (req, res, next) => {
  try {
    const { id } = req.params;

    const rule = await AmlRule.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { ruleCode: id }],
    });

    if (!rule) {
      return res.status(404).json({ success: false, message: 'AML Rule not found' });
    }

    rule.enabled = !rule.enabled;
    await rule.save();

    const action = rule.enabled ? 'AML_RULE_ENABLED' : 'AML_RULE_DISABLED';
    await createAuditLog(req.user._id, action, 'AmlRule', rule.ruleCode, {
      enabled: rule.enabled,
    });

    res.json({
      success: true,
      message: `Rule ${rule.ruleCode} has been ${rule.enabled ? 'enabled' : 'disabled'}`,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRules,
  updateRule,
  toggleRule,
};
