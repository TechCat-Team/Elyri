import { forwardRef, useEffect, useRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

import { cn, useControllableState, useField, useFieldControlId } from '../../../core';

import './Checkbox.css';

export type CheckboxSize = 'sm' | 'md';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange' | 'checked' | 'size'
> {
  /** 受控选中状态 */
  checked?: boolean;
  /** 非受控初始状态，默认 false */
  defaultChecked?: boolean;
  /** 选中状态变化回调，受控与非受控都会触发 */
  onCheckedChange?: (checked: boolean) => void;
  /** 半选态：显示为横线并标记 aria-checked="mixed"，常见于「全选」场景 */
  indeterminate?: boolean;
  /** 控件尺寸，默认 md */
  size?: CheckboxSize;
  /** 作为标签文案渲染在复选框右侧，点击文案即可切换 */
  children?: ReactNode;
}

/** 复选框：视觉隐藏的原生 input 承载键盘与表单行为，自绘勾选 / 半选图形 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    checked,
    defaultChecked = false,
    onCheckedChange,
    indeterminate = false,
    size = 'md',
    className,
    id,
    disabled,
    required,
    children,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const field = useField();
  useFieldControlId(id);
  const innerRef = useRef<HTMLInputElement | null>(null);
  const [isChecked, setChecked] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });
  const isDisabled = disabled ?? field?.disabled;
  const isInvalid = field?.invalid === true;
  const isRequired = required ?? field?.required;
  // Field 已带 Label 时，控件自身文案只作展示，避免与外部 label 重复命名
  const hideTextFromName = field?.hasLabel === true;
  const describedBy = [ariaDescribedBy, ...(field?.describedIds ?? [])].filter(Boolean).join(' ') || undefined;

  // indeterminate 只能通过 DOM 属性设置，React 不认这个 prop
  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label
      className={cn('elyri-ui-checkbox', `elyri-ui-checkbox--${size}`, isInvalid && 'is-invalid', className)}
      data-disabled={isDisabled || undefined}
    >
      <input
        ref={(node) => {
          innerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        type="checkbox"
        id={id ?? field?.controlId}
        checked={isChecked}
        disabled={isDisabled}
        required={isRequired}
        aria-checked={indeterminate ? 'mixed' : undefined}
        aria-invalid={isInvalid || undefined}
        aria-describedby={describedBy}
        className="elyri-ui-checkbox__input"
        {...rest}
        onChange={(event) => {
          // 真实浏览器不会在禁用态派发，这里兜底 jsdom 等合成事件环境
          if (!isDisabled) setChecked(event.target.checked);
          // 浏览器点击会清除 indeterminate，按 prop 重新同步，避免 DOM 与受控值脱节
          if (innerRef.current) innerRef.current.indeterminate = indeterminate;
        }}
      />
      <span className="elyri-ui-checkbox__box" aria-hidden="true">
        {isChecked ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12.5l4.5 4.5L19 7" />
          </svg>
        ) : indeterminate ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
            <path d="M6 12h12" />
          </svg>
        ) : null}
      </span>
      {children !== undefined && children !== null && (
        <span className="elyri-ui-checkbox__text" aria-hidden={hideTextFromName || undefined}>
          {children}
        </span>
      )}
    </label>
  );
});
