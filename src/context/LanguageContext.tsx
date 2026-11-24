import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppLanguage = 'en' | 'bn';

interface LanguageContextType {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  toggleLang: () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem('codeguard_lang');
      if (saved === 'bn' || saved === 'en') return saved;
    } catch {
      // Storage unavailable
    }
    return 'en';
  });

  useEffect(() => {
    try {
      localStorage.setItem('codeguard_lang', lang);
    } catch {
      // Storage unavailable
    }
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
  }, [lang]);

  const setLang = (next: AppLanguage) => setLangState(next);
  const toggleLang = () => setLangState((prev) => (prev === 'en' ? 'bn' : 'en'));

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
