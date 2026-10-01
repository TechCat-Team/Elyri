import { useCallback, useEffect, useRef, useState } from 'react';

interface ControllableStateOptions<T> {
  /** 传入即为受控；省略则内部自己维护状态 */
  value?: T;
  /** 非受控时的初始值 */
  defaultValue: T;
  /** 状态变化时回调，受控与非受控都会触发 */
  onChange?: (value: T) => void;
}

/** 避免依赖 @types/node：从 globalThis 上探测 NODE_ENV，缺失时视为开发环境 */
const isDev =
  (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== 'production';

/**
 * 受控 / 非受控通用状态：`value` 存在时完全由外部驱动，
 * 否则用内部 state，但两种情况都会抛 `onChange`。
 */
export function useControllableState<T>({ value, defaultValue, onChange }: ControllableStateOptions<T>) {
  const [internal, setInternal] = useState<T>(defaultValue);
  const controlled = value !== undefined;

  // 开发期提示受控 / 非受控状态被中途切换，行为会变得不可预期
  const wasControlled = useRef(controlled);
  useEffect(() => {
    if (isDev && wasControlled.current !== controlled) {
      console.error(
        '[@elyri/ui] 组件在受控与非受控之间切换。请在组件生命周期内保持同一种模式，' +
          '在受控与非受控之间切换会导致状态丢失。',
      );
    }
    wasControlled.current = controlled;
  }, [controlled]);

  const setValue = useCallback(
    (next: T) => {
      if (!controlled) setInternal(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );

  return [controlled ? (value as T) : internal, setValue] as const;
}
