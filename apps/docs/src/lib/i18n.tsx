import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { messages } from './messages';
import type { MessageKey } from './messages';
import type { Lang } from './types';

const STORAGE_KEY = 'elyri-docs-lang';

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: MessageKey) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

const getInitialLang = (): Lang => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'zh' || stored === 'en') return stored;
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(getInitialLang);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = messages[lang]['app.title'];
  }, [lang]);

  const value = useMemo<I18nValue>(() => ({ lang, setLang, t: (key) => messages[lang][key] }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n 必须在 I18nProvider 内使用');
  return value;
}
