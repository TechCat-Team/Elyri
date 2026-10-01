import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

import { cn, useControllableState, useField, useFieldControlId } from '../../../core';

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
  /** 校验失败态：红框并标记 aria-invalid；在 Field 内时与 Field 的 invalid 取并集 */
  invalid?: boolean;
  /** 表单字段名：设置后渲染隐藏 checkbox，使开关状态可随原生表单提交（仅选中时提交 value） */
  name?: string;
  /** 表单提交时的值，配合 name 使用，默认 "on" */
  value?: string;
}

/** 开关：受控 / 非受控双支持，空格与回车键切换（原生 button 语义）；放入 Field 可自动关联 label 与描述 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    checked,
    defaultChecked = false,
    onCheckedChange,
    size = 'md',
    invalid = false,
    className,
    id,
    disabled,
    name,
    value = 'on',
    'aria-describedby': ariaDescribedBy,
    onClick,
    ...rest
  },
  ref,
) {
  const field = useField();
  useFieldControlId(id);
  const [isChecked, setChecked] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });
  const isDisabled = disabled ?? field?.disabled;
  const isInvalid = invalid || field?.invalid === true;
  const describedBy = [ariaDescribedBy, ...(field?.describedIds ?? [])].filter(Boolean).join(' ') || undefined;

  return (
    <>
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={isChecked}
        id={id ?? field?.controlId}
        disabled={isDisabled}
        aria-invalid={isInvalid || undefined}
        aria-describedby={describedBy}
        className={cn('elyri-ui-switch', `elyri-ui-switch--${size}`, isInvalid && 'is-invalid', className)}
        {...rest}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) setChecked(!isChecked);
        }}
      >
        <span className="elyri-ui-switch__thumb" aria-hidden="true" />
      </button>
      {/* button 不是可提交控件，name 存在时用隐藏 checkbox 承载表单值 */}
      {name !== undefined && (
        <input
          type="checkbox"
          name={name}
          value={value}
          checked={isChecked}
          disabled={isDisabled}
          tabIndex={-1}
          aria-hidden="true"
          onChange={() => {}}
          style={{ display: 'none' }}
        />
      )}
    </>
  );
});
