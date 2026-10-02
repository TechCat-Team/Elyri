import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '../../../core';

import './ButtonGroup.css';

export type ButtonGroupOrientation = 'horizontal' | 'vertical';

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** 排列方向，默认 horizontal */
  orientation?: ButtonGroupOrientation;
  /** 按钮首尾相接成一体（分段控件外观），默认 true；false 时按钮之间保留间距 */
  attached?: boolean;
}

/**
 * 按钮组：把相邻的 Button 拼成一体，仅保留最外侧圆角，并在相邻处画一条淡分隔线；
 * 通过 data-orientation / data-attached 控制方向与拼接方式，其余属性透传给原生 div。
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { orientation = 'horizontal', attached = true, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="group"
      data-orientation={orientation}
      data-attached={attached ? 'true' : 'false'}
      className={cn('elyri-ui-button-group', className)}
      {...rest}
    >
      {children}
    </div>
  );
});
