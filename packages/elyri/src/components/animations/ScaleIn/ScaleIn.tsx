import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { cn, usePrefersReducedMotion } from '../../../core';

import './ScaleIn.css';

export interface ScaleInProps {
  children: ReactNode;
  className?: string;
  /** 起始缩放比例 */
  from?: number;
  /** 延迟（毫秒） */
  delay?: number;
  /** 动画时长（毫秒） */
  duration?: number;
  /** 是否只在首次进入视口时触发 */
  once?: boolean;
}

export function ScaleIn({ children, className, from = 0.9, delay = 0, duration = 600, once = true }: ScaleInProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (once) observer.disconnect();
          return;
        }

        if (!once) setIsIntersecting(false);
      },
      { threshold: 0.1 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [once, prefersReducedMotion]);

  const style = {
    '--elyri-scale-in-from': from,
    '--elyri-scale-in-delay': `${delay}ms`,
    '--elyri-scale-in-duration': `${duration}ms`,
  } as CSSProperties;

  const isVisible = prefersReducedMotion || isIntersecting;

  return (
    <div
      ref={elementRef}
      className={cn('elyri-scale-in', isVisible && 'elyri-scale-in--visible', className)}
      style={style}
    >
      {children}
    </div>
  );
}
