import { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode, RefObject } from 'react';

import { Portal, cn, useControllableState, useDismiss, useFocusTrap, usePresence, useScrollLock } from '../../../core';

import './Dialog.css';

/** 与 Dialog.css 中离场动画时长保持一致 */
const EXIT_DURATION = 110;

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  baseId: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
  modal: boolean;
  /** 是否渲染了 Dialog.Title / Dialog.Description，用于决定 aria 关联是否生效 */
  hasTitle: boolean;
  hasDescription: boolean;
  setHasTitle: (value: boolean) => void;
  setHasDescription: (value: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context) throw new Error('Dialog 的子组件必须放在 <Dialog> 内使用');
  return context;
};

export interface DialogProps {
  /** 受控开关 */
  open?: boolean;
  /** 非受控初始开关，默认 false */
  defaultOpen?: boolean;
  /** 开关变化回调，受控与非受控都会触发 */
  onOpenChange?: (open: boolean) => void;
  /** 模态：锁定滚动并圈定焦点，默认 true */
  modal?: boolean;
  children?: ReactNode;
}

function DialogRoot({ open, defaultOpen = false, onOpenChange, modal = true, children }: DialogProps) {
  const [isOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const baseId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);

  const value = useMemo<DialogContextValue>(
    () => ({ open: isOpen, setOpen, baseId, triggerRef, modal, hasTitle, hasDescription, setHasTitle, setHasDescription }),
    [isOpen, setOpen, baseId, modal, hasTitle, hasDescription],
  );

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

export type DialogTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

function DialogTrigger({ className, children, onClick, ...rest }: DialogTriggerProps) {
  const { open, setOpen, triggerRef, baseId } = useDialogContext();

  return (
    <button
      type="button"
      ref={triggerRef}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={`${baseId}-content`}
      className={cn('elyri-ui-dialog__trigger', className)}
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

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  /** 点击遮罩关闭，默认 true */
  closeOnOverlayClick?: boolean;
  /** 按 Escape 关闭，默认 true */
  closeOnEscape?: boolean;
}

function DialogContent({
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  children,
  ...rest
}: DialogContentProps) {
  const { open, setOpen, baseId, modal, hasTitle, hasDescription } = useDialogContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const refs = useMemo<RefObject<HTMLElement | null>[]>(() => [contentRef], []);
  const dismiss = useMemo(() => () => setOpen(false), [setOpen]);
  const present = usePresence(open, EXIT_DURATION);

  // 离场动画期间保持滚动锁定，避免滚动条提前出现导致页面抖动
  useScrollLock(present && modal);
  useFocusTrap(contentRef, open && modal);
  useDismiss({ open, onDismiss: dismiss, refs, escape: closeOnEscape, outside: closeOnOverlayClick });

  if (!present) return null;

  const state = open ? 'open' : 'closed';

  return (
    <Portal>
      <div className="elyri-ui-dialog__overlay" data-state={state}>
        <div
          ref={contentRef}
          id={`${baseId}-content`}
          role="dialog"
          aria-modal={modal || undefined}
          aria-labelledby={hasTitle ? `${baseId}-title` : undefined}
          aria-describedby={hasDescription ? `${baseId}-description` : undefined}
          tabIndex={-1}
          data-state={state}
          className={cn('elyri-ui-dialog__content', className)}
          {...rest}
        >
          {children}
        </div>
      </div>
    </Portal>
  );
}

function DialogTitle({ className, children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  const { baseId, setHasTitle } = useDialogContext();

  useEffect(() => {
    setHasTitle(true);
    return () => setHasTitle(false);
  }, [setHasTitle]);

  return (
    <h2 id={`${baseId}-title`} className={cn('elyri-ui-dialog__title', className)} {...rest}>
      {children}
    </h2>
  );
}

function DialogDescription({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  const { baseId, setHasDescription } = useDialogContext();

  useEffect(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, [setHasDescription]);

  return <p id={`${baseId}-description`} className={cn('elyri-ui-dialog__description', className)} {...rest} />;
}

export type DialogCloseProps = ButtonHTMLAttributes<HTMLButtonElement>;

function DialogClose({ className, children, onClick, ...rest }: DialogCloseProps) {
  const { setOpen } = useDialogContext();

  return (
    <button
      type="button"
      className={cn('elyri-ui-dialog__close', className)}
      {...rest}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(false);
      }}
    >
      {children}
    </button>
  );
}

/** 对话框：复合组件，含触发、遮罩、焦点管理与滚动锁定 */
export const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
});
