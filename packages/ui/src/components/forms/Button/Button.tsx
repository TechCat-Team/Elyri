import { forwardRef, useEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../../../core';

import './Button.css';

/** 与 CSS 中 spinner 收起动画时长保持一致，动画播完再卸载 */
const SPINNER_EXIT_MS = 200;

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
  // loading 结束时先收起再卸载，避免 spinner 瞬间消失
  const [exiting, setExiting] = useState(false);
  const wasLoading = useRef(loading);
  if (wasLoading.current !== loading) {
    wasLoading.current = loading;
    if (!loading) setExiting(true);
  }

  useEffect(() => {
    if (!exiting) return;
    const timer = setTimeout(() => setExiting(false), SPINNER_EXIT_MS);
    return () => clearTimeout(timer);
  }, [exiting]);

  return (
    <button
      ref={ref}
      type="button"
      className={cn('elyri-ui-button', `elyri-ui-button--${variant}`, `elyri-ui-button--${size}`, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {(loading || exiting) && (
        <span
          className={cn(
            'elyri-ui-button__spinner',
            Boolean(children) && 'elyri-ui-button__spinner--labeled',
            exiting && 'elyri-ui-button__spinner--leaving',
          )}
          aria-hidden="true"
        >
          <svg viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" />
          </svg>
        </span>
      )}
      {children}
    </button>
  );
});
