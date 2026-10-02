import { forwardRef, useEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

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
  /** 图标置于文字前，随字号缩放；加载时让位给 spinner */
  leadingIcon?: ReactNode;
  /** 图标置于文字后，随字号缩放；加载时隐藏 */
  trailingIcon?: ReactNode;
  /** 纯图标按钮：去掉左右内边距并压成正方形，需自行提供 aria-label */
  iconOnly?: boolean;
  /** 纯圆形按钮：压成正方形并取满圆角，适合图标操作，需自行提供 aria-label */
  circle?: boolean;
}

/** 按钮：四种样式、三档尺寸，内置加载态，可带前置 / 后置图标，支持纯图标与纯圆形 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    leadingIcon,
    trailingIcon,
    iconOnly = false,
    circle = false,
    disabled,
    className,
    children,
    ...rest
  },
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

  const busy = loading || exiting;
  // 纯图标 / 纯圆形按钮进入加载时，内容让位给 spinner，避免图标与 spinner 挤在一起
  const showContent = !((iconOnly || circle) && busy);

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'elyri-ui-button',
        `elyri-ui-button--${variant}`,
        `elyri-ui-button--${size}`,
        iconOnly && 'elyri-ui-button--icon-only',
        circle && 'elyri-ui-button--circle',
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {(loading || exiting) && (
        <span
          className={cn(
            'elyri-ui-button__spinner',
            Boolean(children) && showContent && 'elyri-ui-button__spinner--labeled',
            exiting && 'elyri-ui-button__spinner--leaving',
          )}
          aria-hidden="true"
        >
          <svg viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" />
          </svg>
        </span>
      )}
      {!busy && leadingIcon != null && (
        <span className="elyri-ui-button__icon" aria-hidden="true">
          {leadingIcon}
        </span>
      )}
      {showContent && children}
      {!busy && trailingIcon != null && (
        <span className="elyri-ui-button__icon" aria-hidden="true">
          {trailingIcon}
        </span>
      )}
    </button>
  );
});
