import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Languages } from 'lucide-react';

export const LanguageToggle = ({ className = '', compact = false }) => {
  const { lang, toggleLanguage } = useLanguage();

  if (compact) {
    return (
      <button
        onClick={toggleLanguage}
        title="Switch Language / மொழியை மாற்று"
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-200/90 bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-900 text-xs font-bold active:scale-95 transition-all shadow-xs ${className}`}
      >
        <Languages className="w-3.5 h-3.5 text-emerald-700" />
        <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-xs ${className}`}
    >
      <button
        type="button"
        onClick={() => toggleLanguage()}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
          lang === 'en'
            ? 'bg-white text-emerald-800 shadow-xs'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <span>English</span>
      </button>
      <button
        type="button"
        onClick={() => toggleLanguage()}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
          lang === 'ta'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <span>தமிழ்</span>
      </button>
    </div>
  );
};

export default LanguageToggle;
