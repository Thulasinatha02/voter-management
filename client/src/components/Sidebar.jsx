import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Home,
  Users,
  FileBarChart,
  UserCheck,
  ShieldAlert,
  Settings,
  Flag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from './common/LanguageToggle';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { name: t('nav.dashboard'), path: '/dashboard', icon: LayoutDashboard, permission: 'dashboard', roles: ['superadmin', 'ward_officer', 'data_operator', 'auditor'] },
    { name: t('nav.wardManagement'), path: '/wards', icon: MapPin, permission: 'wardManagement', roles: ['superadmin', 'ward_officer', 'auditor'] },
    { name: t('nav.familyManagement'), path: '/families', icon: Home, permission: 'familyManagement', roles: ['superadmin', 'ward_officer', 'data_operator', 'auditor'] },
    { name: t('nav.memberManagement'), path: '/members', icon: Users, permission: 'memberManagement', roles: ['superadmin', 'ward_officer', 'data_operator', 'auditor'] },
    { name: t('nav.partyManagement') || 'Party Management', path: '/parties', icon: Flag, permission: 'partyManagement', roles: ['superadmin', 'ward_officer', 'data_operator', 'auditor'] },
    { name: t('nav.wardReports'), path: '/reports', icon: FileBarChart, permission: 'wardReports', roles: ['superadmin', 'ward_officer', 'auditor'] },
    { name: t('nav.userManagement'), path: '/users', icon: UserCheck, permission: 'userManagement', roles: ['superadmin'] },
    { name: t('nav.auditLogs'), path: '/audit-logs', icon: ShieldAlert, permission: 'auditLogs', roles: ['superadmin', 'auditor'] },
    { name: t('nav.settings'), path: '/settings', icon: Settings, permission: null, roles: ['superadmin', 'ward_officer', 'data_operator', 'auditor'] },
  ];

  const allowedItems = navItems.filter((item) => {
    // Superadmin has access to everything
    if (user?.role === 'superadmin') return true;

    // If item requires a specific permission and user has a permissions object, check it
    if (item.permission && user?.permissions) {
      return Boolean(user.permissions[item.permission]);
    }

    // Fallback to role-based check
    return item.roles.includes(user?.role || 'data_operator');
  });

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header with Logo */}
      <div className="h-16 flex items-center px-5 gap-3 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-white/10 shadow-md shrink-0 overflow-hidden">
          <img
            src="/admk logo.png"
            alt="Portal Logo"
            className="w-full h-full object-contain drop-shadow-xs"
          />
        </div>
        <div className="min-w-0">
          <h1 className="font-extrabold text-white text-sm tracking-wider truncate">{t('common.portalTitle')}</h1>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t('common.registrySubtitle')}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
        {allowedItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600/20 via-teal-500/15 to-transparent text-emerald-300 border-l-4 border-emerald-500 shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Language Switcher in Drawer & User Status */}
      <div className="p-4 border-t border-slate-900 space-y-3">
        {/* Mobile Full Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Language / மொழி</span>
          <LanguageToggle compact={false} />
        </div>

        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800/80">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('nav.sessionActive')}</div>
          <div className="text-xs font-bold text-slate-200 mt-0.5 truncate">{user?.fullName || user?.username}</div>
          <div className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30">
            {user?.role?.replace('_', ' ')}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
