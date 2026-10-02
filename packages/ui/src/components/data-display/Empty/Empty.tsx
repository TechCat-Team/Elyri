import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../../core';

import './Empty.css';

export type EmptyVariant = 'default' | 'search' | 'inbox';
export type EmptySize = 'sm' | 'md' | 'lg';

export interface EmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** 内置插画：default 文档 / search 搜索无结果 / inbox 空收件箱，默认 default */
  variant?: EmptyVariant;
  /** 尺寸，默认 md */
  size?: EmptySize;
  /** 自定义插画，覆盖内置插画；传 null 隐藏 */
  image?: ReactNode;
  /** 标题 */
  title?: ReactNode;
  /** 底部操作区 */
  action?: ReactNode;
}

/** 四角星，用作插画点缀 */
const sparkle = (x: number, y: number, s: number) =>
  `M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z`;

function Paper({ x, y }: { x: number; y: number }) {
  return (
    <>
      <rect className="elyri-ui-empty__paper" x={x} y={y} width="56" height="72" rx="8" />
      <rect className="elyri-ui-empty__accent" x={x + 10} y={y + 14} width="24" height="5" rx="2.5" />
      <rect className="elyri-ui-empty__line" x={x + 10} y={y + 26} width="36" height="4" rx="2" />
      <rect className="elyri-ui-empty__line" x={x + 10} y={y + 35} width="28" height="4" rx="2" />
      <rect className="elyri-ui-empty__line" x={x + 10} y={y + 44} width="32" height="4" rx="2" />
    </>
  );
}

function Illustration({ variant }: { variant: EmptyVariant }) {
  return (
    <svg viewBox="0 0 160 128" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
      <circle className="elyri-ui-empty__backdrop" cx="80" cy="62" r="50" />
      <ellipse className="elyri-ui-empty__shadow" cx="80" cy="114" rx="40" ry="5" />

      {variant === 'default' && (
        <>
          <rect
            className="elyri-ui-empty__paper elyri-ui-empty__paper--muted"
            x="50"
            y="28"
            width="56"
            height="72"
            rx="8"
            transform="rotate(-10 78 64)"
          />
          <g className="elyri-ui-empty__float">
            <Paper x={56} y={32} />
          </g>
        </>
      )}

      {variant === 'search' && (
        <>
          <Paper x={42} y={30} />
          <g className="elyri-ui-empty__float">
            <circle className="elyri-ui-empty__lens" cx="102" cy="74" r="16" />
            <path className="elyri-ui-empty__handle" d="M113.5 85.5 126 98" />
          </g>
        </>
      )}

      {variant === 'inbox' && (
        <>
          <path className="elyri-ui-empty__paper elyri-ui-empty__paper--muted" d="M36 70 52 50h56l16 20Z" />
          <g className="elyri-ui-empty__float">
            <rect className="elyri-ui-empty__paper" x="58" y="26" width="44" height="48" rx="6" />
            <rect className="elyri-ui-empty__accent" x="66" y="36" width="18" height="4" rx="2" />
            <rect className="elyri-ui-empty__line" x="66" y="45" width="28" height="4" rx="2" />
            <rect className="elyri-ui-empty__line" x="66" y="54" width="22" height="4" rx="2" />
          </g>
          <path
            className="elyri-ui-empty__paper"
            d="M36 70h26a4 4 0 0 1 4 4v1a6 6 0 0 0 6 6h16a6 6 0 0 0 6-6v-1a4 4 0 0 1 4-4h26v26a8 8 0 0 1-8 8H44a8 8 0 0 1-8-8Z"
          />
        </>
      )}

      <path className="elyri-ui-empty__sparkle" d={sparkle(30, 34, 6)} />
      <path className="elyri-ui-empty__sparkle elyri-ui-empty__sparkle--late" d={sparkle(132, 40, 4.5)} />
      <circle className="elyri-ui-empty__dot" cx="122" cy="18" r="2.5" />
      <circle className="elyri-ui-empty__dot" cx="34" cy="90" r="2" />
    </svg>
  );
}

/** 空状态：内置三款插画，可带标题、描述与操作，也可替换为自定义图像 */
export function Empty({
  variant = 'default',
  size = 'md',
  image,
  title,
  action,
  className,
  children,
  ...rest
}: EmptyProps) {
  const imageNode = image === undefined ? <Illustration variant={variant} /> : image;

  return (
    <div className={cn('elyri-ui-empty', `elyri-ui-empty--${size}`, className)} {...rest}>
      {imageNode && (
        <div className="elyri-ui-empty__image" aria-hidden="true">
          {imageNode}
        </div>
      )}
      {title && <div className="elyri-ui-empty__title">{title}</div>}
      {children && <div className="elyri-ui-empty__description">{children}</div>}
      {action && <div className="elyri-ui-empty__action">{action}</div>}
    </div>
  );
}
