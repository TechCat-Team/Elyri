import { useEffect } from 'react';
import type { RefObject } from 'react';

/** 关闭原因：Escape 键或外部指针按下 */
export type DismissReason = 'escape' | 'outside';

export interface UseDismissOptions {
  open: boolean;
  /** 命中外部指针按下或 Escape 时调用，reason 区分触发原因 */
  onDismiss: (reason: DismissReason) => void;
  /** 这些元素内部的交互不触发关闭（触发元素与浮层本身） */
  refs: RefObject<HTMLElement | null>[];
  /** 是否响应 Escape，默认 true */
  escape?: boolean;
  /** 是否响应外部指针按下，默认 true */
  outside?: boolean;
}

/** 外部点击与 Escape 关闭浮层。指针用捕获阶段监听，避免内部 stopPropagation 影响判断 */
export function useDismiss({ open, onDismiss, refs, escape = true, outside = true }: UseDismissOptions) {
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!outside) return;
      const target = event.target as Node | null;
      if (!target || refs.some((ref) => ref.current?.contains(target))) return;
      onDismiss('outside');
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (escape && event.key === 'Escape') onDismiss('escape');
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onDismiss, refs, escape, outside]);
}
