import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, User, Bell } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'EMPLOYEE':
        return 'Compliance Officer';
      default:
        return 'Customer';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Search Input Bar */}
      <div className="relative w-72">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-slate-100/80 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-1.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
        />
      </div>

      {/* User Profile Pill & Actions */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
            <div className="w-8 h-8 rounded-full bg-[#0b192c] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left pr-2">
              <p className="text-xs font-bold text-slate-900 leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{getRoleLabel(user.role)}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
