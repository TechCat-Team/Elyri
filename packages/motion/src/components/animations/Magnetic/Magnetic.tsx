import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import { cn, usePrefersReducedMotion } from '../../../core';

import './Magnetic.css';

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3;

export interface MagneticProps {
  children: ReactNode;
  className?: string;
  /** 吸附强度（0-1），元素向指针偏移的距离比例 */
  strength?: number;
  /** 元素边缘向外扩展的触发范围（像素） */
  range?: number;
  /** 指针离开触发范围后的回正时长（毫秒） */
  resetDuration?: number;
}

/** 磁吸：指针靠近时元素被吸附偏移，离开后缓动回正 */
export function Magnetic({ children, className, strength = 0.35, range = 120, resetDuration = 400 }: MagneticProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const element = elementRef.current;
    if (!element || prefersReducedMotion) return;

    let moveFrame = 0;
    let resetFrame = 0;
    let offset = { x: 0, y: 0 };
    let pointer: { x: number; y: number } | null = null;

    const setOffset = (x: number, y: number) => {
      offset = { x, y };
      element.style.setProperty('--elyri-magnetic-x', `${x}px`);
      element.style.setProperty('--elyri-magnetic-y', `${y}px`);
    };

    // 缓动补间回正，避免指针离开范围时位置瞬间归零
    const startReset = () => {
      if (resetFrame || (!offset.x && !offset.y)) return;

      const from = { ...offset };
      const startedAt = performance.now();

      const step = (now: number) => {
        const progress = Math.min((now - startedAt) / resetDuration, 1);
        const remaining = 1 - easeOutCubic(progress);

        setOffset(from.x * remaining, from.y * remaining);

        resetFrame = progress < 1 ? requestAnimationFrame(step) : 0;
      };

      resetFrame = requestAnimationFrame(step);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };

      if (moveFrame) return;

      moveFrame = requestAnimationFrame(() => {
        moveFrame = 0;
        if (!pointer) return;

        const rect = element.getBoundingClientRect();
        const dx = pointer.x - (rect.left + rect.width / 2);
        const dy = pointer.y - (rect.top + rect.height / 2);
        const inside = Math.abs(dx) <= rect.width / 2 + range && Math.abs(dy) <= rect.height / 2 + range;

        if (inside) {
          // 指针回到触发范围时打断尚未结束的回正
          cancelAnimationFrame(resetFrame);
          resetFrame = 0;
          // 边缘衰减：边界处系数为 0，越靠近元素越大，避免进入范围瞬间位移跳变
          const overflowX = Math.max(0, Math.abs(dx) - rect.width / 2);
          const overflowY = Math.max(0, Math.abs(dy) - rect.height / 2);
          const proximity = 1 - Math.min(Math.max(overflowX, overflowY) / range, 1);
          setOffset(dx * strength * proximity, dy * strength * proximity);
          return;
        }

        startReset();
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    // 指针移出窗口时不再触发 pointermove，需要手动回正
    document.documentElement.addEventListener('pointerleave', startReset);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener('pointerleave', startReset);
      cancelAnimationFrame(moveFrame);
      cancelAnimationFrame(resetFrame);
    };
  }, [prefersReducedMotion, range, strength, resetDuration]);

  return (
    <div ref={elementRef} className={cn('elyri-magnetic', className)}>
      {children}
    </div>
  );
}
