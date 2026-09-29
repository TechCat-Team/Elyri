import type { ButtonHTMLAttributes } from 'react';

import { cn, useControllableState } from '../../../core';

import './Switch.css';

export type SwitchSize = 'sm' | 'md';

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value'> {
  /** 受控选中状态 */
  checked?: boolean;
  /** 非受控初始状态，默认 false */
  defaultChecked?: boolean;
  /** 选中状态变化回调，受控与非受控都会触发 */
  onCheckedChange?: (checked: boolean) => void;
  /** 控件尺寸，默认 md */
  size?: SwitchSize;
}

/** 开关：受控 / 非受控双支持，空格与回车键切换（原生 button 语义） */
export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  size = 'md',
  className,
  disabled,
  onClick,
  ...rest
}: SwitchProps) {
  const [isChecked, setChecked] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      disabled={disabled}
      className={cn('elyri-ui-switch', `elyri-ui-switch--${size}`, className)}
      {...rest}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setChecked(!isChecked);
      }}
    >
      <span className="elyri-ui-switch__thumb" aria-hidden="true" />
    </button>
  );
}
