import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

import { cn, useField, useFieldControlId } from '../../../core';

import './Input.css';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 控件尺寸，默认 md */
  size?: InputSize;
  /** 校验失败态：红框并标记 aria-invalid；在 Field 内时与 Field 的 invalid 取并集 */
  invalid?: boolean;
}

/** 输入框：三档尺寸，支持校验失败态，其余属性透传给原生 input；放入 Field 可自动关联 label 与描述 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = 'md',
    invalid = false,
    className,
    id,
    disabled,
    required,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const field = useField();
  useFieldControlId(id);
  const isInvalid = invalid || field?.invalid === true;
  const isRequired = required ?? field?.required;
  const describedBy = [ariaDescribedBy, ...(field?.describedIds ?? [])].filter(Boolean).join(' ') || undefined;

  return (
    <input
      ref={ref}
      id={id ?? field?.controlId}
      disabled={disabled ?? field?.disabled}
      required={isRequired}
      className={cn('elyri-ui-input', `elyri-ui-input--${size}`, isInvalid && 'is-invalid', className)}
      aria-invalid={isInvalid || undefined}
      aria-describedby={describedBy}
      {...rest}
    />
  );
});
