import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

const subscribe = () => () => {};
const isClient = () => true;
const isServer = () => false;

/**
 * 把内容渲染到 document.body。服务端快照返回 false，
 * 预渲染与水合期间不渲染，水合完成后再挂载浮层。
 */
export function Portal({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(subscribe, isClient, isServer);

  return mounted ? createPortal(children, document.body) : null;
}
