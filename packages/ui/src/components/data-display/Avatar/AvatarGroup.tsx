import { Children, forwardRef, useMemo } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '../../../core';

import type { AvatarShape, AvatarSize } from './Avatar';
import { AvatarGroupContext } from './AvatarContext';

import './Avatar.css';

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** 最多展示的头像数量，超出显示 +N；省略则全部展示 */
  max?: number;
  /** 统一尺寸，默认 md，子 Avatar 未显式传 size 时继承 */
  size?: AvatarSize;
  /** 统一形状，默认 circle，子 Avatar 未显式传 shape 时继承 */
  shape?: AvatarShape;
}

/** 头像组：重叠排列，超出 max 时折叠为 +N 计数徽标 */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { max, size, shape, className, children, ...rest },
  ref,
) {
  const items = Children.toArray(children);
  const limit = max != null && max >= 0 ? Math.min(max, items.length) : items.length;
  const overflow = items.length - limit;
  const shown = overflow > 0 ? items.slice(0, limit) : items;
  const context = useMemo(() => ({ size, shape }), [size, shape]);
  const resolvedSize = size ?? 'md';
  const resolvedShape = shape ?? 'circle';

  return (
    <AvatarGroupContext.Provider value={context}>
      <div ref={ref} role="group" className={cn('elyri-ui-avatar-group', className)} {...rest}>
        {shown}
        {overflow > 0 && (
          <span
            className={cn(
              'elyri-ui-avatar',
              'elyri-ui-avatar--count',
              `elyri-ui-avatar--${resolvedSize}`,
              `elyri-ui-avatar--${resolvedShape}`,
            )}
          >
            +{overflow}
          </span>
        )}
      </div>
    </AvatarGroupContext.Provider>
  );
});
