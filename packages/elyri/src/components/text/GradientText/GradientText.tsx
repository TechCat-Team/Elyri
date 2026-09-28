import type { CSSProperties, ReactNode } from 'react';

import { cn } from '../../../core';

import './GradientText.css';

export interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animated?: boolean;
  /** 流动动画速度倍率 */
  speed?: number;
}

export function GradientText({ children, className, colors, animated = true, speed = 0.5 }: GradientTextProps) {
  const style = {
    ...(colors?.length ? { '--elyri-gradient-colors': colors.join(', ') } : null),
    '--elyri-gradient-speed': speed,
  } as CSSProperties;

  return (
    <span className={cn('elyri-gradient-text', animated && 'elyri-gradient-text--animated', className)} style={style}>
      {children}
    </span>
  );
}
