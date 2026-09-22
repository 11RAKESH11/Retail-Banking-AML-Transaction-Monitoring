import React from 'react';
import { Link } from 'react-router-dom';
import RiskBadge from './RiskBadge';
import { ExternalLink } from 'lucide-react';

const AlertTable = ({ alerts = [] }) => {
  if (!alerts.length) {
    return (
      <div className="p-8 text-center bank-card border-dashed">
        <p className="text-slate-400 text-xs">No active AML alerts found in queue.</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'UNDER_REVIEW':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CLEARED':
      case 'CLOSED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CONFIRMED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bank-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">ID</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Risk Score</th>
              <th className="px-5 py-3">Level</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {alerts.map((alert) => {
              const customerName = alert.customerId?.userId?.name || alert.customerId?.customerId || alert.CustomerId || 'C001';
              const formattedDate = new Date(alert.createdAt || Date.now()).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });
              const amountVal = alert.transactionId?.amount || alert.Amount || 1200000;
              const formattedAmount = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(amountVal);

              return (
                <tr key={alert._id || alert.alertId || alert.AlertId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{alert.alertId || alert.AlertCode || '105'}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-900">{customerName}</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{formattedAmount}</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-700">{alert.riskScore}</td>
                  <td className="px-5 py-3.5">
                    <RiskBadge level={alert.riskLevel} />
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(alert.status)}`}>
                      {alert.status === 'UNDER_REVIEW' ? 'UNDER REVIEW' : alert.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{formattedDate}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      to={`/employee/alerts/${alert._id || alert.alertId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 transition-all"
                    >
                      Investigate
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertTable;
