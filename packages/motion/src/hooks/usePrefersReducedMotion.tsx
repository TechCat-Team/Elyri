import { createContext, useContext, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';

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

/** 上层可强制一棵子树进入 / 退出「减弱动态效果」，null 表示跟随系统 */
const ReducedMotionContext = createContext<boolean | null>(null);

export interface ReducedMotionProviderProps {
  /** true 时子树内的动画只呈现静止状态，false 强制播放 */
  reduced: boolean;
  children: ReactNode;
}

/**
 * 在不改动系统设置的前提下，强制某棵子树播放或静止。
 * 子树内的动画都读取该值，优先级高于系统偏好。
 */
export function ReducedMotionProvider({ reduced, children }: ReducedMotionProviderProps) {
  return <ReducedMotionContext.Provider value={reduced}>{children}</ReducedMotionContext.Provider>;
}

export function usePrefersReducedMotion(): boolean {
  const override = useContext(ReducedMotionContext);
  const system = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return override ?? system;
}
