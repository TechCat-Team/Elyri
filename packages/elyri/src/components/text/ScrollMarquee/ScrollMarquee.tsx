import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';

import { cn, usePrefersReducedMotion } from '../../../core';

import './ScrollMarquee.css';

export type ScrollMarqueeDirection = 'left' | 'right';

export interface ScrollMarqueeProps {
  /** 需要滚动的文本，仅支持纯字符串 */
  children: string;
  className?: string;
  /** 滚动方向 */
  direction?: ScrollMarqueeDirection;
  /** 页面每滚动 1px，文字横向移动的像素数 */
  speed?: number;
  /** 行数，相邻两行方向相反 */
  rows?: number;
  /** 内容重复份数，用于铺满并实现无缝循环 */
  repeat?: number;
}

export function ScrollMarquee({
  children,
  className,
  direction = 'left',
  speed = 0.5,
  rows = 1,
  repeat = 6,
}: ScrollMarqueeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const firstCopyRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion) return;

    let frame = 0;

    const update = () => {
      frame = 0;

      // 单份内容的宽度即循环周期，按它取模即可无缝衔接
      const copyWidth = firstCopyRef.current?.offsetWidth ?? 0;
      if (!copyWidth) return;

      const shift = -((window.scrollY * speed) % copyWidth);
      root.style.setProperty('--elyri-scroll-marquee-shift', `${shift}px`);
      root.style.setProperty('--elyri-scroll-marquee-copy-width', `${copyWidth}px`);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [prefersReducedMotion, speed, rows, repeat]);

  const rowCount = Math.max(1, Math.floor(rows));
  const copyCount = Math.max(1, Math.floor(repeat));
  const baseDirection = direction === 'left' ? 1 : -1;

  return (
    <div ref={rootRef} className={cn('elyri-scroll-marquee', className)}>
      {Array.from({ length: rowCount }, (_, rowIndex) => {
        const dir = rowIndex % 2 === 0 ? baseDirection : -baseDirection;

        return (
          <div
            key={rowIndex}
            className="elyri-scroll-marquee__row"
            style={
              {
                '--elyri-scroll-marquee-dir': dir,
                // 向右滚动时先整体左移一份内容宽度，避免左侧露白
                '--elyri-scroll-marquee-base': dir === 1 ? 0 : -1,
              } as CSSProperties
            }
          >
            {Array.from({ length: copyCount }, (_, copyIndex) => (
              <span
                key={copyIndex}
                ref={rowIndex === 0 && copyIndex === 0 ? firstCopyRef : undefined}
                className="elyri-scroll-marquee__copy"
              >
                {children}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}
