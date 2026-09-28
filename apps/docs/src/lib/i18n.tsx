import { createContext, useContext, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';

import { messages } from './messages';
import type { MessageKey } from './messages';
import { useRoute } from './router';
import type { Lang } from './types';

const STORAGE_KEY = 'elyri-docs-lang';

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: MessageKey) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

/** 语言由 URL 决定；这里只把选择记下来，供根路径跳转时参考 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const { lang, setLang } = useRoute();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // 隐私模式下写入失败不影响使用
    }
  }, [lang]);

  const value = useMemo<I18nValue>(() => ({ lang, setLang, t: (key) => messages[lang][key] }), [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n 必须在 I18nProvider 内使用');
  return value;
}
