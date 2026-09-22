import React from 'react';
import RiskBadge from './RiskBadge';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, CreditCard } from 'lucide-react';

const TransactionTable = ({ transactions = [], showRisk = false }) => {
  if (!transactions.length) {
    return (
      <div className="p-8 text-center bank-card border-dashed">
        <p className="text-slate-400 text-xs">No transaction records found.</p>
      </div>
    );
  }

  const getTypeBadge = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return { icon: ArrowDownLeft, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'WITHDRAWAL':
        return { icon: ArrowUpRight, color: 'text-rose-700 bg-rose-50 border-rose-200' };
      case 'TRANSFER':
        return { icon: RefreshCw, color: 'text-blue-700 bg-blue-50 border-blue-200' };
      default:
        return { icon: CreditCard, color: 'text-purple-700 bg-purple-50 border-purple-200' };
    }
  };

  return (
    <div className="bank-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200/80">
            <tr>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Transaction ID</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Location</th>
              {showRisk && <th className="px-5 py-3">Risk Rating</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const { icon: Icon, color } = getTypeBadge(tx.type);
              const formattedDate = new Date(tx.timestamp || tx.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });
              const formattedAmount = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(tx.amount);

              const isPositive = tx.type === 'DEPOSIT';

              return (
                <tr key={tx._id || tx.transactionId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 text-slate-500 font-medium">{formattedDate}</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-800">{tx.transactionId || tx.TransactionCode}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border ${color}`}>
                      <Icon className="w-3 h-3" />
                      {tx.type}
                    </span>
                  </td>
                  <td className={`px-5 py-3.5 font-bold text-sm ${isPositive ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {isPositive ? `+ ${formattedAmount}` : `- ${formattedAmount}`}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        tx.status === 'COMPLETED' || tx.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : tx.status === 'FLAGGED'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {tx.status === 'COMPLETED' ? 'Success' : tx.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{tx.location || 'Bengaluru'}</td>
                  {showRisk && (
                    <td className="px-5 py-3.5">
                      <RiskBadge level={tx.riskLevel} score={tx.riskScore} />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
