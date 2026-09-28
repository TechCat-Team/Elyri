import { useEffect } from 'react';
import type { MouseEvent } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'elyri-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

const read = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

const apply = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
};

const readStored = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

/**
 * 主题以 <html data-theme> 为准，首屏由 index.html 的内联脚本写入，
 * 组件只负责改写它，因此服务端渲染不会与客户端不一致。
 */
export function useTheme() {
  // 用户未手动选择时跟随系统
  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (!readStored()) apply(event.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggle = (event: MouseEvent<HTMLElement>) => {
    const next: Theme = read() === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // 隐私模式下写入失败不影响切换
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduceMotion) {
      apply(next);
      return;
    }

    // 从按钮位置以圆形扩散出新主题
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const transition = document.startViewTransition(() => apply(next));

    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 560, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    });
  };

  return { toggle };
}
