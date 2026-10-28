import React from 'react';
import { theme } from '../../theme/theme';

export const ThemeButton = ({
  children,
  variant = 'gradient',
  size = 'md',
  icon: Icon,
  className = '',
  disabled = false,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-xs rounded-xl gap-2 font-semibold',
    lg: 'px-6 py-3 text-sm rounded-xl gap-2.5 font-bold',
  };

  const variantClass = theme.buttons[variant] || theme.buttons.gradient;

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-all ${sizeClasses[size]} ${variantClass} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

export default ThemeButton;
