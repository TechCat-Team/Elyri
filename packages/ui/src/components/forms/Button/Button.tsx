import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../../../core';

import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 视觉样式，默认 primary */
  variant?: ButtonVariant;
  /** 控件尺寸，默认 md */
  size?: ButtonSize;
  /** 加载中：显示 spinner、置为禁用并标记 aria-busy */
  loading?: boolean;
}

/** 按钮：四种样式、三档尺寸，加载态内置 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn('elyri-ui-button', `elyri-ui-button--${variant}`, `elyri-ui-button--${size}`, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="elyri-ui-button__spinner" aria-hidden="true" />}
      {children}
    </button>
  );
});
