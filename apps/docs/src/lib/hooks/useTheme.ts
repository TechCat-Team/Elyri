import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { flushSync } from 'react-dom';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'elyri-theme';
const media = window.matchMedia('(prefers-color-scheme: dark)');

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return media.matches ? 'dark' : 'light';
};

const apply = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
};

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => apply(theme), [theme]);

  // 用户未手动选择时，跟随系统
  useEffect(() => {
    const onChange = (event: MediaQueryListEvent) => {
      if (!localStorage.getItem(STORAGE_KEY)) setTheme(event.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggle = (event: MouseEvent<HTMLElement>) => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduceMotion) {
      setTheme(next);
      return;
    }

    // 从按钮位置以圆形扩散出新主题
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const transition = document.startViewTransition(() => {
      apply(next);
      flushSync(() => setTheme(next));
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 560, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    });
  };

  return { theme, toggle };
}
