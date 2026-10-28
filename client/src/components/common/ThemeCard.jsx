import React from 'react';
import { theme } from '../../theme/theme';

export const ThemeCard = ({
  children,
  accent = true,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`${theme.cards.base} ${accent ? theme.cards.accentBorder : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default ThemeCard;
