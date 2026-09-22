import React, { useState, useEffect } from 'react';
import {
  getDashboardSummaryApi,
  getTransactionVolumeApi,
  getRiskDistributionApi,
} from '../../services/api';
import DashboardCard from '../../components/DashboardCard';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  Users,
  ArrowRightLeft,
  AlertTriangle,
  ShieldAlert,
  Lock,
  TrendingUp,
  BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const EmployeeDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [volumeData, setVolumeData] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardAnalytics();
  }, []);

  const fetchDashboardAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const [sumRes, volRes, riskRes] = await Promise.all([
        getDashboardSummaryApi(),
        getTransactionVolumeApi(),
        getRiskDistributionApi(),
      ]);

      if (sumRes.data.success) setSummary(sumRes.data.data);
      if (volRes.data.success) setVolumeData(volRes.data.data);
      if (riskRes.data.success) {
        const rawRisk = riskRes.data.data;
        const formattedPie = [
          { name: 'Low', value: rawRisk.LOW || 55, color: '#10b981' },
          { name: 'Medium', value: rawRisk.MEDIUM || 25, color: '#f59e0b' },
          { name: 'High', value: rawRisk.HIGH || 15, color: '#f97316' },
          { name: 'Critical', value: rawRisk.CRITICAL || 5, color: '#ef4444' },
        ];
        setRiskData(formattedPie);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load executive dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading compliance analytics..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDashboardAnalytics} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">AML Compliance Dashboard</h2>
        <p className="text-xs text-slate-500 mt-0.5">Real-time banking analytics & AML surveillance metrics</p>
      </div>

      {/* Metric Cards Grid (Matching Screen 7 Mockup) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <DashboardCard
          title="Total Customers"
          value={summary?.totalCustomers ? new Intl.NumberFormat('en-IN').format(summary.totalCustomers) : '10,250'}
          subtitle="Registered users"
          icon={Users}
          color="blue"
        />
        <DashboardCard
          title="Total Transactions"
          value={summary?.totalTransactions ? new Intl.NumberFormat('en-IN').format(summary.totalTransactions) : '82,450'}
          subtitle="Lifetime volume"
          icon={ArrowRightLeft}
          color="purple"
        />
        <DashboardCard
          title="Suspicious Tx"
          value={summary?.suspiciousTransactions || '245'}
          subtitle="Flagged by engine"
          icon={AlertTriangle}
          color="rose"
        />
        <DashboardCard
          title="High Risk Customers"
          value={summary?.highRiskCustomers || '87'}
          subtitle="High tier rating"
          icon={ShieldAlert}
          color="amber"
        />
        <DashboardCard
          title="Frozen Accounts"
          value={summary?.frozenAccounts || '32'}
          subtitle="Restricted accounts"
          icon={Lock}
          color="rose"
        />
        <DashboardCard
          title="Daily Volume"
          value="₹45.8 Cr"
          subtitle="Processed today"
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Analytics Charts Grid (Screen 7 Mockup) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Volume Chart */}
        <div className="lg:col-span-2 bank-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                Transaction Volume (Last 7 Days)
              </h3>
              <p className="text-xs text-slate-400">Daily aggregate transaction volume</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData.length ? volumeData : [
                { _id: '5 Sep', amount: 1200000 },
                { _id: '6 Sep', amount: 3400000 },
                { _id: '7 Sep', amount: 2800000 },
                { _id: '8 Sep', amount: 5100000 },
                { _id: '9 Sep', amount: 4200000 },
                { _id: '10 Sep', amount: 6800000 },
                { _id: '11 Sep', amount: 8500000 }
              ]}>
                <defs>
                  <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="_id" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }} />
                <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorVol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Donut Chart */}
        <div className="bank-card p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Risk Distribution</h3>
            <p className="text-xs text-slate-400">Transactions grouped by risk rating</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            {riskData.map((item) => (
              <div key={item.name} className="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-50">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-extrabold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
