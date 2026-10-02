import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../../core';

import './Divider.css';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted' | 'gradient';
export type DividerSpacing = 'none' | 'sm' | 'md' | 'lg';
export type DividerAlign = 'start' | 'center' | 'end';

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  /** 方向，默认 horizontal */
  orientation?: DividerOrientation;
  /** 线型，默认 solid */
  variant?: DividerVariant;
  /** 上下（横向）/ 左右（纵向）留白，默认 md */
  spacing?: DividerSpacing;
  /** 居中文字，仅横向生效 */
  label?: ReactNode;
  /** 文字对齐，默认 center */
  align?: DividerAlign;
}

/** 分割线：横 / 纵两个方向、四种线型，横向可带居中文字 */
export function Divider({
  orientation = 'horizontal',
  variant = 'solid',
  spacing = 'md',
  label,
  align = 'center',
  className,
  children,
  ...rest
}: DividerProps) {
  const content = label ?? children;
  const hasLabel = orientation === 'horizontal' && content != null;

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      aria-label={typeof content === 'string' ? content : undefined}
      data-orientation={orientation}
      data-variant={variant}
      data-spacing={spacing}
      data-align={align}
      data-has-label={hasLabel ? 'true' : undefined}
      className={cn('elyri-ui-divider', className)}
      {...rest}
    >
      {hasLabel ? (
        <>
          <span className="elyri-ui-divider__line" aria-hidden="true" />
          <span className="elyri-ui-divider__label">{content}</span>
          <span className="elyri-ui-divider__line" aria-hidden="true" />
        </>
      ) : (
        <span className="elyri-ui-divider__line" aria-hidden="true" />
      )}
    </div>
  );
}
