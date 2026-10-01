import { useEffect } from 'react';

// 多个模态同时打开时，只有最后一个关闭才恢复滚动
let locks = 0;
let previousOverflow = '';
let previousPaddingRight = '';

/** 锁定 body 滚动（模态打开时用），卸载或停用后按计数恢复；补偿滚动条宽度避免页面横向跳动 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    if (locks === 0) {
      const { style } = document.body;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      previousOverflow = style.overflow;
      previousPaddingRight = style.paddingRight;
      if (scrollbarWidth > 0) {
        const current = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
        style.paddingRight = `${current + scrollbarWidth}px`;
      }
      style.overflow = 'hidden';
    }
    locks += 1;

    return () => {
      locks -= 1;
      if (locks === 0) {
        document.body.style.overflow = previousOverflow;
        document.body.style.paddingRight = previousPaddingRight;
      }
    };
  }, [active]);
}
