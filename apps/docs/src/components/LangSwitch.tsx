import type { Lang } from '../lib/types';
import { useI18n } from '../lib/i18n';

const OPTIONS: Array<{ code: Lang; label: string }> = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'EN' },
];

export function LangSwitch() {
  const { lang, setLang, t } = useI18n();

  return (
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
  );
}
