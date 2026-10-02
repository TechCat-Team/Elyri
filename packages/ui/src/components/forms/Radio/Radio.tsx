import { createContext, forwardRef, useContext, useId, useMemo } from 'react';
import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

import { cn, useField, useFieldControlId } from '../../../core';

import './Radio.css';

interface RadioGroupContextValue {
  /** 同名是原生箭头键循环切换的前提，未传时自动生成 */
  name: string;
  /** 受控值：选中对应 value 的 Radio */
  value?: string;
  /** 非受控初始值 */
  defaultValue?: string;
  /** 选中值变化回调，受控与非受控都会触发 */
  onValueChange?: (value: string) => void;
  /** 组级禁用，Radio 未显式传 disabled 时生效 */
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

const useRadioGroupContext = () => {
  const context = useContext(RadioGroupContext);
  if (!context) throw new Error('Radio 必须放在 <RadioGroup> 内使用');
  return context;
};

export type RadioGroupOrientation = 'horizontal' | 'vertical';

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** 受控选中值 */
  value?: string;
  /** 非受控初始值 */
  defaultValue?: string;
  /** 选中值变化回调 */
  onValueChange?: (value: string) => void;
  /** 单选按钮的 name，未传时自动生成（原生箭头键导航依赖同名） */
  name?: string;
  /** 排列方向，默认 horizontal */
  orientation?: RadioGroupOrientation;
  /** 组级禁用 */
  disabled?: boolean;
  children?: ReactNode;
}

/** 单选组：同名原生 radio 承载箭头键循环切换，放入 Field 可自动关联 label 与描述 */
function RadioGroupRoot({
  value,
  defaultValue,
  onValueChange,
  name: nameProp,
  orientation = 'horizontal',
  disabled,
  className,
  id,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  children,
  ...rest
}: RadioGroupProps) {
  const field = useField();
  useFieldControlId(id);
  const generated = useId();
  const name = nameProp ?? generated;
  const describedBy = [ariaDescribedBy, ...(field?.describedIds ?? [])].filter(Boolean).join(' ') || undefined;

  const context = useMemo<RadioGroupContextValue>(
    () => ({ name, value, defaultValue, onValueChange, disabled: disabled ?? field?.disabled }),
    [name, value, defaultValue, onValueChange, disabled, field?.disabled],
  );

  return (
    <div
      role="radiogroup"
      id={id ?? field?.controlId}
      aria-orientation={orientation}
      aria-labelledby={ariaLabelledBy ?? field?.labelId}
      aria-describedby={describedBy}
      aria-required={field?.required || undefined}
      aria-invalid={field?.invalid || undefined}
      data-orientation={orientation}
      className={cn('elyri-ui-radio-group', className)}
      {...rest}
    >
      <RadioGroupContext.Provider value={context}>{children}</RadioGroupContext.Provider>
    </div>
  );
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'checked'> {
  /** 该选项的值，选中时回调给 RadioGroup 的 onValueChange */
  value: string;
  /** 作为标签文案渲染在单选按钮右侧，点击文案即可切换 */
  children?: ReactNode;
}

/** 单选按钮：视觉隐藏的原生 input 承载键盘与表单行为，自绘选中圆点 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { value, className, id, disabled, children, ...rest },
  ref,
) {
  const group = useRadioGroupContext();
  const field = useField();
  const isControlled = group.value !== undefined;
  const isInvalid = field?.invalid === true;

  return (
    <label
      className={cn('elyri-ui-radio', isInvalid && 'is-invalid', className)}
      data-disabled={group.disabled || disabled || undefined}
    >
      <input
        ref={ref}
        type="radio"
        name={group.name}
        value={value}
        id={id}
        checked={isControlled ? group.value === value : undefined}
        defaultChecked={isControlled ? undefined : group.defaultValue === value}
        disabled={disabled ?? group.disabled}
        className="elyri-ui-radio__input"
        {...rest}
        onChange={(event) => {
          if (event.target.checked) group.onValueChange?.(value);
        }}
      />
      <span className="elyri-ui-radio__dot" aria-hidden="true" />
      {children !== undefined && children !== null && <span className="elyri-ui-radio__text">{children}</span>}
    </label>
  );
});

export const RadioGroup = Object.assign(RadioGroupRoot, { Radio });
