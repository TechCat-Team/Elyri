import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent } from 'react';

import { cn, useControllableState } from '../../../core';

import './Tabs.css';

export type TabsOrientation = 'horizontal' | 'vertical';
/** segmented：分段胶囊；underline：文字 + 下划线 */
export type TabsVariant = 'segmented' | 'underline';

/** value 可能含空格等非法 id 字符，清洗后再拼进 id，保证 aria 关联有效 */
const safeId = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '-');

/** 服务端没有布局，退回 useEffect 以避免 useLayoutEffect 的 SSR 警告 */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export type TabsProps = HTMLAttributes<HTMLDivElement> & {
  /** 受控选中值 */
  value?: string;
  /** 非受控初始值，默认空字符串（即无选中项） */
  defaultValue?: string;
  /** 选中值变化回调，受控与非受控都会触发 */
  onValueChange?: (value: string) => void;
  /** 排列方向，默认 horizontal */
  orientation?: TabsOrientation;
  /** 外观样式，默认 segmented */
  variant?: TabsVariant;
};

export type TabsTriggerProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> & {
  /** 该标签对应的面板值 */
  value: string;
};

export type TabsPanelProps = HTMLAttributes<HTMLDivElement> & {
  /** 需要与对应 Tabs.Trigger 的 value 一致 */
  value: string;
};

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  /** 用于串起 tab / tabpanel 的 id，避免多实例冲突 */
  baseId: string;
  orientation: TabsOrientation;
  variant: TabsVariant;
  /** 已挂载的 trigger value，按 DOM 顺序排列，用于无选中项时决定谁可聚焦 */
  values: string[];
  registerTrigger: (value: string) => () => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tabs 的子组件必须放在 <Tabs> 内使用');
  return context;
};

function TabsRoot({
  value,
  defaultValue = '',
  onValueChange,
  orientation = 'horizontal',
  variant = 'segmented',
  className,
  children,
  ...rest
}: TabsProps) {
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const baseId = useId();
  const [values, setValues] = useState<string[]>([]);

  const registerTrigger = useCallback((triggerValue: string) => {
    setValues((prev) => (prev.includes(triggerValue) ? prev : [...prev, triggerValue]));
    return () => setValues((prev) => prev.filter((item) => item !== triggerValue));
  }, []);

  return (
    <TabsContext.Provider
      value={{ value: current, setValue: setCurrent, baseId, orientation, variant, values, registerTrigger }}
    >
      <div className={cn('elyri-ui-tabs', className)} data-orientation={orientation} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, children, onKeyDown, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const { orientation, variant, value: current, values } = useTabsContext();
  const listRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  // 滑块跟随选中的 trigger；直接写 style，避免每次测量都触发重渲染
  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;
    const indicator = indicatorRef.current;
    if (!list || !indicator) return;

    const update = () => {
      const active = list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      if (!active) {
        delete list.dataset.indicator;
        return;
      }
      // 首次出现时直接落位，不从左上角滑入
      const appearing = list.dataset.indicator === undefined;
      if (appearing) indicator.style.transition = 'none';
      indicator.style.width = `${active.offsetWidth}px`;
      indicator.style.height = `${active.offsetHeight}px`;
      indicator.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
      list.dataset.indicator = '';
      if (appearing) {
        void indicator.offsetWidth;
        indicator.style.transition = '';
      }
    };

    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(list);
    list.querySelectorAll('[role="tab"]').forEach((tab) => observer.observe(tab));
    return () => observer.disconnect();
  }, [current, values, orientation, variant]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const forward = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const backward = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    if (event.key !== forward && event.key !== backward && event.key !== 'Home' && event.key !== 'End') return;

    const tabs = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)')];
    if (!tabs.length) return;

    const currentIndex = tabs.findIndex((tab) => tab === document.activeElement);
    let nextIndex: number;
    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else if (event.key === forward) nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % tabs.length;
    else nextIndex = currentIndex < 0 ? tabs.length - 1 : (currentIndex - 1 + tabs.length) % tabs.length;

    event.preventDefault();
    // 焦点移动即切换面板（ARIA APG 对标签页推荐的自动激活）
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  };

  return (
    // tablist 自身不可聚焦，焦点由内部 role=tab 承担（ARIA APG 约定）
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    <div
      ref={listRef}
      role="tablist"
      aria-orientation={orientation}
      data-variant={variant}
      className={cn('elyri-ui-tabs__list', className)}
      {...rest}
      onKeyDown={handleKeyDown}
    >
      <span ref={indicatorRef} className="elyri-ui-tabs__indicator" aria-hidden="true" />
      {children}
    </div>
  );
}

function TabsTrigger({ value, className, children, onClick, ...rest }: TabsTriggerProps) {
  const { value: current, setValue, baseId, values, registerTrigger } = useTabsContext();
  const selected = current === value;
  // 没有任何选中项时，让第一个 trigger 保持可聚焦，避免整组 tab 无法用键盘进入
  const focusable = selected || (current === '' && values[0] === value);
  const idPart = safeId(value);

  useEffect(() => registerTrigger(value), [registerTrigger, value]);

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${idPart}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${idPart}`}
      tabIndex={focusable ? 0 : -1}
      className={cn('elyri-ui-tabs__trigger', className)}
      {...rest}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setValue(value);
      }}
    >
      {children}
    </button>
  );
}

function TabsPanel({ value, className, children, ...rest }: TabsPanelProps) {
  const { value: current, baseId } = useTabsContext();
  const selected = current === value;
  const idPart = safeId(value);

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${idPart}`}
      aria-labelledby={`${baseId}-tab-${idPart}`}
      hidden={!selected}
      tabIndex={0}
      className={cn('elyri-ui-tabs__panel', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

/** 标签页：受控 / 非受控双支持，方向键与 Home / End 导航，面板常驻 DOM 仅隐藏 */
export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Panel: TabsPanel,
});
