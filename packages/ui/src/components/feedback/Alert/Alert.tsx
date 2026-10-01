import type { HTMLAttributes, ReactNode } from 'react';

import { StatusIcon, cn } from '../../../core';

import './Alert.css';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** 语义与配色，默认 info */
  variant?: AlertVariant;
  /** 标题，省略则只显示描述 */
  title?: ReactNode;
  /** 自定义图标，省略时显示随 variant 变化的状态图标；传 null 隐藏 */
  icon?: ReactNode;
  /** 右侧操作区 */
  action?: ReactNode;
  /** 传入后显示关闭按钮 */
  onClose?: () => void;
  /** 关闭按钮的无障碍名称，默认 Dismiss */
  closeLabel?: string;
  /** 是否显示边框，默认 true */
  bordered?: boolean;
  /** 是否使用强调色（图标着色与背景染色），默认 true */
  accent?: boolean;
}

/** 提示条：四种语义配色，可带标题、图标、操作与关闭按钮 */
export function Alert({
  variant = 'info',
  title,
  icon,
  action,
  onClose,
  closeLabel = 'Dismiss',
  bordered = true,
  accent = true,
  className,
  children,
  role,
  ...rest
}: AlertProps) {
  const iconNode = icon === undefined ? <StatusIcon variant={variant} /> : icon;

  return (
    <div
      role={role ?? (variant === 'danger' ? 'alert' : 'status')}
      className={cn('elyri-ui-alert', `elyri-ui-alert--${variant}`, className)}
      data-bordered={bordered ? undefined : 'false'}
      data-accent={accent ? undefined : 'false'}
      {...rest}
    >
      {iconNode && (
        <span className="elyri-ui-alert__icon" aria-hidden="true">
          {iconNode}
        </span>
      )}

      <div className="elyri-ui-alert__body">
        {title && <div className="elyri-ui-alert__title">{title}</div>}
        {children && <div className="elyri-ui-alert__message">{children}</div>}
      </div>

      {action && <div className="elyri-ui-alert__action">{action}</div>}

      {onClose && (
        <button type="button" className="elyri-ui-alert__close" onClick={onClose} aria-label={closeLabel}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      )}
    </div>
  );
}
