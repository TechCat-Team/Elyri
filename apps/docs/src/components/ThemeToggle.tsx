import type { MouseEvent } from 'react';

import type { Theme } from '../lib/hooks/useTheme';
import { useI18n } from '../lib/i18n';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: (event: MouseEvent<HTMLElement>) => void;
}

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

/** 日月变形按钮：太阳的光芒收拢，月牙的阴影滑入 */
export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const { t } = useI18n();
  const isDark = theme === 'dark';
  const label = isDark ? t('theme.toLight') : t('theme.toDark');

  return (
    <button
      type="button"
      className={isDark ? 'icon-button theme-toggle is-dark' : 'icon-button theme-toggle'}
      aria-label={label}
      title={label}
      onClick={onToggle}
    >
      <svg className="theme-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <mask id="theme-moon-mask">
          <rect width="24" height="24" fill="#fff" />
          <circle className="theme-icon-cut" cx="24" cy="2" r="7" fill="#000" />
        </mask>
        <circle className="theme-icon-core" cx="12" cy="12" r="5" fill="currentColor" mask="url(#theme-moon-mask)" />
        <g className="theme-icon-rays" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {RAYS.map((deg) => (
            <line key={deg} x1="12" y1="2.5" x2="12" y2="4.5" transform={`rotate(${deg} 12 12)`} />
          ))}
        </g>
      </svg>
    </button>
  );
}
