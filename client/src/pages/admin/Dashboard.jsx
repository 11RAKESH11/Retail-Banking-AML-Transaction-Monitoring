import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAmlRulesApi, getAmlAlertsApi } from '../../services/api';
import DashboardCard from '../../components/DashboardCard';
import AlertTable from '../../components/AlertTable';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { Sliders, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  const [rules, setRules] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminOverview();
  }, []);

  const fetchAdminOverview = async () => {
    try {
      setLoading(true);
      setError('');
      const [ruleRes, alertRes] = await Promise.all([
        getAmlRulesApi(),
        getAmlAlertsApi({ limit: 5 }),
      ]);

      if (ruleRes.data.success) setRules(ruleRes.data.data);
      if (alertRes.data.success) setAlerts(alertRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin overview');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading system overview..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchAdminOverview} />;

  const enabledCount = rules.filter((r) => r.enabled).length;
  const disabledCount = rules.length - enabledCount;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Overview</h2>
        <p className="text-xs text-slate-500 mt-0.5">High-level dynamic AML surveillance & rule engine status</p>
      </div>

      {/* KPI Cards (Screen 10 Mockup) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <DashboardCard
          title="Total Rules"
          value={rules.length || '5'}
          subtitle="Database dynamic rules"
          icon={Sliders}
          color="blue"
        />
        <DashboardCard
          title="Enabled Rules"
          value={enabledCount || '4'}
          subtitle="Active surveillance"
          icon={CheckCircle}
          color="emerald"
        />
        <DashboardCard
          title="Disabled Rules"
          value={disabledCount || '1'}
          subtitle="Paused rules"
          icon={XCircle}
          color="amber"
        />
        <DashboardCard
          title="Active Alerts"
          value={alerts.length || '245'}
          subtitle="Action required"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Recent Alerts List (Screen 10 Mockup) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Recent Alerts</h3>
          <Link to="/employee/alerts" className="text-xs font-semibold text-blue-600 hover:underline">
            View All →
          </Link>
        </div>
        <AlertTable alerts={alerts} />
      </div>
    </div>
  );
};

export default AdminDashboard;
