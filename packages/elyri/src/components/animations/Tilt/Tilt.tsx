import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react';

import { cn, usePrefersReducedMotion } from '../../../core';

import './Tilt.css';

/** 指针离开后回正所用的时长（毫秒） */
const RESET_DURATION = 400;

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3;

export interface TiltProps {
  children: ReactNode;
  className?: string;
  /** 最大倾斜角度（度） */
  max?: number;
  /** 透视距离（像素） */
  perspective?: number;
  /** 是否显示跟随指针的高光 */
  glare?: boolean;
}

/** 指针跟随倾斜：根据指针在元素内的位置计算 3D 旋转 */
export function Tilt({ children, className, max = 10, perspective = 800, glare = true }: TiltProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const moveFrameRef = useRef(0);
  const resetFrameRef = useRef(0);
  const rotationRef = useRef({ x: 0, y: 0 });
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isActive, setIsActive] = useState(false);

  useEffect(
    () => () => {
      cancelAnimationFrame(moveFrameRef.current);
      cancelAnimationFrame(resetFrameRef.current);
    },
    [],
  );

  const setRotation = (x: number, y: number) => {
    rotationRef.current = { x, y };

    const element = elementRef.current;
    if (!element) return;

    element.style.setProperty('--elyri-tilt-rotate-x', `${x}deg`);
    element.style.setProperty('--elyri-tilt-rotate-y', `${y}deg`);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;

    // 指针重新进入时打断尚未结束的回正
    cancelAnimationFrame(resetFrameRef.current);
    resetFrameRef.current = 0;

    pointerRef.current = { x: event.clientX, y: event.clientY };
    setIsActive(true);

    if (moveFrameRef.current) return;

    moveFrameRef.current = requestAnimationFrame(() => {
      moveFrameRef.current = 0;

      const element = elementRef.current;
      const pointer = pointerRef.current;
      if (!element || !pointer) return;

      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const ratioX = (pointer.x - rect.left) / rect.width;
      const ratioY = (pointer.y - rect.top) / rect.height;

      setRotation((0.5 - ratioY) * 2 * max, (ratioX - 0.5) * 2 * max);
      element.style.setProperty('--elyri-tilt-glare-x', `${ratioX * 100}%`);
      element.style.setProperty('--elyri-tilt-glare-y', `${ratioY * 100}%`);
    });
  };

  const handlePointerEnd = () => {
    cancelAnimationFrame(moveFrameRef.current);
    moveFrameRef.current = 0;
    cancelAnimationFrame(resetFrameRef.current);
    resetFrameRef.current = 0;

    pointerRef.current = null;
    setIsActive(false);

    const from = { ...rotationRef.current };
    if (prefersReducedMotion || (!from.x && !from.y)) return;

    // 缓动补间回正，避免指针离开时角度瞬间归零
    const startedAt = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startedAt) / RESET_DURATION, 1);
      const remaining = 1 - easeOutCubic(progress);

      setRotation(from.x * remaining, from.y * remaining);

      if (progress < 1) resetFrameRef.current = requestAnimationFrame(step);
    };

    resetFrameRef.current = requestAnimationFrame(step);
  };

  return (
    <div
      ref={elementRef}
      className={cn('elyri-tilt', isActive && 'elyri-tilt--active', className)}
      style={{ '--elyri-tilt-perspective': `${perspective}px` } as CSSProperties}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      {children}
      {glare && <span className="elyri-tilt__glare" aria-hidden="true" />}
    </div>
  );
}
