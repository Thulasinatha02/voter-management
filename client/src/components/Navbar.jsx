import React from 'react';
import { Menu, LogOut, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, wards, selectedWard, changeWard } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left side: Hamburger & Active Ward Selector */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 lg:hidden transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Ward Selector with Emerald Glow */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Active Ward:
          </span>
          <div className="relative">
            <select
              value={selectedWard?._id || ''}
              onChange={(e) => {
                const target = wards.find((w) => w._id === e.target.value);
                if (target) changeWard(target);
              }}
              className="appearance-none bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border border-emerald-200/90 hover:border-emerald-400 text-emerald-900 text-xs font-bold rounded-xl pl-3 pr-8 py-2 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all shadow-xs"
            >
              {wards.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.wardCode} — {w.wardName}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-emerald-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {selectedWard?.locality && (
            <span className="hidden md:inline text-xs font-medium text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200/80 truncate max-w-[200px]">
              {selectedWard.locality}
            </span>
          )}
        </div>
      </div>

      {/* Right side: Neutral notice, User Info & Logout */}
      <div className="flex items-center gap-3">
        <div className="hidden xl:flex items-center gap-1.5 text-xs bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 px-3 py-1.5 rounded-xl shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-emerald-800 font-semibold">Neutral Administrative Standard</span>
        </div>

        <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-xs font-bold text-slate-800">{user?.fullName}</div>
            <div className="text-[11px] text-slate-400 font-medium">{user?.email}</div>
          </div>

          <button
            onClick={logout}
            title="Log out"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
