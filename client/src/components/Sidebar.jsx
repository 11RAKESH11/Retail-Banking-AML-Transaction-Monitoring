import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CreditCard,
  ArrowRightLeft,
  FileText,
  Users,
  AlertTriangle,
  Sliders,
  History,
  ShieldCheck,
  Building2,
  User,
  LogOut,
  Send,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'CUSTOMER';

  const customerLinks = [
    { to: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/customer/account', label: 'My Account', icon: CreditCard },
    { to: '/customer/transactions', label: 'Transactions', icon: ArrowRightLeft },
    { to: '/customer/statement', label: 'Statement', icon: FileText },
  ];

  const employeeLinks = [
    { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employee/customers', label: 'Customers', icon: Users },
    { to: '/employee/transactions', label: 'Transactions', icon: ArrowRightLeft },
    { to: '/employee/alerts', label: 'AML Alerts', icon: AlertTriangle },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Overview', icon: ShieldCheck },
    { to: '/admin/aml-rules', label: 'AML Rules', icon: Sliders },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: History },
  ];

  const navItems = role === 'CUSTOMER' ? customerLinks : role === 'EMPLOYEE' ? employeeLinks : [...employeeLinks, ...adminLinks];

  return (
    <aside className="w-64 bg-[#0b192c] text-slate-200 flex flex-col justify-between p-4 min-h-screen border-r border-slate-800 shadow-xl flex-shrink-0">
      <div>
        {/* SecureBank Brand Header */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1">
              SecureBank
            </h1>
            <p className="text-[10px] text-slate-400 tracking-wider">Safe Banking. Safe Tomorrow.</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer User / Logout Block */}
      <div className="pt-4 border-t border-slate-800/80 space-y-1">
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
