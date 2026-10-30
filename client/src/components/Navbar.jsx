import React from 'react';
import { Menu, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from './common/LanguageToggle';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, wards, selectedWard, changeWard } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left side: Hamburger & Compact Mobile Ward Selector */}
      <div className="flex items-center gap-1.5 sm:gap-4 flex-1 min-w-0 pr-2">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 -ml-1 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 active:scale-95 lg:hidden transition-all shrink-0"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Ward Selector with mobile responsive width */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 max-w-[160px] xs:max-w-[210px] sm:max-w-xs md:max-w-sm">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden md:inline shrink-0">
            {t('common.activeWard')}:
          </span>
          <div className="relative w-full min-w-0">
            <select
              value={selectedWard?._id || 'ALL'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'ALL') {
                  changeWard({
                    _id: 'ALL',
                    wardCode: 'ALL',
                    wardName: 'All Wards (Consolidated)',
                    locality: 'Entire Constituency',
                  });
                } else {
                  const target = wards.find((w) => w._id === val);
                  if (target) changeWard(target);
                }
              }}
              className="w-full appearance-none bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border border-emerald-200/90 hover:border-emerald-400 text-emerald-950 text-[11px] sm:text-xs font-bold rounded-xl pl-2 sm:pl-3 pr-6 sm:pr-8 py-1.5 sm:py-2 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all shadow-xs truncate"
            >
              <option value="ALL">🌐 All Wards</option>
              {wards.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.wardCode} — {w.wardName}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-emerald-600 absolute right-1.5 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {selectedWard?.locality && selectedWard._id !== 'ALL' && (
            <span className="hidden xl:inline text-xs font-medium text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200/80 truncate max-w-[180px]">
              {selectedWard.locality}
            </span>
          )}
        </div>
      </div>

      {/* Right side: Language Toggle, User Info & Logout */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Bilingual Language Switcher */}
        <LanguageToggle compact={true} />

        <div className="hidden sm:block text-right">
          <div className="text-xs font-bold text-slate-800 leading-tight">{user?.fullName}</div>
          <div className="text-[10px] text-slate-400 font-medium truncate max-w-[130px]">{user?.email}</div>
        </div>

        {/* Mobile User Avatar Initial */}
        <div className="sm:hidden w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200 shrink-0">
          {user?.fullName?.charAt(0) || 'U'}
        </div>

        <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

        <button
          onClick={logout}
          title={t('nav.logout')}
          className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 rounded-xl transition-all border border-transparent hover:border-rose-100 shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
