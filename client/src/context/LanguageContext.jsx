import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../locales/en.json';
import taTranslations from '../locales/ta.json';

const LanguageContext = createContext(null);

const translations = {
  en: enTranslations,
  ta: taTranslations,
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('ward_portal_lang') || 'en';
  });

  const changeLanguage = (newLang) => {
    if (newLang === 'en' || newLang === 'ta') {
      setLang(newLang);
      localStorage.setItem('ward_portal_lang', newLang);
    }
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'ta' : 'en';
    changeLanguage(nextLang);
  };

  // Helper function to resolve dot-notated translation keys (e.g., 'dashboard.totalFamilies')
  const t = (path, params = {}) => {
    const keys = path.split('.');
    let current = translations[lang] || translations.en;

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to English if missing in target
        let fallback = translations.en;
        for (const fKey of keys) {
          if (fallback && fallback[fKey] !== undefined) {
            fallback = fallback[fKey];
          } else {
            return path; // Return key if not found
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current === 'string') {
      // Dynamic variable interpolation: {{varName}}
      return current.replace(/\{\{(\w+)\}\}/g, (_, match) => {
        return params[match] !== undefined ? params[match] : `{{${match}}}`;
      });
    }

    return current;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
