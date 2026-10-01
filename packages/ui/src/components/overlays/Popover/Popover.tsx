import { createContext, useContext, useId, useMemo, useRef } from 'react';
import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode, RefObject } from 'react';

import {
  Portal,
  cn,
  useControllableState,
  useDismiss,
  useFloatingPosition,
  useFocusTrap,
  usePresence,
} from '../../../core';
import type { Alignment, Placement } from '../../../core';

import './Popover.css';

/** 与 Popover.css 中离场动画时长保持一致 */
const EXIT_DURATION = 120;

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  baseId: string;
  placement: Placement;
  align: Alignment;
  offset: number;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

const usePopoverContext = () => {
  const context = useContext(PopoverContext);
  if (!context) throw new Error('Popover 的子组件必须放在 <Popover> 内使用');
  return context;
};

export interface PopoverProps {
  /** 受控开关 */
  open?: boolean;
  /** 非受控初始开关，默认 false */
  defaultOpen?: boolean;
  /** 开关变化回调 */
  onOpenChange?: (open: boolean) => void;
  /** 期望方向，默认 bottom */
  placement?: Placement;
  /** 交叉轴对齐，默认 center */
  align?: Alignment;
  /** 与触发元素的间距，默认 8 */
  offset?: number;
  children?: ReactNode;
}

function PopoverRoot({
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom',
  align = 'center',
  offset = 8,
  children,
}: PopoverProps) {
  const [isOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const baseId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const value = useMemo<PopoverContextValue>(
    () => ({ open: isOpen, setOpen, triggerRef, baseId, placement, align, offset }),
    [isOpen, setOpen, baseId, placement, align, offset],
  );

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

export type PopoverTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

function PopoverTrigger({ className, children, onClick, ...rest }: PopoverTriggerProps) {
  const { open, setOpen, triggerRef, baseId } = usePopoverContext();

  return (
    <button
      type="button"
      ref={triggerRef}
      id={`${baseId}-trigger`}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={`${baseId}-content`}
      className={cn('elyri-ui-popover__trigger', className)}
      {...rest}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(!open);
      }}
    >
      {children}
    </button>
  );
}

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  /** 点击外部关闭，默认 true */
  closeOnInteractOutside?: boolean;
  /** 按 Escape 关闭，默认 true */
  closeOnEscape?: boolean;
}

function PopoverContent({
  closeOnInteractOutside = true,
  closeOnEscape = true,
  className,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  ...rest
}: PopoverContentProps) {
  const { open, setOpen, triggerRef, baseId, placement, align, offset } = usePopoverContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const refs = useMemo<RefObject<HTMLElement | null>[]>(() => [triggerRef, contentRef], [triggerRef]);
  const present = usePresence(open, EXIT_DURATION);
  const position = useFloatingPosition(triggerRef, contentRef, { open: present, placement, align, offset });
  const dismiss = useMemo(() => () => setOpen(false), [setOpen]);

  useFocusTrap(contentRef, open);
  useDismiss({ open, onDismiss: dismiss, refs, escape: closeOnEscape, outside: closeOnInteractOutside });

  if (!present) return null;

  return (
    <Portal>
      <div
        ref={contentRef}
        id={`${baseId}-content`}
        role="dialog"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby ?? (ariaLabel ? undefined : `${baseId}-trigger`)}
        tabIndex={-1}
        data-state={open ? 'open' : 'closed'}
        data-placement={position.placement}
        className={cn('elyri-ui-popover__content', className)}
        style={
          {
            top: position.top,
            left: position.left,
            '--elyri-ui-arrow-offset': `${position.arrow}px`,
          } as CSSProperties
        }
        {...rest}
      >
        {children}
      </div>
    </Portal>
  );
}

/** 弹出层：点击触发，内容可交互，外部点击或 Escape 关闭并把焦点还给触发元素 */
export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
});
