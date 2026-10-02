import type { HTMLAttributes } from 'react';

import { cn } from '../../../core';

import './Tag.css';

export type TagVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
export type TagSize = 'sm' | 'md';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** 视觉样式，默认 neutral */
  variant?: TagVariant;
  /** 控件尺寸，默认 md */
  size?: TagSize;
  /** 是否显示边框，默认 true */
  bordered?: boolean;
}

/** 标签：用于状态、分类与计数 */
export function Tag({ variant = 'neutral', size = 'md', bordered = true, className, ...rest }: TagProps) {
  return (
    <span
      className={cn('elyri-ui-tag', `elyri-ui-tag--${variant}`, `elyri-ui-tag--${size}`, className)}
      data-bordered={bordered ? undefined : 'false'}
      {...rest}
    />
  );
}
