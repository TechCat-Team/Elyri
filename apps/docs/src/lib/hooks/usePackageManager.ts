import { useEffect, useState } from 'react';

import type { PackageManager } from '../types';

const STORAGE_KEY = 'elyri-docs-package-manager';

export const packageManagers: PackageManager[] = ['pnpm', 'npm', 'yarn', 'bun'];

const isManager = (value: string | null): value is PackageManager =>
  !!value && (packageManagers as string[]).includes(value);

/** 模块内共享，保证各页面的选择一致 */
let current: PackageManager | null = null;
const listeners = new Set<(manager: PackageManager) => void>();

const read = () => {
  if (!current) {
    const stored = localStorage.getItem(STORAGE_KEY);
    current = isManager(stored) ? stored : 'pnpm';
  }
  return current;
};

/** 全局共享、可持久化的包管理器偏好 */
export function usePackageManager() {
  const [manager, setManager] = useState(read);

  useEffect(() => {
    listeners.add(setManager);
    return () => {
      listeners.delete(setManager);
    };
  }, []);

  const update = (next: PackageManager) => {
    current = next;
    localStorage.setItem(STORAGE_KEY, next);
    listeners.forEach((listener) => listener(next));
  };

  return [manager, update] as const;
}
