import { useEffect, useRef, useState } from 'react';
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
  /** 最少重复份数；实际份数会按容器尺寸自动补足，保证循环无缝 */
  repeat?: number;
  /** 每份内容之间的间距，单位 px */
  gap?: number;
  /** 是否无限重复播放，关闭时只播放一轮 */
  infinite?: boolean;
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
  infinite = true,
  pauseOnHover = true,
}: MarqueeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const minCopies = Math.max(2, Math.floor(repeat));
  const [copies, setCopies] = useState(minCopies);
  const vertical = direction === 'up' || direction === 'down';
  const reverse = direction === 'right' || direction === 'down';

  // 份数不足时轨道会短于容器，循环到末尾会露白；按容器尺寸补足份数
  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    const measure = () => {
      const first = track.firstElementChild as HTMLElement | null;
      if (!first) return;

      const copySize = vertical ? first.offsetHeight : first.offsetWidth;
      const rootSize = vertical ? root.clientHeight : root.clientWidth;
      const trackSize = vertical ? track.offsetHeight : track.offsetWidth;
      if (!copySize) return;

      // 纵向未限制高度时容器与轨道等高、没有可视窗口，保持最小份数
      if (vertical && rootSize >= trackSize) {
        setCopies(minCopies);
        return;
      }

      // 轨道至少覆盖「容器 + 一份内容」，这样每一帧都有内容填满窗口
      setCopies(Math.max(minCopies, Math.ceil((rootSize + copySize) / copySize)));
    };

    const observer = new ResizeObserver(measure);
    observer.observe(root);
    if (track.firstElementChild) observer.observe(track.firstElementChild);
    return () => observer.disconnect();
  }, [vertical, minCopies]);

  // 离开视口或页面切到后台时暂停动画，避免无谓的合成开销与耗电
  useEffect(() => {
    const node = rootRef.current;
    if (!node || prefersReducedMotion) return;

    let inView = true;
    const sync = () => setPaused(!inView || document.hidden);

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    observer.observe(node);
    document.addEventListener('visibilitychange', sync);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [prefersReducedMotion]);

  return (
    <div
      ref={rootRef}
      className={cn(
        'elyri-marquee',
        vertical && 'elyri-marquee--vertical',
        reverse && 'elyri-marquee--reverse',
        !infinite && 'elyri-marquee--once',
        paused && 'elyri-marquee--paused',
        pauseOnHover && 'elyri-marquee--pausable',
        prefersReducedMotion && 'elyri-marquee--static',
        className,
      )}
      style={
        {
          '--elyri-marquee-duration': `${duration}s`,
          '--elyri-marquee-repeat': copies,
          '--elyri-marquee-gap': `${gap}px`,
        } as CSSProperties
      }
    >
      <div ref={trackRef} className="elyri-marquee__track">
        {Array.from({ length: copies }, (_, index) => (
          // 复制份仅用于视觉衔接，对辅助技术隐藏，避免重复朗读
          <div key={index} className="elyri-marquee__copy" aria-hidden={index > 0 ? true : undefined}>
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
