import React from 'react';
import { theme } from '../../theme/theme';

export const ThemeStatCard = ({
  title,
  value,
  unit = '',
  icon: Icon,
  badgeText,
  badgeType = 'success',
  footerLabel,
  footerValue,
  accentColor = 'emerald', // emerald, teal, amber
}) => {
  const iconBgClasses = {
    emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    teal: 'bg-teal-50 text-teal-600 border border-teal-100',
    amber: 'bg-amber-50 text-amber-600 border border-amber-100',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all duration-200">
      {/* Subtle top indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500 opacity-80" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBgClasses[accentColor] || iconBgClasses.emerald} shadow-xs`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </span>
        {unit && <span className="text-xs text-slate-500 font-medium">{unit}</span>}
        {badgeText && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            {badgeText}
          </span>
        )}
      </div>

      {(footerLabel || footerValue) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{footerLabel}</span>
          <span className="font-semibold text-slate-800">{footerValue}</span>
        </div>
      )}
    </div>
  );
};

export default ThemeStatCard;
