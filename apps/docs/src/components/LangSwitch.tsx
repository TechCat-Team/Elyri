import type { Lang } from '../lib/types';
import { useI18n } from '../lib/i18n';

const OPTIONS: Array<{ code: Lang; label: string }> = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'EN' },
];

export function LangSwitch() {
  const { lang, setLang, t } = useI18n();
  const current = OPTIONS.find((option) => option.code === lang) ?? OPTIONS[0];

  return (
    <>
      <div className="lang-switch" role="group" aria-label={t('lang.label')}>
        {OPTIONS.map((option) => (
          <button
            key={option.code}
            type="button"
            aria-pressed={option.code === lang}
            className={option.code === lang ? 'lang-option is-active' : 'lang-option'}
            onClick={() => setLang(option.code)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* 窄屏收紧为一个按钮，显示当前语言，点击切换 */}
      <button
        type="button"
        className="lang-toggle"
        aria-label={t('lang.label')}
        title={t('lang.label')}
        onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c2.6 2.7 2.6 15.3 0 18M12 3c-2.6 2.7-2.6 15.3 0 18" />
        </svg>
        <span className="lang-toggle-label">{current.label}</span>
      </button>
    </>
  );
}
