import React, { useState, useEffect } from 'react';
import { getAmlAlertsApi } from '../../services/api';
import AlertTable from '../../components/AlertTable';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { AlertTriangle, Filter, Search } from 'lucide-react';

const EmployeeAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [status, setStatus] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, [status, riskLevel]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAmlAlertsApi({ status, riskLevel, limit: 50 });
      if (res.data.success) {
        setAlerts(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load AML alerts queue');
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      a.alertId?.toLowerCase().includes(term) ||
      a.AlertCode?.toLowerCase().includes(term) ||
      a.customerId?.customerId?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">AML Alerts</h2>
        <p className="text-xs text-slate-500 mt-0.5">Review and investigate suspicious transaction alerts</p>
      </div>

      {/* Filter Row (Screen 8 Mockup) */}
      <div className="bank-card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer, transaction ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-blue-600"
          >
            <option value="">All Risk Levels</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-blue-600"
          >
            <option value="">All Status</option>
            <option value="OPEN">OPEN</option>
            <option value="UNDER_REVIEW">UNDER REVIEW</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          <button
            onClick={fetchAlerts}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs"
          >
            Search
          </button>
        </div>
      </div>

      {/* Alert Table List */}
      {loading ? (
        <Loading message="Loading AML alerts..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchAlerts} />
      ) : (
        <AlertTable alerts={filteredAlerts} />
      )}
    </div>
  );
};

export default EmployeeAlerts;
