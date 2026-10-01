import { createContext, useContext, useEffect, useId, useMemo, useRef } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode, RefObject } from 'react';

import { Portal, cn, useControllableState, useFloatingPosition, usePresence } from '../../../core';
import type { Alignment, Placement } from '../../../core';

import './Tooltip.css';

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  baseId: string;
  delay: number;
  placement: Placement;
  align: Alignment;
  offset: number;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

const useTooltipContext = () => {
  const context = useContext(TooltipContext);
  if (!context) throw new Error('Tooltip 的子组件必须放在 <Tooltip> 内使用');
  return context;
};

export interface TooltipProps {
  /** 受控开关 */
  open?: boolean;
  /** 非受控初始开关，默认 false */
  defaultOpen?: boolean;
  /** 开关变化回调 */
  onOpenChange?: (open: boolean) => void;
  /** 悬停多久后显示（毫秒），默认 200；键盘聚焦立即显示 */
  delay?: number;
  /** 期望方向，默认 top */
  placement?: Placement;
  /** 交叉轴对齐，默认 center */
  align?: Alignment;
  /** 与触发元素的间距，默认 8 */
  offset?: number;
  children?: ReactNode;
}

function TooltipRoot({
  open,
  defaultOpen = false,
  onOpenChange,
  delay = 200,
  placement = 'top',
  align = 'center',
  offset = 8,
  children,
}: TooltipProps) {
  const [isOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const baseId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const value = useMemo<TooltipContextValue>(
    () => ({ open: isOpen, setOpen, triggerRef, baseId, delay, placement, align, offset }),
    [isOpen, setOpen, baseId, delay, placement, align, offset],
  );

  return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
}

/** 与 Tooltip.css 中离场动画时长保持一致 */
const EXIT_DURATION = 100;
/** 刚关闭一个提示后的这段时间内，悬停其他触发元素会跳过延迟立即显示 */
const SKIP_DELAY_WINDOW = 300;
let lastClosedAt = 0;

export type TooltipTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

function TooltipTrigger({
  className,
  children,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...rest
}: TooltipTriggerProps) {
  const { open, setOpen, triggerRef, baseId, delay } = useTooltipContext();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showAfterDelay = useMemo(
    () => () => {
      clearTimeout(timer.current);
      if (Date.now() - lastClosedAt < SKIP_DELAY_WINDOW) {
        setOpen(true);
        return;
      }
      timer.current = setTimeout(() => setOpen(true), delay);
    },
    [delay, setOpen],
  );

  const hide = useMemo(
    () => () => {
      clearTimeout(timer.current);
      if (open) lastClosedAt = Date.now();
      setOpen(false);
    },
    [open, setOpen],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  // 打开时按 Esc 关闭
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, setOpen]);

  return (
    <button
      type="button"
      ref={triggerRef}
      aria-describedby={open ? `${baseId}-content` : undefined}
      className={cn('elyri-ui-tooltip__trigger', className)}
      {...rest}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (event.pointerType !== 'touch') showAfterDelay();
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        hide();
      }}
      onFocus={(event) => {
        onFocus?.(event);
        clearTimeout(timer.current);
        setOpen(true);
      }}
      onBlur={(event) => {
        onBlur?.(event);
        hide();
      }}
    >
      {children}
    </button>
  );
}

export type TooltipContentProps = HTMLAttributes<HTMLDivElement>;

function TooltipContent({ className, children, ...rest }: TooltipContentProps) {
  const { open, triggerRef, baseId, placement, align, offset } = useTooltipContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const present = usePresence(open, EXIT_DURATION);
  const position = useFloatingPosition(triggerRef, contentRef, { open: present, placement, align, offset });

  if (!present) return null;

  return (
    <Portal>
      <div
        ref={contentRef}
        id={`${baseId}-content`}
        role="tooltip"
        data-state={open ? 'open' : 'closed'}
        data-placement={position.placement}
        className={cn('elyri-ui-tooltip__content', className)}
        style={{ top: position.top, left: position.left }}
        {...rest}
      >
        {children}
      </div>
    </Portal>
  );
}

/** 工具提示：悬停或聚焦触发，只承载不可交互的短文案 */
export const Tooltip = Object.assign(TooltipRoot, {
  Trigger: TooltipTrigger,
  Content: TooltipContent,
});
