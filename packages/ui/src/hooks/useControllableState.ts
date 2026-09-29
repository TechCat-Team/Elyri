import { useCallback, useState } from 'react';

interface ControllableStateOptions<T> {
  /** 传入即为受控；省略则内部自己维护状态 */
  value?: T;
  /** 非受控时的初始值 */
  defaultValue: T;
  /** 状态变化时回调，受控与非受控都会触发 */
  onChange?: (value: T) => void;
}

/**
 * 受控 / 非受控通用状态：`value` 存在时完全由外部驱动，
 * 否则用内部 state，但两种情况都会抛 `onChange`。
 */
export function useControllableState<T>({ value, defaultValue, onChange }: ControllableStateOptions<T>) {
  const [internal, setInternal] = useState<T>(defaultValue);
  const controlled = value !== undefined;

  const setValue = useCallback(
    (next: T) => {
      if (!controlled) setInternal(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );

  return [controlled ? (value as T) : internal, setValue] as const;
}
