import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCustomerByIdApi, getAccountTransactionsApi, createTransactionApi } from '../../services/api';
import TransactionTable from '../../components/TransactionTable';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { Search, Filter, PlusCircle, ArrowRightLeft, ShieldCheck, AlertCircle, CheckCircle2, X } from 'lucide-react';

const CustomerTransactions = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Make Transaction Form State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    transactionType: 'TRANSFER',
    amount: '',
    recipientAccountNumber: '',
    description: '',
    location: 'Bengaluru Branch',
  });
  const [txSubmitting, setTxSubmitting] = useState(false);
  const [txSuccess, setTxSuccess] = useState(null);
  const [txError, setTxError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getCustomerByIdApi(user.customerId || user.id);
      if (res.data.success) {
        const custData = res.data.data;
        setData(custData);
        if (custData.accounts && custData.accounts.length > 0) {
          const mainAcc = custData.accounts[0];
          const txRes = await getAccountTransactionsApi(mainAcc._id || mainAcc.AccountId, { limit: 50 });
          if (txRes.data.success) {
            setTransactions(txRes.data.data);
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    setTxSubmitting(true);
    setTxError('');
    setTxSuccess(null);

    const mainAcc = data?.accounts?.[0];
    if (!mainAcc) {
      setTxError('No active account found for transaction');
      setTxSubmitting(false);
      return;
    }

    try {
      const res = await createTransactionApi({
        accountId: mainAcc._id || mainAcc.AccountId,
        transactionType: formData.transactionType,
        amount: parseFloat(formData.amount),
        recipientAccountNumber: formData.transactionType === 'TRANSFER' ? formData.recipientAccountNumber : undefined,
        description: formData.description || `${formData.transactionType} transaction`,
        location: formData.location,
      });

      if (res.data.success) {
        setTxSuccess(res.data.data);
        fetchTransactions();
        setTimeout(() => {
          setShowModal(false);
          setTxSuccess(null);
        }, 2000);
      }
    } catch (err) {
      setTxError(err.response?.data?.message || 'Transaction failed. AML Surveillance Flag.');
    } finally {
      setTxSubmitting(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) return <Loading message="Loading transaction history..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchTransactions} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Transaction History</h2>
          <p className="text-xs text-slate-500 mt-0.5">View detailed transaction logs and perform transfers</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all self-start"
        >
          <PlusCircle className="w-4 h-4" />
          Make a Transaction
        </button>
      </div>

      {/* Filter Row (Screen 4 Mockup) */}
      <div className="bank-card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Transaction ID or Location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-blue-600"
          >
            <option value="ALL">All Types</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="TRANSFER">Transfer</option>
            <option value="WITHDRAWAL">Withdrawal</option>
          </select>

          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs">
            Search
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <TransactionTable transactions={filteredTransactions} showRisk={false} />

      {/* Make Transaction Modal (Screen 5 Mockup) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Make a Transaction</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Transaction Form (Left 2 cols) */}
              <form onSubmit={handleCreateTransaction} className="md:col-span-2 space-y-4">
                {txError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{txError}</span>
                  </div>
                )}

                {txSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Transaction Processed! Code: {txSuccess.transactionCode}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Type</label>
                  <select
                    value={formData.transactionType}
                    onChange={(e) => setFormData({ ...formData, transactionType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 text-slate-800 font-semibold outline-none focus:border-blue-600"
                  >
                    <option value="TRANSFER">Bank Transfer</option>
                    <option value="DEPOSIT">Cash Deposit</option>
                    <option value="WITHDRAWAL">Cash Withdrawal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 text-slate-800 outline-none focus:border-blue-600"
                  />
                </div>

                {formData.transactionType === 'TRANSFER' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Receiver Account Number</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter account number (e.g. ACC102)"
                      value={formData.recipientAccountNumber}
                      onChange={(e) => setFormData({ ...formData, recipientAccountNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 text-slate-800 outline-none focus:border-blue-600 font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter remarks"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 text-slate-800 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 text-slate-800 outline-none focus:border-blue-600"
                  >
                    <option value="Bengaluru Branch">Bengaluru Branch</option>
                    <option value="Mumbai Branch">Mumbai Branch</option>
                    <option value="Delhi Online">Delhi Online</option>
                    <option value="OFFSHORE_CAYMAN">Offshore (High Risk)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={txSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 mt-2"
                >
                  {txSubmitting ? 'Processing Transaction...' : 'Proceed'}
                </button>
              </form>

              {/* Transaction Limits Sidebar Card (Screen 5 Mockup) */}
              <div className="bank-card p-4 bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-blue-600 mb-3">
                    <ShieldCheck className="w-5 h-5" />
                    <h4 className="text-xs font-bold text-slate-900">Transaction Limits</h4>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Daily Limit</p>
                      <p className="font-extrabold text-slate-900 mt-0.5">₹10,00,000</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Per Transaction Limit</p>
                      <p className="font-extrabold text-slate-900 mt-0.5">₹5,00,000</p>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-blue-100/60 border border-blue-200 rounded-xl text-[10px] text-blue-800 font-medium">
                  Protected by Automated AML Risk Engine Surveillance.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerTransactions;
