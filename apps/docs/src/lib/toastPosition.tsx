import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { ToastProvider } from '@elyri/ui';
import type { ToastPosition } from '@elyri/ui';

interface ToastPositionValue {
  position: ToastPosition;
  setPosition: (position: ToastPosition) => void;
}

const ToastPositionContext = createContext<ToastPositionValue | null>(null);

/** 读取 / 切换全局 Toast 视口位置，供文档的位置示例使用 */
export function useToastPosition() {
  const value = useContext(ToastPositionContext);
  if (!value) throw new Error('useToastPosition 必须在 ToastPositionProvider 内使用');
  return value;
}

/** 单一 ToastProvider 的宿主：让示例能切换视口位置，同时保证全局只有一个视口 */
export function ToastPositionProvider({ children }: { children: ReactNode }) {
  const [position, setPosition] = useState<ToastPosition>('top');
  const value = useMemo<ToastPositionValue>(() => ({ position, setPosition }), [position]);

  return (
    <ToastPositionContext.Provider value={value}>
      <ToastProvider position={position}>{children}</ToastProvider>
    </ToastPositionContext.Provider>
  );
}
