import { useEffect } from 'react';
import type { RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, audio[controls], video[controls], summary, [contenteditable]:not([contenteditable="false"]), [tabindex]:not([tabindex="-1"])';

/** 把焦点圈定在容器内，停用后归还给打开前的元素。容器需可聚焦（tabIndex={-1}） */
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusables = () => [...container.querySelectorAll<HTMLElement>(FOCUSABLE)];

    if (!container.contains(document.activeElement)) (focusables()[0] ?? container).focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      const atEdge = !container.contains(current);
      if (event.shiftKey && (current === first || atEdge)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || atEdge)) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [containerRef, active]);
}
