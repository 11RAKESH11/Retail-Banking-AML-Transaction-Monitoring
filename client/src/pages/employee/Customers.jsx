import React, { useState, useEffect } from 'react';
import { getAllCustomersApi, freezeAccountApi, unfreezeAccountApi } from '../../services/api';
import RiskBadge from '../../components/RiskBadge';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { Search, Filter, Lock, Unlock, Eye, X } from 'lucide-react';

const EmployeeCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [search, riskLevel]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAllCustomersApi({ search, riskLevel, limit: 20 });
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customer list');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFreeze = async (accountId, currentStatus) => {
    try {
      setActionLoading(true);
      if (currentStatus === 'ACTIVE') {
        await freezeAccountApi(accountId, 'Frozen by compliance officer during customer review');
      } else {
        await unfreezeAccountApi(accountId, 'Unfrozen following compliance verification');
      }
      fetchCustomers();
      if (selectedCustomer) setSelectedCustomer(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Customer Search & Management</h2>
        <p className="text-xs text-slate-400">Search customer profiles, accounts, risk ratings and execute account status actions</p>
      </div>

      {/* Search Bar & Filters */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Customer ID, Name, Email, or Account..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-100 outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none"
          >
            <option value="">All Risk Levels</option>
            <option value="LOW">LOW Risk</option>
            <option value="MEDIUM">MEDIUM Risk</option>
            <option value="HIGH">HIGH Risk</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <Loading message="Fetching customer records..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchCustomers} />
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Customer ID</th>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">Address</th>
                  <th className="px-5 py-3.5">Risk Rating</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customers.map((cust) => (
                  <tr key={cust._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-medium text-slate-200">{cust.customerId}</td>
                    <td className="px-5 py-4 font-semibold text-white">{cust.userId?.name || 'N/A'}</td>
                    <td className="px-5 py-4 text-xs text-slate-400">{cust.userId?.email || 'N/A'}</td>
                    <td className="px-5 py-4 text-xs text-slate-400">{cust.phone}</td>
                    <td className="px-5 py-4 text-xs text-slate-400">{cust.address}</td>
                    <td className="px-5 py-4">
                      <RiskBadge level={cust.riskLevel} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 max-w-lg w-full space-y-4 relative shadow-2xl">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white">Customer Profile Overview</h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Customer ID</span>
                <span className="font-mono font-bold text-white">{selectedCustomer.customerId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Full Name</span>
                <span className="font-semibold text-white">{selectedCustomer.userId?.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Email Address</span>
                <span>{selectedCustomer.userId?.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Risk Profile Rating</span>
                <RiskBadge level={selectedCustomer.riskLevel} />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeCustomers;
