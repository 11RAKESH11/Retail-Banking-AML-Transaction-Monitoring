import React, { useState, useEffect } from 'react';
import { getAuditLogsApi } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { History, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination & Filter
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchAuditLogs();
  }, [action, page]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAuditLogsApi({ action, page, limit: 15 });
      if (res.data.success) {
        setLogs(res.data.data);
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const actionTypes = [
    '',
    'LOGIN',
    'TRANSACTION_CREATED',
    'AML_ALERT_CREATED',
    'ALERT_REVIEWED',
    'ACCOUNT_FROZEN',
    'ACCOUNT_UNFROZEN',
    'AML_RULE_UPDATED',
    'AML_RULE_ENABLED',
    'AML_RULE_DISABLED',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            System Security Audit Log Trail
          </h2>
          <p className="text-xs text-slate-400">Complete immutable record of system events, logins, alerts, and admin rule updates</p>
        </div>
        <button
          onClick={fetchAuditLogs}
          className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none"
          >
            <option value="">All Action Event Types</option>
            {actionTypes.slice(1).map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      {loading ? (
        <Loading message="Loading audit history logs..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchAuditLogs} />
      ) : (
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-[11px] uppercase font-semibold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-5 py-3.5">Actor</th>
                    <th className="px-5 py-3.5">Action Event</th>
                    <th className="px-5 py-3.5">Resource</th>
                    <th className="px-5 py-3.5">Metadata Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5 text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-white">{log.actorId?.name || 'System'}</span>
                        {log.actorId?.role && (
                          <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                            {log.actorId.role}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-blue-400">{log.action}</td>
                      <td className="px-5 py-3.5 text-slate-300 font-mono">
                        {log.resource} {log.resourceId ? `(${log.resourceId})` : ''}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                        {JSON.stringify(log.metadata)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>Showing {logs.length} of {totalCount} log events</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-200">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
