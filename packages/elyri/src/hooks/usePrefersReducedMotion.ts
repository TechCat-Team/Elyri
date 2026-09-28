import { useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

let mediaQuery: MediaQueryList | null = null;
const query = () => (mediaQuery ??= window.matchMedia(REDUCED_MOTION_QUERY));

const subscribe = (onChange: () => void) => {
  const media = query();
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};

const getSnapshot = () => query().matches;

/** 服务端渲染时先按 false 输出，水合后再切到真实值 */
const getServerSnapshot = () => false;

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
