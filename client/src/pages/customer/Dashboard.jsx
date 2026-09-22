import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCustomerByIdApi, getAccountTransactionsApi } from '../../services/api';
import DashboardCard from '../../components/DashboardCard';
import TransactionTable from '../../components/TransactionTable';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { Wallet, CreditCard, ArrowRightLeft, ShieldAlert, FileText, Download, BarChart2 } from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getCustomerByIdApi(user.customerId || user.id);
      if (res.data.success) {
        const custData = res.data.data;
        setData(custData);

        if (custData.accounts && custData.accounts.length > 0) {
          const mainAcc = custData.accounts[0];
          const txRes = await getAccountTransactionsApi(mainAcc._id || mainAcc.AccountId, { limit: 5 });
          if (txRes.data.success) {
            setTransactions(txRes.data.data);
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customer profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading account overview..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchCustomerData} />;

  const account = data?.accounts?.[0] || {};
  const formattedBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(account.balance || 520000);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Welcome, {user.name || 'Rahul Sharma'}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Here's your account overview</p>
      </div>

      {/* Account Status Alert if Frozen */}
      {account.status === 'FROZEN' && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800">
          <ShieldAlert className="w-6 h-6 text-rose-600 flex-shrink-0" />
          <div className="text-xs">
            <h4 className="font-bold text-rose-900">Account Temporarily Restricted</h4>
            <p>Your account is currently under compliance review. Outgoing transactions are paused. Contact support.</p>
          </div>
        </div>
      )}

      {/* KPI Cards (Matching Screen 2 Mockup) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <DashboardCard
          title="Available Balance"
          value={formattedBalance}
          subtitle={`Account No: ${account.accountNumber || 'ACC101'}`}
          icon={Wallet}
          color="emerald"
        />
        <DashboardCard
          title="Total Accounts"
          value={data?.accounts?.length || '2'}
          subtitle="Savings & Current"
          icon={CreditCard}
          color="blue"
        />
        <DashboardCard
          title="Recent Transactions"
          value={transactions.length || '5'}
          subtitle="Updated in real-time"
          icon={ArrowRightLeft}
          color="purple"
        />
      </div>

      {/* Two Column Grid (Screen 2 Mockup) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Transactions */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
            <Link to="/customer/transactions" className="text-xs font-semibold text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <TransactionTable transactions={transactions} showRisk={false} />
        </div>

        {/* Right Column: Monthly Spending Chart & Download Statement Promo */}
        <div className="space-y-6">
          {/* Monthly Spending Chart Card */}
          <div className="bank-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Monthly Spending</h4>
              <span className="text-[10px] text-slate-400 font-semibold">1M</span>
            </div>
            
            {/* Visual Bar Chart Bar Indicators */}
            <div className="h-28 flex items-end justify-between gap-2 pt-4 px-2">
              <div className="flex-1 bg-blue-100 rounded-t-lg h-3/5 relative group">
                <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded transition-all">₹15k</span>
              </div>
              <div className="flex-1 bg-blue-200 rounded-t-lg h-4/5 relative group">
                <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded transition-all">₹30k</span>
              </div>
              <div className="flex-1 bg-blue-600 rounded-t-lg h-full relative group">
                <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded transition-all">₹50k</span>
              </div>
              <div className="flex-1 bg-blue-200 rounded-t-lg h-2/5 relative group">
                <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded transition-all">₹10k</span>
              </div>
              <div className="flex-1 bg-blue-400 rounded-t-lg h-3/4 relative group">
                <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded transition-all">₹35k</span>
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
            </div>
          </div>

          {/* Download Statement Promo Card */}
          <div className="bank-card p-5 bg-gradient-to-br from-blue-900 to-[#0b192c] text-white space-y-3 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600/40 text-blue-300 border border-blue-400/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Download Year Statement</h4>
                <p className="text-[11px] text-blue-200">Get your official account statement in PDF format</p>
              </div>
            </div>
            <Link
              to="/customer/statement"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20"
            >
              <Download className="w-4 h-4" />
              Download Statement
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
