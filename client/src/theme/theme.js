// Centralized Theme Configuration for Ward Management System
// Lush Gradient Green / Emerald Aesthetic

export const theme = {
  colors: {
    primary: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22',
    },
    teal: {
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
    },
  },

  // Gradient presets
  gradients: {
    primary: 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600',
    primaryHover: 'hover:from-emerald-500 hover:via-emerald-600 hover:to-teal-500',
    subtle: 'bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5',
    cardHero: 'bg-gradient-to-br from-emerald-600/90 via-emerald-700 to-teal-800',
    glow: 'shadow-lg shadow-emerald-500/20',
    activeNav: 'bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-transparent text-emerald-400 border-l-4 border-emerald-500',
  },

  // Button style variants
  buttons: {
    gradient:
      'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all duration-150',
    outline:
      'border border-emerald-300 text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100/70 font-semibold transition-colors',
    subtle:
      'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold transition-colors',
    ghost:
      'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80 font-medium transition-colors',
    secondary:
      'bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition-colors',
  },

  // Badges & Pills
  badges: {
    ward: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200 font-bold',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium',
    pending: 'bg-amber-50 text-amber-700 border border-amber-200/80 font-medium',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200 font-medium',
  },

  // Card styles
  cards: {
    base: 'bg-white rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden',
    accentBorder: 'before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-emerald-500 before:via-teal-500 before:to-green-400',
  },

  // Form input focus styles
  inputs: {
    base: 'focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-150',
  },
};

export default theme;
