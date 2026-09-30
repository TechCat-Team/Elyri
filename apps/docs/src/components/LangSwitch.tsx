import type { Lang } from '../lib/types';
import { useI18n } from '../lib/i18n';

const OPTIONS: Array<{ code: Lang; label: string; short: string }> = [
  { code: 'zh', label: '中文', short: '中' },
  { code: 'en', label: 'EN', short: 'EN' },
];

export function LangSwitch() {
  const { lang, setLang, t } = useI18n();
  const target = OPTIONS.find((option) => option.code !== lang) ?? OPTIONS[0];

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

      {/* 窄屏收紧为一个按钮，直接显示将要切换到的语言 */}
      <button
        type="button"
        className="lang-toggle"
        aria-label={t('lang.switchTo')}
        title={t('lang.switchTo')}
        onClick={() => setLang(target.code)}
      >
        {target.short}
      </button>
    </>
  );
}
