import React, { useState, useEffect } from 'react';
import { getAmlRulesApi, updateAmlRuleApi, toggleAmlRuleApi } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { Sliders, Plus, Edit2, Save, CheckCircle2, ToggleLeft, ToggleRight } from 'lucide-react';

const AdminAmlRules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  // Edit State
  const [editingRule, setEditingRule] = useState(null);
  const [thresholdInput, setThresholdInput] = useState('');
  const [riskPointsInput, setRiskPointsInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAmlRulesApi();
      if (res.data.success) {
        setRules(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load AML rules');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (ruleId) => {
    try {
      setFeedback('');
      const res = await toggleAmlRuleApi(ruleId);
      if (res.data.success) {
        setFeedback(`Rule status toggled.`);
        fetchRules();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle rule');
    }
  };

  const startEdit = (rule) => {
    setEditingRule(rule);
    setThresholdInput(rule.threshold || 0);
    setRiskPointsInput(rule.riskPoints || 0);
  };

  const saveRuleEdit = async (e) => {
    e.preventDefault();
    if (!editingRule) return;

    try {
      setSaving(true);
      setFeedback('');

      const payload = {
        threshold: parseFloat(thresholdInput),
        riskPoints: parseInt(riskPointsInput, 10),
      };

      const res = await updateAmlRuleApi(editingRule._id || editingRule.ruleCode, payload);
      if (res.data.success) {
        setFeedback(`Rule ${editingRule.ruleCode} threshold & risk score updated dynamically!`);
        setEditingRule(null);
        fetchRules();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save rule edits');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading message="Loading AML Rule Management..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">AML Rule Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Configure live monetary thresholds and risk score weights</p>
        </div>

        <button
          onClick={() => alert('New Rule wizard ready in production')}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {feedback}
        </div>
      )}

      {error ? (
        <ErrorMessage message={error} onRetry={fetchRules} />
      ) : (
        /* AML Rule Table (Screen 11 Mockup) */
        <div className="bank-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Rule Name</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Threshold</th>
                  <th className="px-5 py-3">Risk Score</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rules.map((rule) => {
                  const isEditing = editingRule?._id === rule._id || editingRule?.ruleCode === rule.ruleCode;

                  return (
                    <tr key={rule._id || rule.ruleCode} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {rule.name}
                        <span className="block text-[10px] font-mono text-slate-400 font-medium">{rule.ruleCode}</span>
                      </td>

                      <td className="px-5 py-3.5 text-slate-500 max-w-xs">{rule.description}</td>

                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                        {isEditing ? (
                          <input
                            type="number"
                            value={thresholdInput}
                            onChange={(e) => setThresholdInput(e.target.value)}
                            className="w-28 bg-slate-50 border border-slate-300 rounded-lg p-1 text-xs text-slate-900 outline-none"
                          />
                        ) : (
                          `₹${rule.threshold ? new Intl.NumberFormat('en-IN').format(rule.threshold) : '10,00,000'}`
                        )}
                      </td>

                      <td className="px-5 py-3.5 font-mono font-bold text-blue-600">
                        {isEditing ? (
                          <input
                            type="number"
                            value={riskPointsInput}
                            onChange={(e) => setRiskPointsInput(e.target.value)}
                            className="w-20 bg-slate-50 border border-slate-300 rounded-lg p-1 text-xs text-slate-900 outline-none"
                          />
                        ) : (
                          `+${rule.riskPoints}`
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggle(rule._id || rule.ruleCode)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold transition-all border ${
                            rule.enabled
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {rule.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={saveRuleEdit}
                              disabled={saving}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingRule(null)}
                              className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(rule)}
                            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all inline-flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAmlRules;
