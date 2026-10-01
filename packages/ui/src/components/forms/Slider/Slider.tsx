import { forwardRef, useCallback, useMemo, useRef } from 'react';
import type { HTMLAttributes, KeyboardEvent, PointerEvent } from 'react';

import { cn, useControllableState, useField, useFieldControlId } from '../../../core';

import './Slider.css';

export type SliderSize = 'sm' | 'md' | 'lg';

export interface SliderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'value'> {
  /** 受控值：number 单值，number[] 双值区间 */
  value?: number | number[];
  /** 非受控初始值，形态与 value 一致；区间未提供时默认 [min, max] */
  defaultValue?: number | number[];
  /** 值变化回调，单值回传 number、区间回传 number[] */
  onValueChange?: (value: number | number[]) => void;
  /** 最小值，默认 0 */
  min?: number;
  /** 最大值，默认 100 */
  max?: number;
  /** 步长，默认 1 */
  step?: number;
  /** 尺寸，默认 md */
  size?: SliderSize;
  /** 禁用 */
  disabled?: boolean;
  /** 校验失败态：标记 aria-invalid；在 Field 内时与 Field 的 invalid 取并集 */
  invalid?: boolean;
  /** 单值滑块的 accessible name（不在 Field 内且未传时需自行提供） */
  'aria-label'?: string;
  /** 区间下滑块的无障碍名称，默认 "Minimum" */
  minLabel?: string;
  /** 区间上滑块的无障碍名称，默认 "Maximum" */
  maxLabel?: string;
  /** 表单字段名：设置后渲染隐藏 input，使值可随原生表单提交（区间按重复字段名提交两个值） */
  name?: string;
}

/** 从受控 / 非受控值判定是否为区间模式 */
const isRangeValue = (input: number | number[] | undefined) => Array.isArray(input);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** 滑块：单值或双值区间，指针拖拽 + 方向键 / Home / End / PageUp / PageDown 键盘操作 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    value,
    defaultValue,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    size = 'md',
    disabled,
    invalid = false,
    minLabel = 'Minimum',
    maxLabel = 'Maximum',
    name,
    className,
    id,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const field = useField();
  useFieldControlId(id);
  const range = isRangeValue(value) || isRangeValue(defaultValue);
  const [selected, setSelected] = useControllableState<number | number[]>({
    value,
    defaultValue: defaultValue ?? (range ? [min, max] : min),
    onChange: onValueChange,
  });

  const isDisabled = disabled ?? field?.disabled;
  const isInvalid = invalid || field?.invalid === true;
  const describedBy = [ariaDescribedBy, ...(field?.describedIds ?? [])].filter(Boolean).join(' ') || undefined;
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragIndex = useRef<number | null>(null);

  const values = useMemo(
    () => (Array.isArray(selected) ? [...selected].sort((a, b) => a - b) : [selected]),
    [selected],
  );
  const span = max - min || 1;
  const toPercent = (value: number) => clamp(((value - min) / span) * 100, 0, 100);

  const snap = useCallback(
    (raw: number) => clamp(min + Math.round((raw - min) / step) * step, min, max),
    [min, max, step],
  );

  const commit = useCallback(
    (index: number, next: number) => {
      // 区间模式两个滑块互相约束，下不低于上、上不低于下
      const bounded = range ? (index === 0 ? Math.min(next, values[1]) : Math.max(next, values[0])) : next;
      const nextValues = [...values];
      nextValues[index] = bounded;
      setSelected(range ? nextValues : nextValues[0]);
    },
    [range, values, setSelected],
  );

  const valueFromClientX = useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return values[0];
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      return snap(min + ratio * span);
    },
    [values, snap, min, span],
  );

  const nearestIndex = useCallback(
    (next: number) => {
      if (!range) return 0;
      return Math.abs(next - values[0]) <= Math.abs(next - values[1]) ? 0 : 1;
    },
    [range, values],
  );

  const handleTrackPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    const next = valueFromClientX(event.clientX);
    const index = nearestIndex(next);
    dragIndex.current = index;
    commit(index, next);
    event.currentTarget.setPointerCapture(event.pointerId);
    thumbRefs.current[index]?.focus();
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (isDisabled || dragIndex.current === null) return;
    commit(dragIndex.current, valueFromClientX(event.clientX));
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragIndex.current === null) return;
    dragIndex.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleThumbPointerDown = (index: number, event: PointerEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    dragIndex.current = index;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleThumbKeyDown = (index: number, event: KeyboardEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    const stepBy = (delta: number) => commit(index, clamp(values[index] + delta, min, max));
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        stepBy(step);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        stepBy(-step);
        break;
      case 'PageUp':
        event.preventDefault();
        stepBy(step * 10);
        break;
      case 'PageDown':
        event.preventDefault();
        stepBy(-step * 10);
        break;
      case 'Home':
        event.preventDefault();
        commit(index, min);
        break;
      case 'End':
        event.preventDefault();
        commit(index, max);
        break;
      default:
        break;
    }
  };

  const renderThumb = (index: number) => (
    <div
      key={index}
      ref={(node) => {
        thumbRefs.current[index] = node;
      }}
      role="slider"
      tabIndex={isDisabled ? -1 : 0}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={values[index]}
      aria-orientation="horizontal"
      aria-invalid={isInvalid || undefined}
      aria-describedby={describedBy}
      aria-label={range ? (index === 0 ? minLabel : maxLabel) : ariaLabel}
      // 单值且在 Field 内时，由 Field.Label 命名
      aria-labelledby={!range && !ariaLabel ? field?.labelId : undefined}
      data-disabled={isDisabled || undefined}
      className="elyri-ui-slider__thumb"
      style={{ left: `${toPercent(values[index])}%` }}
      onKeyDown={(event) => handleThumbKeyDown(index, event)}
      onPointerDown={(event) => handleThumbPointerDown(index, event)}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
    />
  );

  return (
    <div
      ref={ref}
      id={id ?? field?.controlId}
      data-disabled={isDisabled || undefined}
      data-invalid={isInvalid || undefined}
      className={cn('elyri-ui-slider', `elyri-ui-slider--${size}`, isDisabled && 'is-disabled', className)}
      {...rest}
    >
      <div
        ref={trackRef}
        className="elyri-ui-slider__track"
        onPointerDown={handleTrackPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          className="elyri-ui-slider__fill"
          style={{
            left: `${toPercent(values[0])}%`,
            right: `${100 - toPercent(values[values.length - 1])}%`,
          }}
        />
        {range ? [renderThumb(0), renderThumb(1)] : renderThumb(0)}
      </div>
      {/* 自定义控件不参与原生提交，name 存在时用隐藏 input 承载值 */}
      {name !== undefined && <input type="hidden" name={name} value={values[0]} disabled={isDisabled} readOnly />}
      {name !== undefined && range && (
        <input type="hidden" name={name} value={values[1]} disabled={isDisabled} readOnly />
      )}
    </div>
  );
});
