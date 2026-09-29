import type { InputHTMLAttributes } from 'react';

import { cn } from '../../../core';

import './Input.css';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 控件尺寸，默认 md */
  size?: InputSize;
  /** 校验失败态：红框并标记 aria-invalid */
  invalid?: boolean;
}

/** 输入框：三档尺寸，支持校验失败态，其余属性透传给原生 input */
export function Input({ size = 'md', invalid = false, className, ...rest }: InputProps) {
  return (
    <input
      className={cn('elyri-ui-input', `elyri-ui-input--${size}`, invalid && 'is-invalid', className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}
