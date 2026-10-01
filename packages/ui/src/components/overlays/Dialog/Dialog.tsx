import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, MouseEvent, ReactNode, Ref, RefObject } from 'react';

import { Portal, Slot, cn, useControllableState, useDismiss, useFocusTrap, usePresence, useScrollLock } from '../../../core';
import type { DismissReason } from '../../../core';

import './Dialog.css';

/** 与 Dialog.css 中离场动画时长保持一致 */
const EXIT_DURATION = 140;
/** 与 Dialog.css 中 elyri-ui-dialog-bump 时长保持一致 */
const SHAKE_DURATION = 320;

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

export interface DialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 不渲染自带按钮，把行为合并到唯一子元素上（如 <Button>） */
  asChild?: boolean;
}

function DialogTrigger({ asChild = false, className, children, onClick, ...rest }: DialogTriggerProps) {
  const { open, setOpen, triggerRef, baseId } = useDialogContext();

  const props = {
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': open,
    'aria-controls': `${baseId}-content`,
    ...rest,
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) setOpen(!open);
    },
  };

  if (asChild) {
    return (
      <Slot {...props} ref={triggerRef as Ref<HTMLElement>} className={className}>
        {children}
      </Slot>
    );
  }

  return (
    <button type="button" ref={triggerRef} className={cn('elyri-ui-dialog__trigger', className)} {...props}>
      {children}
    </button>
  );
}

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  /** 点击遮罩关闭，默认 true；为 false 时点击遮罩面板会轻弹提示 */
  closeOnOverlayClick?: boolean;
  /** 按 Escape 关闭，默认 true；为 false 时按 Escape 面板会轻弹提示 */
  closeOnEscape?: boolean;
  /** 显示右上角关闭按钮，默认 true */
  showCloseButton?: boolean;
  /** 右上角关闭按钮的无障碍名称，默认 'Close' */
  closeLabel?: string;
}

function DialogContent({
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  closeLabel = 'Close',
  className,
  children,
  ...rest
}: DialogContentProps) {
  const { open, setOpen, baseId, modal, hasTitle, hasDescription } = useDialogContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const refs = useMemo<RefObject<HTMLElement | null>[]>(() => [contentRef], []);
  const present = usePresence(open, EXIT_DURATION);
  const [shaking, setShaking] = useState(false);

  const handleDismiss = useCallback(
    (reason: DismissReason) => {
      const allowed = reason === 'escape' ? closeOnEscape : closeOnOverlayClick;
      if (allowed) setOpen(false);
      else if (modal) setShaking(true);
    },
    [closeOnEscape, closeOnOverlayClick, modal, setOpen],
  );

  useEffect(() => {
    if (!shaking) return;
    const timer = setTimeout(() => setShaking(false), SHAKE_DURATION);
    return () => clearTimeout(timer);
  }, [shaking]);

  // 离场动画期间保持滚动锁定，避免滚动条提前出现导致页面抖动
  useScrollLock(present && modal);
  useFocusTrap(contentRef, open && modal);
  useDismiss({ open, onDismiss: handleDismiss, refs });

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
          data-shake={(shaking && open) || undefined}
          data-closable={showCloseButton || undefined}
          className={cn('elyri-ui-dialog__content', className)}
          {...rest}
        >
          {children}
          {showCloseButton && (
            <button
              type="button"
              aria-label={closeLabel}
              className="elyri-ui-dialog__corner-close"
              onClick={() => setOpen(false)}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </Portal>
  );
}

function DialogHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('elyri-ui-dialog__header', className)} {...rest} />;
}

/** 可滚动主体：内容溢出时在对应边缘显示分割线 */
function DialogBody({ className, onScroll, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ top: false, bottom: false });

  const updateEdges = useCallback(() => {
    const body = bodyRef.current;
    if (!body) return;
    const top = body.scrollTop > 0;
    const bottom = body.scrollTop + body.clientHeight < body.scrollHeight - 1;
    setEdges((prev) => (prev.top === top && prev.bottom === bottom ? prev : { top, bottom }));
  }, []);

  useEffect(() => {
    const body = bodyRef.current;
    updateEdges();
    if (!body || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(body);
    for (const child of body.children) observer.observe(child);
    return () => observer.disconnect();
  }, [updateEdges]);

  return (
    <div
      ref={bodyRef}
      className={cn('elyri-ui-dialog__body', className)}
      data-scroll-top={edges.top || undefined}
      data-scroll-bottom={edges.bottom || undefined}
      onScroll={(event) => {
        onScroll?.(event);
        updateEdges();
      }}
      {...rest}
    />
  );
}

function DialogFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('elyri-ui-dialog__footer', className)} {...rest} />;
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

export interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 不渲染自带按钮，把关闭行为合并到唯一子元素上（如 <Button>） */
  asChild?: boolean;
}

function DialogClose({ asChild = false, className, children, onClick, ...rest }: DialogCloseProps) {
  const { setOpen } = useDialogContext();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) setOpen(false);
  };

  if (asChild) {
    return (
      <Slot {...rest} className={className} onClick={handleClick}>
        {children}
      </Slot>
    );
  }

  return (
    <button type="button" className={cn('elyri-ui-dialog__close', className)} {...rest} onClick={handleClick}>
      {children}
    </button>
  );
}

/** 对话框：复合组件，含触发、遮罩、分区布局、焦点管理与滚动锁定 */
export const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Content: DialogContent,
  Header: DialogHeader,
  Body: DialogBody,
  Footer: DialogFooter,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
});
