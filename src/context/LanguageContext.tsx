import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { translations } from '../data/translations';

interface LanguageContextType {
  lang: 'BN' | 'EN';
  toggleLang: () => void;
  t: (section: string, key?: string) => string;
  isBN: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<'BN' | 'EN'>(() => {
    return (localStorage.getItem('mp_lang') as 'BN' | 'EN') || 'BN';
  });

  useEffect(() => {
    document.documentElement.lang = lang === 'BN' ? 'bn' : 'en';
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'BN' ? 'EN' : 'BN';
      localStorage.setItem('mp_lang', next);
      return next;
    });
  }, []);

  const t = useCallback(
    (section: string, key?: string): string => {
      try {
        const parts = section.split('.');
        let obj: any = translations;

        for (const part of parts) {
          obj = obj?.[part];
        }

        if (key && obj) {
          obj = obj[key];
        }

        if (!obj) {
          return key || section;
        }

        return obj[lang] || obj['EN'] || key || section;
      } catch (e) {
        return key || section;
      }
    },
    [lang]
  );

  const isBN = useMemo(() => lang === 'BN', [lang]);

  const value = useMemo(
    () => ({ lang, toggleLang, t, isBN }),
    [lang, toggleLang, t, isBN]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within <LanguageProvider>');
  }
  return context;
};
