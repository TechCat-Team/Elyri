import type { HTMLAttributes } from 'react';

import { cn } from '../../../core';

import './Badge.css';

export type BadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** 视觉样式，默认 neutral */
  variant?: BadgeVariant;
  /** 控件尺寸，默认 md */
  size?: BadgeSize;
  /** 是否显示边框，默认 true */
  bordered?: boolean;
}

/** 徽标：用于状态、标签与计数 */
export function Badge({ variant = 'neutral', size = 'md', bordered = true, className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn('elyri-ui-badge', `elyri-ui-badge--${variant}`, `elyri-ui-badge--${size}`, className)}
      data-bordered={bordered ? undefined : 'false'}
      {...rest}
    />
  );
}
