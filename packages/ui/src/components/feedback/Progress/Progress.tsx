import type { HTMLAttributes } from 'react';

import { cn } from '../../../core';

import './Progress.css';

export type ProgressVariant = 'accent' | 'success' | 'warning' | 'danger';
export type ProgressSize = 'sm' | 'md';

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 当前值，范围 0–max，默认 0 */
  value?: number;
  /** 最大值，默认 100 */
  max?: number;
  /** 不确定进度：循环动画，不暴露具体数值 */
  indeterminate?: boolean;
  /** 粗细，默认 md */
  size?: ProgressSize;
  /** 颜色，默认 accent */
  variant?: ProgressVariant;
  /** 在右侧显示百分比 */
  showValue?: boolean;
  /** 无障碍名称，建议对屏幕阅读器可见时填写 */
  label?: string;
}

/** 进度条：确定 / 不确定两种形态，四档语义配色 */
export function Progress({
  value = 0,
  max = 100,
  indeterminate = false,
  size = 'md',
  variant = 'accent',
  showValue = false,
  label,
  className,
  ...rest
}: ProgressProps) {
  const clamped = Math.min(Math.max(value, 0), max);
  const percent = max > 0 ? (clamped / max) * 100 : 0;

  return (
    <div
      className={cn('elyri-ui-progress', `elyri-ui-progress--${size}`, `elyri-ui-progress--${variant}`, className)}
      {...rest}
    >
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : max}
        aria-valuenow={indeterminate ? undefined : clamped}
        className={indeterminate ? 'elyri-ui-progress__track is-indeterminate' : 'elyri-ui-progress__track'}
      >
        <div className="elyri-ui-progress__bar" style={indeterminate ? undefined : { width: `${percent}%` }} />
      </div>

      {showValue && !indeterminate && (
        <span className="elyri-ui-progress__value" aria-hidden="true">
          {Math.round(percent)}%
        </span>
      )}
    </div>
  );
}
