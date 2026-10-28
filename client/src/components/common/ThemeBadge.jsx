import React from 'react';
import { theme } from '../../theme/theme';

export const ThemeBadge = ({
  children,
  variant = 'ward',
  icon: Icon,
  className = '',
}) => {
  const badgeClass = theme.badges[variant] || theme.badges.ward;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
};

export default ThemeBadge;
