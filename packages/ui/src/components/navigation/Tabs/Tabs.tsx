import { createContext, useContext, useId } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent } from 'react';

import { cn, useControllableState } from '../../../core';

import './Tabs.css';

export type TabsOrientation = 'horizontal' | 'vertical';

export type TabsProps = HTMLAttributes<HTMLDivElement> & {
  /** 受控选中值 */
  value?: string;
  /** 非受控初始值，默认空字符串（即无选中项） */
  defaultValue?: string;
  /** 选中值变化回调，受控与非受控都会触发 */
  onValueChange?: (value: string) => void;
  /** 排列方向，默认 horizontal */
  orientation?: TabsOrientation;
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
  className,
  children,
  ...rest
}: TabsProps) {
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const baseId = useId();

  return (
    <TabsContext.Provider value={{ value: current, setValue: setCurrent, baseId, orientation }}>
      <div className={cn('elyri-ui-tabs', className)} data-orientation={orientation} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, children, onKeyDown, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const { orientation } = useTabsContext();

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
    <div
      role="tablist"
      aria-orientation={orientation}
      className={cn('elyri-ui-tabs__list', className)}
      {...rest}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}

function TabsTrigger({ value, className, children, onClick, ...rest }: TabsTriggerProps) {
  const { value: current, setValue, baseId } = useTabsContext();
  const selected = current === value;

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
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

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
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
