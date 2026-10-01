import { forwardRef, useState } from 'react';
import type { ChangeEvent, FocusEvent, InputHTMLAttributes, KeyboardEvent } from 'react';

import { cn, useControllableState, useField, useFieldControlId } from '../../../core';

import './NumberInput.css';

export type NumberInputSize = 'sm' | 'md' | 'lg';

export interface NumberInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'size' | 'type'
> {
  /** 受控值，null 表示空 */
  value?: number | null;
  /** 非受控初始值，默认 null */
  defaultValue?: number | null;
  /** 值变化回调，清空且 allowEmpty 时回传 null */
  onValueChange?: (value: number | null) => void;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 步长（含键盘与按钮），默认 1 */
  step?: number;
  /** 尺寸，默认 md */
  size?: NumberInputSize;
  /** 校验失败态：红框并标记 aria-invalid；在 Field 内时与 Field 的 invalid 取并集 */
  invalid?: boolean;
  /** 是否允许清空为 null，默认 false（失焦时回落为上一个有效值） */
  allowEmpty?: boolean;
}

const clamp = (value: number, min?: number, max?: number) => {
  let next = value;
  if (min !== undefined) next = Math.max(next, min);
  if (max !== undefined) next = Math.min(next, max);
  return next;
};

/** 按 step 的小数位取整，避免 0.1 步进出现浮点误差 */
const precisionOf = (step: number) => {
  const fraction = String(step).split('.')[1];
  return fraction ? fraction.length : 0;
};

const format = (value: number | null) => (value === null ? '' : String(value));

/** 数字输入：内置步进按钮，支持 min / max / step 与精度处理；放入 Field 可自动关联 label 与描述 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    value,
    defaultValue = null,
    onValueChange,
    min,
    max,
    step = 1,
    size = 'md',
    invalid = false,
    allowEmpty = false,
    className,
    id,
    disabled,
    name,
    'aria-describedby': ariaDescribedBy,
    onBlur,
    onChange,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const field = useField();
  useFieldControlId(id);
  const [current, setCurrent] = useControllableState<number | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const [draft, setDraft] = useState(() => format(current));
  const [focused, setFocused] = useState(false);
  // 外部值变化时同步输入框；聚焦输入期间不覆盖用户正在编辑的草稿
  const [syncedValue, setSyncedValue] = useState(current);
  if (syncedValue !== current) {
    setSyncedValue(current);
    if (!focused) setDraft(format(current));
  }

  const isDisabled = disabled ?? field?.disabled;
  const isInvalid = invalid || field?.invalid === true;
  const describedBy = [ariaDescribedBy, ...(field?.describedIds ?? [])].filter(Boolean).join(' ') || undefined;
  const decimals = precisionOf(step);
  const round = (input: number) => Number(input.toFixed(decimals));

  const commit = (next: number | null) => {
    setCurrent(next);
    setDraft(format(next));
  };

  const stepBy = (delta: number) => {
    const base = current ?? clamp(0, min, max);
    const next = round(clamp(base + delta * step, min, max));
    if (next !== current) commit(next);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    const text = event.target.value;
    setDraft(text);
    const parsed = Number.parseFloat(text);
    if (text.trim() !== '' && Number.isFinite(parsed)) {
      const next = round(clamp(parsed, min, max));
      if (next !== current) setCurrent(next);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    onBlur?.(event);
    setFocused(false);
    const parsed = Number.parseFloat(draft);
    if (draft.trim() === '' || !Number.isFinite(parsed)) {
      if (allowEmpty) commit(null);
      else setDraft(format(current));
      return;
    }
    commit(round(clamp(parsed, min, max)));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || isDisabled) return;
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      stepBy(1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      stepBy(-1);
    }
  };

  const atMin = min !== undefined && current !== null && current <= min;
  const atMax = max !== undefined && current !== null && current >= max;

  return (
    <div
      data-disabled={isDisabled || undefined}
      className={cn('elyri-ui-number-input', `elyri-ui-number-input--${size}`, isInvalid && 'is-invalid', className)}
    >
      <input
        ref={ref}
        id={id ?? field?.controlId}
        type="number"
        inputMode="decimal"
        role="spinbutton"
        name={name}
        value={draft}
        min={min}
        max={max}
        step={step}
        disabled={isDisabled}
        required={field?.required}
        aria-invalid={isInvalid || undefined}
        aria-describedby={describedBy}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={current ?? undefined}
        className="elyri-ui-number-input__field"
        {...rest}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={(event) => {
          setFocused(true);
          rest.onFocus?.(event);
        }}
        onKeyDown={handleKeyDown}
      />
      <div className="elyri-ui-number-input__steppers">
        <button
          type="button"
          tabIndex={-1}
          aria-label="Increase"
          disabled={isDisabled || atMax}
          className="elyri-ui-number-input__button"
          onClick={() => stepBy(1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M6 12h12M12 6v12" />
          </svg>
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Decrease"
          disabled={isDisabled || atMin}
          className="elyri-ui-number-input__button"
          onClick={() => stepBy(-1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M6 12h12" />
          </svg>
        </button>
      </div>
    </div>
  );
});
