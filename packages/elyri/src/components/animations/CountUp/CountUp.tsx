import { useEffect, useRef, useState } from 'react';

import { cn, usePrefersReducedMotion } from '../../../core';

import './CountUp.css';

export interface CountUpProps {
  className?: string;
  /** 目标数值 */
  to: number;
  /** 起始数值 */
  from?: number;
  /** 动画时长（毫秒） */
  duration?: number;
  /** 保留的小数位数 */
  decimals?: number;
  /** 是否使用千分位分隔符 */
  separator?: boolean;
  /** 数字前缀 */
  prefix?: string;
  /** 数字后缀 */
  suffix?: string;
  /** 是否只在首次进入视口时播放 */
  once?: boolean;
}

const group = (value: string) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3;

/** 数字滚动：进入视口时从起始值过渡到目标值 */
export function CountUp({
  className,
  to,
  from = 0,
  duration = 1200,
  decimals = 0,
  separator = false,
  prefix,
  suffix,
  once = true,
}: CountUpProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(from);
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

  useEffect(() => {
    if (!isIntersecting || prefersReducedMotion) return;

    let frame = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = duration > 0 ? Math.min((now - startedAt) / duration, 1) : 1;
      setValue(from + (to - from) * easeOutCubic(progress));

      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [isIntersecting, from, to, duration, prefersReducedMotion]);

  const fixed = (prefersReducedMotion ? to : value).toFixed(decimals);
  const [integer, fraction] = fixed.split('.');
  const grouped = separator ? group(integer) : integer;
  const display = fraction ? `${grouped}.${fraction}` : grouped;

  return (
    <span ref={elementRef} className={cn('elyri-count-up', className)}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
