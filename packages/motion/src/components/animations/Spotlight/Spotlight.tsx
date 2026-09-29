import { useEffect, useRef } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react';

import { cn } from '../../../core';

import './Spotlight.css';

export interface SpotlightProps {
  children: ReactNode;
  className?: string;
  /** 光斑颜色 */
  color?: string;
  /** 光斑半径（像素） */
  size?: number;
  /** 是否显示卡片内部跟随指针的径向光晕 */
  glow?: boolean;
  /** 是否显示指针附近的边框光晕 */
  borderGlow?: boolean;
  /** 卡片圆角（像素） */
  radius?: number;
}

/** 聚光卡片：指针位置泛起径向高光，可选择性地点亮边框；内部元素加 elyri-spotlight__item 可获得同款边框光晕 */
export function Spotlight({
  children,
  className,
  color = '#7c8cff',
  size = 240,
  glow = true,
  borderGlow = true,
  radius = 16,
}: SpotlightProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const itemsRef = useRef<HTMLElement[]>([]);

  useEffect(
    () => () => {
      cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerRef.current = { x: event.clientX, y: event.clientY };

    if (frameRef.current) return;

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;

      const element = elementRef.current;
      const pointer = pointerRef.current;
      if (!element || !pointer) return;

      const rect = element.getBoundingClientRect();
      element.style.setProperty('--elyri-spotlight-x', `${pointer.x - rect.left}px`);
      element.style.setProperty('--elyri-spotlight-y', `${pointer.y - rect.top}px`);

      // 内部组件以自己的边框呈现光晕，需要相对自身的指针坐标
      for (const item of itemsRef.current) {
        const itemRect = item.getBoundingClientRect();
        item.style.setProperty('--elyri-spotlight-x', `${pointer.x - itemRect.left}px`);
        item.style.setProperty('--elyri-spotlight-y', `${pointer.y - itemRect.top}px`);
      }
    });
  };

  const handlePointerEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
    // 悬停期间缓存内部光晕项，避免每帧查询 DOM
    itemsRef.current = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('.elyri-spotlight__item'),
    );
    handlePointerMove(event);
  };

  const style = {
    '--elyri-spotlight-color': color,
    '--elyri-spotlight-size': `${size}px`,
    '--elyri-spotlight-radius': `${radius}px`,
  } as CSSProperties;

  return (
    <div
      ref={elementRef}
      className={cn(
        'elyri-spotlight',
        glow && 'elyri-spotlight--glow',
        borderGlow && 'elyri-spotlight--border',
        className,
      )}
      style={style}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
    >
      <div className="elyri-spotlight__content">{children}</div>
    </div>
  );
}
