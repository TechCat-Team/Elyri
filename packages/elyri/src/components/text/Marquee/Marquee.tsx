import type { CSSProperties, ReactNode } from 'react';

import { cn, usePrefersReducedMotion } from '../../../core';

import './Marquee.css';

export type MarqueeDirection = 'left' | 'right' | 'up' | 'down';

export interface MarqueeProps {
  /** 循环滚动的内容，任意节点，会被复制多份以形成无缝循环 */
  children: ReactNode;
  className?: string;
  /** 滚动方向 */
  direction?: MarqueeDirection;
  /** 跑完一轮所需的秒数，数值越大越慢 */
  duration?: number;
  /** 内容重复份数，内容较窄时可增大以铺满容器 */
  repeat?: number;
  /** 每份内容之间的间距，单位 px */
  gap?: number;
  /** 鼠标悬停时是否暂停 */
  pauseOnHover?: boolean;
}

export function Marquee({
  children,
  className,
  direction = 'left',
  duration = 20,
  repeat = 2,
  gap = 0,
  pauseOnHover = true,
}: MarqueeProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const copyCount = Math.max(2, Math.floor(repeat));
  const vertical = direction === 'up' || direction === 'down';
  const reverse = direction === 'right' || direction === 'down';

  return (
    <div
      className={cn(
        'elyri-marquee',
        vertical && 'elyri-marquee--vertical',
        reverse && 'elyri-marquee--reverse',
        pauseOnHover && 'elyri-marquee--pausable',
        prefersReducedMotion && 'elyri-marquee--static',
        className,
      )}
      style={
        {
          '--elyri-marquee-duration': `${duration}s`,
          '--elyri-marquee-repeat': copyCount,
          '--elyri-marquee-gap': `${gap}px`,
        } as CSSProperties
      }
    >
      <div className="elyri-marquee__track">
        {Array.from({ length: copyCount }, (_, index) => (
          // 复制份仅用于视觉衔接，对辅助技术隐藏，避免重复朗读
          <div key={index} className="elyri-marquee__copy" aria-hidden={index > 0 ? true : undefined}>
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
