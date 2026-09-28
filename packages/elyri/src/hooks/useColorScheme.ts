import { useSyncExternalStore } from 'react';

export type ColorScheme = 'light' | 'dark';

/** 从页面根元素读取当前主题：优先 data-theme，其次 .dark / .light 类名，默认深色 */
const readColorScheme = (): ColorScheme => {
  const root = document.documentElement;
  const attr = root.dataset.theme;
  if (attr === 'light' || attr === 'dark') return attr;
  if (root.classList.contains('light')) return 'light';
  if (root.classList.contains('dark')) return 'dark';
  return 'dark';
};

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  return () => observer.disconnect();
};

/** 服务端渲染时按深色输出，水合后再切到页面的真实主题 */
const getServerSnapshot = (): ColorScheme => 'dark';

/**
 * 跟随页面主题实时切换明暗：主题由页面（<html data-theme> 或 .dark/.light）决定，
 * 组件只做镜像，不读取系统偏好。
 */
export function useColorScheme(): ColorScheme {
  return useSyncExternalStore(subscribe, readColorScheme, getServerSnapshot);
}
