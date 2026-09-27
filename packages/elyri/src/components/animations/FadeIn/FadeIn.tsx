import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion';
import { cn } from '../../../utils/cn';

import './FadeIn.css';

export type FadeInDirection = 'up' | 'down' | 'left' | 'right' | 'none';

export interface FadeInProps {
  children: ReactNode;
  className?: string;
  direction?: FadeInDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
}

export function FadeIn({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = 600,
  distance = 24,
  once = true,
}: FadeInProps) {
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
    '--elyri-fade-in-delay': `${delay}ms`,
    '--elyri-fade-in-duration': `${duration}ms`,
    '--elyri-fade-in-distance': `${distance}px`,
  } as CSSProperties;

  const isVisible = prefersReducedMotion || isIntersecting;

  return (
    <div
      ref={elementRef}
      className={cn('elyri-fade-in', `elyri-fade-in--${direction}`, isVisible && 'elyri-fade-in--visible', className)}
      style={style}
    >
      {children}
    </div>
  );
}
