import React, { useState, useEffect } from 'react';
import { getAllTransactionsApi } from '../../services/api';
import TransactionTable from '../../components/TransactionTable';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const EmployeeTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchTransactions();
  }, [search, type, riskLevel, status, page]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAllTransactionsApi({
        search,
        type,
        riskLevel,
        status,
        page,
        limit: 10,
      });

      if (res.data.success) {
        setTransactions(res.data.data);
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transaction search records');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">System Transaction Search</h2>
          <p className="text-xs text-slate-400">Search and filter all retail banking transactions across all risk bands</p>
        </div>
        <button
          onClick={fetchTransactions}
          className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Tx ID, Location, Recipient..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl py-2 pl-10 pr-3 text-xs text-slate-100 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none"
          >
            <option value="">All Types</option>
            <option value="DEPOSIT">DEPOSIT</option>
            <option value="WITHDRAWAL">WITHDRAWAL</option>
            <option value="TRANSFER">TRANSFER</option>
            <option value="PAYMENT">PAYMENT</option>
          </select>

          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none"
          >
            <option value="">All Risk Bands</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="FLAGGED">FLAGGED</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {/* Table Results */}
      {loading ? (
        <Loading message="Filtering transactions..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchTransactions} />
      ) : (
        <div className="space-y-4">
          <TransactionTable transactions={transactions} showRisk={true} />

          {/* Pagination Controls */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>
              Showing {transactions.length} of {totalCount} records
            </span>

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

export default EmployeeTransactions;
