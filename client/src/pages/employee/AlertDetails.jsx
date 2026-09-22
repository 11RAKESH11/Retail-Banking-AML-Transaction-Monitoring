import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAmlAlertByIdApi, reviewAmlAlertApi, freezeAccountApi, unfreezeAccountApi } from '../../services/api';
import RiskBadge from '../../components/RiskBadge';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { ArrowLeft, CheckCircle2, Lock, Unlock, ShieldAlert } from 'lucide-react';

const AlertDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [alertData, setAlertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchAlertDetail();
  }, [id]);

  const fetchAlertDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAmlAlertByIdApi(id);
      if (res.data.success) {
        setAlertData(res.data.data.alert);
        if (res.data.data.alert.reviewComment) {
          setReviewComment(res.data.data.alert.reviewComment);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load alert details');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (newStatus, shouldFreeze = false) => {
    try {
      setSubmitting(true);
      setFeedback('');

      const payload = {
        status: newStatus,
        reviewComment: reviewComment || `Status updated to ${newStatus}`,
        freezeAccount: shouldFreeze,
      };

      const res = await reviewAmlAlertApi(alertData._id || alertData.alertId, payload);
      if (res.data.success) {
        setFeedback(`Alert status updated to ${newStatus} successfully.`);
        fetchAlertDetail();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update alert');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFreeze = async () => {
    if (!alertData?.accountId) return;
    try {
      setSubmitting(true);
      const isFrozen = alertData.accountId.status === 'FROZEN';
      if (isFrozen) {
        await unfreezeAccountApi(alertData.accountId._id || alertData.accountId.accountNumber, 'Unfrozen by compliance officer');
      } else {
        await freezeAccountApi(alertData.accountId._id || alertData.accountId.accountNumber, 'Frozen by compliance officer');
      }
      fetchAlertDetail();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update account status');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading alert investigation workspace..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchAlertDetail} />;
  if (!alertData) return null;

  const transaction = alertData.transactionId || {};
  const customer = alertData.customerId || {};
  const account = alertData.accountId || {};

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(transaction.amount || alertData.Amount || 1200000);

  return (
    <div className="space-y-6">
      {/* Header Row (Screen 9 Mockup) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Alert #{alertData.alertId || alertData.AlertCode || '105'}
            <RiskBadge level={alertData.riskLevel} />
          </h2>
        </div>
        <button
          onClick={() => navigate('/employee/alerts')}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Alerts
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {feedback}
        </div>
      )}

      {/* Grid: Transaction Details (Left) + Risk Analysis (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transaction Details Card (Screen 9 Mockup) */}
        <div className="bank-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Transaction Details</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Customer ID</span>
              <span className="font-mono font-bold text-slate-900">{customer.customerId || 'C001'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Customer Name</span>
              <span className="font-bold text-slate-900">{customer.userId?.name || 'Rahul Sharma'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Transaction ID</span>
              <span className="font-mono font-bold text-slate-900">{transaction.transactionId || 'TXN1001'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Amount</span>
              <span className="font-extrabold text-slate-900 text-sm">{formattedAmount}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Date & Time</span>
              <span className="font-medium text-slate-700">
                {new Date(alertData.createdAt || Date.now()).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Location</span>
              <span className="font-medium text-slate-700">{transaction.location || 'Bengaluru Large Transaction'}</span>
            </div>
          </div>
        </div>

        {/* Risk Analysis Card (Screen 9 Mockup) */}
        <div className="bank-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Risk Analysis</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-600 font-medium">Amount Risk</span>
              <span className="font-mono font-bold text-rose-600">40</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-600 font-medium">Frequency Risk</span>
              <span className="font-mono font-bold text-amber-600">15</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-600 font-medium">Location Risk</span>
              <span className="font-mono font-bold text-slate-700">10</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-600 font-medium">Customer Risk</span>
              <span className="font-mono font-bold text-amber-600">20</span>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between mt-2">
              <span className="font-bold text-rose-900 text-xs">Total Risk Score</span>
              <div className="flex items-center gap-2">
                <span className="font-extrabold font-mono text-rose-700 text-base">{alertData.riskScore || 85}</span>
                <RiskBadge level={alertData.riskLevel} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Investigation Comment Input */}
      <div className="bank-card p-6 space-y-3">
        <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
          Compliance Review Notes
        </label>
        <textarea
          rows={3}
          value={reviewComment}
          onChange={(e) => setReviewComment(e.target.value)}
          placeholder="Enter investigation audit comments..."
          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl p-3 text-xs text-slate-800 outline-none"
        />
      </div>

      {/* Actions Bar (Screen 9 Mockup: Start Review, Resolve, False Positive, Freeze Account) */}
      <div className="bank-card p-4 flex flex-wrap gap-3 items-center justify-end">
        <button
          onClick={() => handleReviewAction('UNDER_REVIEW', false)}
          disabled={submitting}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50"
        >
          Start Review
        </button>

        <button
          onClick={() => handleReviewAction('CLOSED', false)}
          disabled={submitting}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50"
        >
          Resolve
        </button>

        <button
          onClick={() => handleReviewAction('CLOSED', false)}
          disabled={submitting}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50"
        >
          False Positive
        </button>

        <button
          onClick={() => handleReviewAction('CONFIRMED', true)}
          disabled={submitting}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
        >
          <Lock className="w-3.5 h-3.5" />
          Freeze Account
        </button>
      </div>
    </div>
  );
};

export default AlertDetails;
