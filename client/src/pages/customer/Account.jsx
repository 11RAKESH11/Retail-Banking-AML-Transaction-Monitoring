import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCustomerByIdApi } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { CreditCard, Building, ShieldCheck, CheckCircle2, Copy } from 'lucide-react';

const CustomerAccount = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAccountDetails();
  }, []);

  const fetchAccountDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getCustomerByIdApi(user.customerId || user.id);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load account details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading account details..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchAccountDetails} />;

  const account = data?.accounts?.[0] || {};
  const formattedBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(account.balance || 520000);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account Details</h2>
        <p className="text-xs text-slate-500 mt-0.5">Manage your primary bank account and linked services</p>
      </div>

      {/* Main Account Details Card (Matching Screen 3 Mockup) */}
      <div className="bank-card p-6 space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Savings Account
                <span className="font-mono text-xs font-semibold text-slate-500">
                  {account.accountNumber ? `XXXX${account.accountNumber.slice(-4)}` : 'XXXX1234'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Primary Salary Account</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Active
          </span>
        </div>

        {/* 2x3 Grid Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Account Type</p>
            <p className="text-sm font-bold text-slate-900">{account.accountType || 'Savings Account'}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Balance</p>
            <p className="text-lg font-extrabold text-emerald-600">{formattedBalance}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">IFSC Code</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono font-bold text-slate-900">SBIN0001234</p>
              <button
                onClick={() => handleCopy('SBIN0001234')}
                className="text-slate-400 hover:text-blue-600 transition-colors"
                title="Copy IFSC Code"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {copied && <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Branch</p>
            <p className="text-sm font-bold text-slate-900">Bengaluru Main Branch</p>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Created On</p>
            <p className="text-sm font-medium text-slate-700">12 Jan 2023</p>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AML Compliance Status</p>
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Compliant
            </p>
          </div>
        </div>
      </div>

      {/* Linked Accounts List Section */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">Linked Accounts</h3>
        <div className="bank-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Current Account</h4>
              <p className="text-[11px] font-mono text-slate-400">XXXX5678</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-900">₹1,80,000</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAccount;
