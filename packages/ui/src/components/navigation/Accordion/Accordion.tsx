import { createContext, useContext, useId } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent, ReactNode } from 'react';

import { cn, useControllableState } from '../../../core';

import './Accordion.css';

/** lined：分隔线堆叠；separated：独立卡片 */
export type AccordionVariant = 'lined' | 'separated';
/** single：每次只展开一项；multiple：可同时展开多项 */
export type AccordionType = 'single' | 'multiple';

/** value 可能含空格等非法 id 字符，清洗后再拼进 id，保证 aria 关联有效 */
const safeId = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '-');

const TRIGGER_SELECTOR = '.elyri-ui-accordion__trigger:not(:disabled)';

interface AccordionBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** 展开模式，默认 single */
  type?: AccordionType;
  /** 允许再次点击已展开项将其收起；multiple 天然可收起，仅 single 需要 */
  collapsible?: boolean;
  /** 外观样式，默认 lined */
  variant?: AccordionVariant;
}

interface AccordionSingleProps extends AccordionBaseProps {
  type?: 'single';
  /** 受控展开值 */
  value?: string;
  /** 非受控初始值，默认空字符串（即全部收起） */
  defaultValue?: string;
  /** 展开值变化回调，受控与非受控都会触发 */
  onValueChange?: (value: string) => void;
}

interface AccordionMultipleProps extends AccordionBaseProps {
  type: 'multiple';
  /** 受控展开值集合 */
  value?: string[];
  /** 非受控初始值，默认空数组（即全部收起） */
  defaultValue?: string[];
  /** 展开值变化回调，受控与非受控都会触发 */
  onValueChange?: (value: string[]) => void;
}

export type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

export type AccordionItemProps = HTMLAttributes<HTMLDivElement> & {
  /** 与 Trigger / Content 关联的唯一值 */
  value: string;
  /** 禁用后标题不可点击 */
  disabled?: boolean;
};

export type AccordionTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** 标题前置图标，常用来给每个条目标一个语义图形 */
  icon?: ReactNode;
};

export type AccordionContentProps = HTMLAttributes<HTMLDivElement>;

interface AccordionContextValue {
  /** 该 value 是否已展开 */
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
  /** 用于串起 trigger / panel 的 id，避免多实例冲突 */
  baseId: string;
}

interface AccordionItemContextValue {
  value: string;
  disabled: boolean;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);
const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('Accordion 的子组件必须放在 <Accordion> 内使用');
  return context;
};

const useAccordionItemContext = () => {
  const context = useContext(AccordionItemContext);
  if (!context) throw new Error('Accordion.Trigger / Accordion.Content 必须放在 <Accordion.Item> 内使用');
  return context;
};

function AccordionRoot({
  type = 'single',
  value,
  defaultValue,
  onValueChange,
  collapsible = false,
  variant = 'lined',
  className,
  children,
  onKeyDown,
  ...rest
}: AccordionProps) {
  const isMultiple = type === 'multiple';
  const baseId = useId();

  // 内部统一按「已展开值列表」维护，single 至多一项；再按模式还原回调签名
  const controlledList = isMultiple
    ? (value as string[] | undefined)
    : value === undefined
      ? undefined
      : [value as string];
  const defaultList = isMultiple
    ? ((defaultValue as string[] | undefined) ?? [])
    : defaultValue
      ? [defaultValue as string]
      : [];

  const [openList, setOpenList] = useControllableState<string[]>({
    value: controlledList,
    defaultValue: defaultList,
    onChange: (list) => {
      if (isMultiple) (onValueChange as ((next: string[]) => void) | undefined)?.(list);
      else (onValueChange as ((next: string) => void) | undefined)?.(list[0] ?? '');
    },
  });

  const toggle = (next: string) => {
    if (isMultiple) {
      setOpenList(openList.includes(next) ? openList.filter((item) => item !== next) : [...openList, next]);
      return;
    }
    // single：点击已展开项时，collapsible 才收起，否则保持展开
    if (openList[0] === next) {
      if (collapsible) setOpenList([]);
      return;
    }
    setOpenList([next]);
  };

  const isOpen = (target: string) => openList.includes(target);

  // ARIA APG 手风琴的可选键：方向键仅在标题间移动焦点，不改变展开状态（Enter / Space 由原生 button 触发）
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Home' && event.key !== 'End') return;
    if (!(event.target as HTMLElement).closest?.(TRIGGER_SELECTOR)) return;

    const triggers = [...event.currentTarget.querySelectorAll<HTMLButtonElement>(TRIGGER_SELECTOR)];
    const currentIndex = triggers.findIndex((trigger) => trigger === document.activeElement);
    if (currentIndex < 0) return;

    let nextIndex: number;
    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = triggers.length - 1;
    else if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % triggers.length;
    else nextIndex = (currentIndex - 1 + triggers.length) % triggers.length;

    event.preventDefault();
    triggers[nextIndex].focus();
  };

  return (
    <AccordionContext.Provider value={{ isOpen, toggle, baseId }}>
      {/* 容器自身不聚焦，方向键处理由内部 trigger 冒泡上来（ARIA APG 约定） */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        className={cn('elyri-ui-accordion', className)}
        data-variant={variant}
        data-type={type}
        {...rest}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({ value, disabled = false, className, children, ...rest }: AccordionItemProps) {
  const { isOpen } = useAccordionContext();
  const open = isOpen(value);

  return (
    <AccordionItemContext.Provider value={{ value, disabled }}>
      <div className={cn('elyri-ui-accordion__item', className)} data-open={open ? '' : undefined} {...rest}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

function AccordionTrigger({ icon, className, children, onClick, ...rest }: AccordionTriggerProps) {
  const { isOpen, toggle, baseId } = useAccordionContext();
  const item = useAccordionItemContext();
  const open = isOpen(item.value);
  const idPart = safeId(item.value);

  return (
    // 标题包一层 h3，保证读屏器的标题导航可用（ARIA APG 手风琴模式）
    <h3 className="elyri-ui-accordion__header">
      <button
        type="button"
        id={`${baseId}-trigger-${idPart}`}
        aria-expanded={open}
        aria-controls={`${baseId}-panel-${idPart}`}
        disabled={item.disabled}
        className={cn('elyri-ui-accordion__trigger', className)}
        {...rest}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) toggle(item.value);
        }}
      >
        {icon ? (
          <span className="elyri-ui-accordion__icon-leading" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span className="elyri-ui-accordion__label">{children}</span>
        <svg
          className="elyri-ui-accordion__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </h3>
  );
}

function AccordionContent({ className, children, ...rest }: AccordionContentProps) {
  const { isOpen, baseId } = useAccordionContext();
  const item = useAccordionItemContext();
  const open = isOpen(item.value);
  const idPart = safeId(item.value);

  // 面板常驻 DOM：visibility 兜底可访问性（隐藏时不进 a11y 树、不可聚焦），高度动画由 CSS grid 完成
  return (
    <div
      role="region"
      id={`${baseId}-panel-${idPart}`}
      aria-labelledby={`${baseId}-trigger-${idPart}`}
      data-open={open ? '' : undefined}
      className={cn('elyri-ui-accordion__panel', className)}
      {...rest}
    >
      <div className="elyri-ui-accordion__panel-inner">
        <div className="elyri-ui-accordion__panel-body">{children}</div>
      </div>
    </div>
  );
}

/** 手风琴：支持单项 / 多项展开，受控 / 非受控双支持，grid 高度动画，方向键移动焦点，符合 WAI-ARIA 手风琴模式 */
export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});
