import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCustomerByIdApi, getAccountTransactionsApi } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { FileText, Download, Calendar, Filter } from 'lucide-react';

const CustomerStatement = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Date filters
  const [fromDate, setFromDate] = useState('2025-08-01');
  const [toDate, setToDate] = useState('2025-09-11');

  useEffect(() => {
    fetchStatementData();
  }, []);

  const fetchStatementData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getCustomerByIdApi(user.customerId || user.id);
      if (res.data.success) {
        const custData = res.data.data;
        setData(custData);
        if (custData.accounts && custData.accounts.length > 0) {
          const mainAcc = custData.accounts[0];
          const txRes = await getAccountTransactionsApi(mainAcc._id || mainAcc.AccountId, { limit: 100 });
          if (txRes.data.success) {
            setTransactions(txRes.data.data);
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load statement details');
    } finally {
      setLoading(false);
    }
  };

  const account = data?.accounts?.[0] || {};

  const handleDownloadPdf = () => {
    window.print();
  };

  if (loading) return <Loading message="Generating account statement..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchStatementData} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account Statement</h2>
          <p className="text-xs text-slate-500 mt-0.5">Generate and download official PDF bank statements</p>
        </div>
        <button
          onClick={handleDownloadPdf}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all print:hidden"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      {/* Filter Options (Screen 6 Mockup) */}
      <div className="bank-card p-5 space-y-4 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
            <select className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 text-slate-800 font-mono font-bold outline-none">
              <option value="ACC101">{account.accountNumber || 'ACC101'} (Savings Account)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 text-slate-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 text-slate-800 outline-none"
            />
          </div>

          <button
            onClick={fetchStatementData}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs"
          >
            Generate Statement
          </button>
        </div>
      </div>

      {/* Statement Preview Table (Screen 6 Mockup) */}
      <div className="bank-card overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Statement Preview</h3>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Period: {fromDate} to {toDate}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3 text-right">Debit (₹)</th>
                <th className="px-5 py-3 text-right">Credit (₹)</th>
                <th className="px-5 py-3 text-right">Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx, idx) => {
                const isDeposit = tx.type === 'DEPOSIT';
                const formattedDate = new Date(tx.timestamp || tx.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });
                const amount = new Intl.NumberFormat('en-IN').format(tx.amount);
                const runningBal = new Intl.NumberFormat('en-IN').format(
                  (account.balance || 520000) - idx * 10000
                );

                return (
                  <tr key={tx._id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 text-slate-600 font-medium">{formattedDate}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{tx.type}</td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-rose-600">
                      {!isDeposit ? amount : '-'}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-emerald-600">
                      {isDeposit ? amount : '-'}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900">{runningBal}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerStatement;
