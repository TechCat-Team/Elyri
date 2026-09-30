import { useSyncExternalStore } from 'react';
import type { MouseEvent } from 'react';

import { useI18n } from '../lib/i18n';

interface ThemeToggleProps {
  onToggle: (event: MouseEvent<HTMLElement>) => void;
}

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

/** 监听 <html data-theme> 变化，用于给按钮写明「切换到哪种主题」 */
const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
};
const isDark = () => document.documentElement.dataset.theme !== 'light';
const serverIsDark = () => true;

/**
 * 日月变形按钮：太阳的光芒收拢，月牙的阴影滑入。
 * 外观完全由 <html data-theme> 经 CSS 决定，避免水合不一致与首屏闪烁。
 */
export function ThemeToggle({ onToggle }: ThemeToggleProps) {
  const { t } = useI18n();
  const dark = useSyncExternalStore(subscribe, isDark, serverIsDark);
  const label = t(dark ? 'theme.toLight' : 'theme.toDark');

  return (
    <button type="button" className="icon-button theme-toggle" aria-label={label} title={label} onClick={onToggle}>
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
