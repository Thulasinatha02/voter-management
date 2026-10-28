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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['superadmin', 'ward_officer', 'data_operator', 'auditor'] },
    { name: 'Ward Management', path: '/wards', icon: MapPin, roles: ['superadmin', 'ward_officer', 'auditor'] },
    { name: 'Family Management', path: '/families', icon: Home, roles: ['superadmin', 'ward_officer', 'data_operator', 'auditor'] },
    { name: 'Member Management', path: '/members', icon: Users, roles: ['superadmin', 'ward_officer', 'data_operator', 'auditor'] },
    { name: 'Ward Reports', path: '/reports', icon: FileBarChart, roles: ['superadmin', 'ward_officer', 'auditor'] },
    { name: 'User Management', path: '/users', icon: UserCheck, roles: ['superadmin'] },
    { name: 'Audit Logs', path: '/audit-logs', icon: ShieldAlert, roles: ['superadmin', 'auditor'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['superadmin', 'ward_officer', 'data_operator', 'auditor'] },
  ];

  const allowedItems = navItems.filter((item) =>
    item.roles.includes(user?.role || 'data_operator')
  );

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header with Emerald Gradient */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-600/30">
          W
        </div>
        <div>
          <h1 className="font-extrabold text-white text-sm tracking-wider">WARD PORTAL</h1>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Registry & Governance
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Administrative Menu
        </div>
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

      {/* Role Pill at footer */}
      <div className="p-4 border-t border-slate-900">
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800/80">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Session Active</div>
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
