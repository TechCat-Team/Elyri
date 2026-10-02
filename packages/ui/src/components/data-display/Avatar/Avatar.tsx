import { forwardRef, useState } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../../core';

import { useAvatarGroup } from './AvatarContext';

import './Avatar.css';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarShape = 'circle' | 'square';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';
export type AvatarFit = 'cover' | 'contain';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** 图片地址；未提供或加载失败时回退到首字母 / 自定义内容 */
  src?: string;
  /** 图片替代文本，同时作为无障碍名称，优先于 name */
  alt?: string;
  /** 用户名：用于生成首字母回退与稳定配色 */
  name?: string;
  /** 尺寸，默认 md；在 AvatarGroup 内可省略以继承分组尺寸 */
  size?: AvatarSize;
  /** 形状，默认 circle；在 AvatarGroup 内可省略以继承分组形状 */
  shape?: AvatarShape;
  /** 图片填充方式：cover 铺满裁切（默认），contain 缩小居中完整显示，适合 logo */
  fit?: AvatarFit;
  /** 右下角在线状态圆点 */
  status?: AvatarStatus;
  /** 自定义回退内容（如图标），优先级高于首字母 */
  fallback?: ReactNode;
}

/** 由姓名生成首字母：英文取首字母，中日韩取前两字 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  if (parts.length === 1) {
    const single = parts[0];
    return /[\u3400-\u9fff]/.test(single) ? single.slice(0, 2) : single.slice(0, 1).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** 由姓名推导稳定色相，保证同一用户配色一致 */
function getHue(name: string): number | undefined {
  if (!name) return undefined;
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 360;
  }
  return hash;
}

function UserGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0Z" />
    </svg>
  );
}

/** 头像：图片 + 首字母回退，可选形状、尺寸与在线状态 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, alt, name, size, shape, fit, status, fallback, className, style, ...rest },
  ref,
) {
  const group = useAvatarGroup();
  const resolvedSize = size ?? group?.size ?? 'md';
  const resolvedShape = shape ?? group?.shape ?? 'circle';

  // 记录加载失败的地址而非布尔值：换图后自动恢复尝试，无需在 effect 中重置
  const [failedSrc, setFailedSrc] = useState<string>();
  const failed = src != null && failedSrc === src;

  const showImage = Boolean(src) && !failed;
  // name / alt 决定无障碍名称，同时控制图片与首字母是否对读屏隐藏，避免重复朗读
  const label = alt ?? name;
  const initials = name ? getInitials(name) : '';
  const hue = getHue(name ?? '');

  return (
    <span
      ref={ref}
      role={label ? 'img' : undefined}
      aria-label={label}
      data-fit={fit === 'contain' ? 'contain' : undefined}
      className={cn(
        'elyri-ui-avatar',
        `elyri-ui-avatar--${resolvedSize}`,
        `elyri-ui-avatar--${resolvedShape}`,
        className,
      )}
      style={hue != null ? ({ '--elyri-ui-avatar-hue': hue, ...style } as CSSProperties) : style}
      {...rest}
    >
      <span className="elyri-ui-avatar__media" aria-hidden={label ? 'true' : undefined}>
        {showImage ? (
          <img className="elyri-ui-avatar__img" src={src} alt="" onError={() => setFailedSrc(src)} />
        ) : (
          <span className="elyri-ui-avatar__fallback" data-hue={hue != null ? 'true' : undefined}>
            {fallback ?? (initials || <UserGlyph />)}
          </span>
        )}
      </span>
      {status && <span className="elyri-ui-avatar__status" data-status={status} aria-hidden="true" />}
    </span>
  );
});
