import type { HTMLAttributes } from 'react';

import { cn } from '../../../core';

import './Skeleton.css';

export type SkeletonShape = 'text' | 'rect' | 'circle';
export type SkeletonAnimation = 'shimmer' | 'pulse' | 'none';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** 形状，默认 text */
  shape?: SkeletonShape;
  /** 宽度，数字按 px 处理；circle 只需传一个尺寸 */
  width?: number | string;
  /** 高度，数字按 px 处理 */
  height?: number | string;
  /** 文本行数，仅 text 生效，默认 1；多行时末行收短 */
  lines?: number;
  /** 动画，默认 shimmer */
  animation?: SkeletonAnimation;
  /** 为 false 时直接渲染 children，默认 true */
  loading?: boolean;
}

const toSize = (value?: number | string) => (typeof value === 'number' ? `${value}px` : value);

/** 骨架屏：内容加载前的占位，支持文本 / 矩形 / 圆形与流光 / 呼吸动画 */
export function Skeleton({
  shape = 'text',
  width,
  height,
  lines = 1,
  animation = 'shimmer',
  loading = true,
  className,
  style,
  children,
  ...rest
}: SkeletonProps) {
  if (!loading) return <>{children}</>;

  const pieceClass = cn('elyri-ui-skeleton', `elyri-ui-skeleton--${shape}`, `elyri-ui-skeleton--${animation}`);

  if (shape === 'text' && lines > 1) {
    return (
      <div
        aria-hidden="true"
        className={cn('elyri-ui-skeleton-lines', className)}
        style={{ width: toSize(width), ...style }}
        {...rest}
      >
        {Array.from({ length: lines }, (_, index) => (
          <span key={index} className={pieceClass} style={{ height: toSize(height) }} />
        ))}
      </div>
    );
  }

  // circle 宽高一致，传任意一个即可
  const circleSize = shape === 'circle' ? toSize(width ?? height) : undefined;

  return (
    <div
      aria-hidden="true"
      className={cn(pieceClass, className)}
      data-has-children={children == null ? undefined : ''}
      style={{ width: circleSize ?? toSize(width), height: circleSize ?? toSize(height), ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
