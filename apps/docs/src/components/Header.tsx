import { useSyncExternalStore } from 'react';
import type { MouseEvent } from 'react';

import { useI18n } from '../lib/i18n';
import { Link } from '../lib/router';
import { site } from '../lib/site';

import { LangSwitch } from './LangSwitch';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onToggleTheme: (event: MouseEvent<HTMLElement>) => void;
  onOpenSearch: () => void;
  onToggleMenu: () => void;
}

const noop = () => () => {};
/** 服务端无法判断平台，先按非 Mac 输出，水合后再切到真实值 */
const isMacPlatform = () => navigator.platform.toUpperCase().includes('MAC');
const serverIsMac = () => false;

export function Header({ onToggleTheme, onOpenSearch, onToggleMenu }: HeaderProps) {
  const { t } = useI18n();
  const isMac = useSyncExternalStore(noop, isMacPlatform, serverIsMac);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="icon-button menu-button" aria-label={t('menu.open')} onClick={onToggleMenu}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link to="" className="logo">
          <img className="logo-mark" src={`${import.meta.env.BASE_URL}logo.svg`} alt="" width="28" height="28" />
          {site.name}
        </Link>
        <span className="version-badge">v{site.version}</span>
      </div>

      <div className="topbar-right">
        <button type="button" className="search-trigger" onClick={onOpenSearch}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span>{t('search.trigger')}</span>
          <kbd>{isMac ? '⌘' : 'Ctrl'} K</kbd>
        </button>

        <LangSwitch />

        <ThemeToggle onToggle={onToggleTheme} />

        {site.github && (
          <a className="icon-button" href={site.github} target="_blank" rel="noreferrer" aria-label="GitHub">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
            </svg>
          </a>
        )}
      </div>
    </header>
  );
}
