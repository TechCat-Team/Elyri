import type { CSSProperties, ReactNode } from 'react';

import { cn } from '../../../utils/cn';

import './GradientText.css';

export interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animated?: boolean;
}

export function GradientText({ children, className, colors, animated = true }: GradientTextProps) {
  const style = colors?.length ? ({ '--elyri-gradient-colors': colors.join(', ') } as CSSProperties) : undefined;

  return (
    <span className={cn('elyri-gradient-text', animated && 'elyri-gradient-text--animated', className)} style={style}>
      {children}
    </span>
  );
}
