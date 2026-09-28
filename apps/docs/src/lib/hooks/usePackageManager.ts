import { useSyncExternalStore } from 'react';

import type { PackageManager } from '../types';

const STORAGE_KEY = 'elyri-docs-package-manager';

export const packageManagers: PackageManager[] = ['pnpm', 'npm', 'yarn', 'bun'];

const isManager = (value: string | null): value is PackageManager =>
  !!value && (packageManagers as string[]).includes(value);

/** 模块内共享，保证各页面的选择一致 */
let current: PackageManager | null = null;
const listeners = new Set<() => void>();

const readStored = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const read = () => {
  if (!current) {
    const stored = readStored();
    current = isManager(stored) ? stored : 'pnpm';
  }
  return current;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** 服务端先按 pnpm 输出，水合后再切到用户的选择，避免标记不一致 */
const serverSnapshot = (): PackageManager => 'pnpm';

/** 全局共享、可持久化的包管理器偏好 */
export function usePackageManager() {
  const manager = useSyncExternalStore(subscribe, read, serverSnapshot);

  const update = (next: PackageManager) => {
    current = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // 隐私模式下写入失败不影响使用
    }
    listeners.forEach((listener) => listener());
  };

  return [manager, update] as const;
}
