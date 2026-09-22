import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, KeyRound, Mail, UserCheck, Shield, ShieldAlert, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'CUSTOMER') navigate('/customer/dashboard');
      else if (user.role === 'EMPLOYEE') navigate('/employee/dashboard');
      else if (user.role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[540px]">
        {/* Dark Navy Brand Side Panel (Matching Screen 1 Mockup) */}
        <div className="md:w-5/12 bg-[#0b192c] p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">SecureBank</h1>
                <p className="text-[10px] text-slate-300">Safe Banking. Safe Tomorrow.</p>
              </div>
            </div>
          </div>

          {/* Central Pillar Graphic Illustration */}
          <div className="my-auto text-center relative z-10 py-6">
            <div className="w-24 h-24 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
              <Building2 className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Enterprise Banking</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Real-time Transaction Monitoring & Automated AML Risk Scoring Surveillance
            </p>
          </div>

          <div className="text-[11px] text-slate-500 text-center relative z-10">
            © 2026 SecureBank Financial Services Ltd.
          </div>
        </div>

        {/* Form Side Card */}
        <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
              <p className="text-xs text-slate-500 mt-1">Sign in to access your SecureBank account</p>
            </div>

            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? 'Signing In...' : 'Login'}
              </button>
            </form>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              Quick Demo Login Options
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('rajesh@example.com', 'Password@123')}
                className="py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[11px] font-semibold flex flex-col items-center gap-1 transition-all"
              >
                <UserCheck className="w-4 h-4" />
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('employee1@cba-aml.com', 'Password@123')}
                className="py-2 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[11px] font-semibold flex flex-col items-center gap-1 transition-all"
              >
                <Shield className="w-4 h-4" />
                Employee
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('admin@cba-aml.com', 'Password@123')}
                className="py-2 px-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-[11px] font-semibold flex flex-col items-center gap-1 transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
