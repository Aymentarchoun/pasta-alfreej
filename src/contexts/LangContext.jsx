import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const defaultValue = {
  lang: 'en',
  toggle: () => {},
  tr: translations.en,
};

const LangContext = createContext(defaultValue);

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggle = () => setLang(l => l === 'en' ? 'ar' : 'en');
  const tr = translations[lang];

  return (
    <LangContext.Provider value={{ lang, toggle, tr }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
