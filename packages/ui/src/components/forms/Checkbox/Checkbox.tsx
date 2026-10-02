import { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

import { cn, useControllableState, useField, useFieldControlId } from '../../../core';

import './Checkbox.css';

export type CheckboxSize = 'sm' | 'md';
export type CheckboxGroupOrientation = 'horizontal' | 'vertical';

interface CheckboxGroupContextValue {
  /** 当前选中的选项值集合 */
  selected: string[];
  /** 切换某个选项 */
  toggle: (value: string) => void;
  /** 组级禁用，Checkbox 未显式传 disabled 时生效 */
  disabled?: boolean;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

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
  /** 选项值，放入 CheckboxGroup 时决定该选项是否选中 */
  value?: string;
}

/** 复选框：视觉隐藏的原生 input 承载键盘与表单行为，自绘勾选 / 半选图形 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    checked,
    defaultChecked = false,
    onCheckedChange,
    indeterminate = false,
    size = 'md',
    value,
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
  const group = useContext(CheckboxGroupContext);
  const innerRef = useRef<HTMLInputElement | null>(null);
  const [selfChecked, setSelfChecked] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });
  // 在 CheckboxGroup 内且声明了 value 时，选中态由组统一管理
  const isGrouped = group !== null && value !== undefined;
  const isChecked = isGrouped ? group.selected.includes(value) : selfChecked;
  const isDisabled = disabled ?? group?.disabled ?? field?.disabled;
  const isInvalid = field?.invalid === true;
  const isRequired = required ?? field?.required;
  // Field 已带 Label 时，控件自身文案只作展示，避免与外部 label 重复命名；
  // 组内每个选项的文案是各自的可访问名，不能隐藏
  const hideTextFromName = field?.hasLabel === true && !isGrouped;
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
        value={value}
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
          if (!isDisabled) {
            if (isGrouped) group.toggle(value);
            else setSelfChecked(event.target.checked);
          }
          // 浏览器点击会清除 indeterminate，按 prop 重新同步，避免 DOM 与受控值脱节
          if (innerRef.current) innerRef.current.indeterminate = indeterminate;
        }}
      />
      {/* 两个图形常驻 DOM，靠 data-state 切换 stroke-dashoffset 实现描绘 / 回收动画 */}
      <span
        className="elyri-ui-checkbox__box"
        aria-hidden="true"
        data-state={isChecked ? 'checked' : indeterminate ? 'indeterminate' : 'unchecked'}
      >
        <svg
          className="elyri-ui-checkbox__icon elyri-ui-checkbox__icon--check"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12.5l4.5 4.5L19 7" pathLength={1} />
        </svg>
        <svg
          className="elyri-ui-checkbox__icon elyri-ui-checkbox__icon--dash"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
        >
          <path d="M6 12h12" pathLength={1} />
        </svg>
      </span>
      {children !== undefined && children !== null && (
        <span className="elyri-ui-checkbox__text" aria-hidden={hideTextFromName || undefined}>
          {children}
        </span>
      )}
    </label>
  );
});

export interface CheckboxGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** 受控选中项集合 */
  value?: string[];
  /** 非受控初始选中项集合 */
  defaultValue?: string[];
  /** 选中项变化回调，受控与非受控都会触发 */
  onValueChange?: (value: string[]) => void;
  /** 排列方向，默认 horizontal */
  orientation?: CheckboxGroupOrientation;
  /** 组级禁用 */
  disabled?: boolean;
  children?: ReactNode;
}

/** 复选组：统一管理多选值，放入 Field 可自动关联 label 与描述 */
function CheckboxGroupRoot({
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  disabled,
  className,
  id,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  children,
  ...rest
}: CheckboxGroupProps) {
  const field = useField();
  useFieldControlId(id);
  const [selected, setSelected] = useControllableState<string[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange: onValueChange,
  });
  const describedBy = [ariaDescribedBy, ...(field?.describedIds ?? [])].filter(Boolean).join(' ') || undefined;

  const toggle = useCallback(
    (item: string) => {
      setSelected(selected.includes(item) ? selected.filter((current) => current !== item) : [...selected, item]);
    },
    [selected, setSelected],
  );

  const context = useMemo<CheckboxGroupContextValue>(
    () => ({ selected, toggle, disabled: disabled ?? field?.disabled }),
    [selected, toggle, disabled, field?.disabled],
  );

  return (
    <div
      role="group"
      id={id ?? field?.controlId}
      aria-labelledby={ariaLabelledBy ?? field?.labelId}
      aria-describedby={describedBy}
      data-orientation={orientation}
      className={cn('elyri-ui-checkbox-group', className)}
      {...rest}
    >
      <CheckboxGroupContext.Provider value={context}>{children}</CheckboxGroupContext.Provider>
    </div>
  );
}

export const CheckboxGroup = Object.assign(CheckboxGroupRoot, { Checkbox });
