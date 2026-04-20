'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { t } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';

interface LangContextValue {
  lang: Lang;
  tr: (typeof t)[Lang];
  toggle: () => void;
}

const LangContext = createContext<LangContextValue>({
  lang: 'en',
  tr: t.en,
  toggle: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const stored = localStorage.getItem('lang');
    if (stored === 'en' || stored === 'ko') setLang(stored);
  }, []);

  function toggle() {
    setLang((prev) => {
      const next: Lang = prev === 'en' ? 'ko' : 'en';
      localStorage.setItem('lang', next);
      return next;
    });
  }

  return (
    <LangContext.Provider value={{ lang, tr: t[lang], toggle }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LangContext);
}
