import { createContext, useContext, useEffect, useId, useMemo, useRef } from 'react';
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  RefObject,
} from 'react';

import { Portal, cn, useControllableState, useDismiss, useFloatingPosition, usePresence } from '../../../core';
import type { Alignment, DismissReason, Placement } from '../../../core';

import './DropdownMenu.css';

/** 与 DropdownMenu.css 中离场动画时长保持一致 */
const EXIT_DURATION = 120;

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  baseId: string;
  placement: Placement;
  align: Alignment;
  offset: number;
  /** 标记本次关闭是否应把焦点交还触发元素（仅 Escape 与选择时） */
  restoreFocusRef: { current: boolean };
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

const useDropdownMenuContext = () => {
  const context = useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenu 的子组件必须放在 <DropdownMenu> 内使用');
  return context;
};

export interface DropdownMenuProps {
  /** 受控开关 */
  open?: boolean;
  /** 非受控初始开关，默认 false */
  defaultOpen?: boolean;
  /** 开关变化回调 */
  onOpenChange?: (open: boolean) => void;
  /** 期望方向，默认 bottom */
  placement?: Placement;
  /** 交叉轴对齐，默认 start */
  align?: Alignment;
  /** 与触发元素的间距，默认 4 */
  offset?: number;
  children?: ReactNode;
}

function DropdownMenuRoot({
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom',
  align = 'start',
  offset = 4,
  children,
}: DropdownMenuProps) {
  const [isOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const baseId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef(false);

  const value = useMemo<DropdownMenuContextValue>(
    () => ({ open: isOpen, setOpen, triggerRef, baseId, placement, align, offset, restoreFocusRef }),
    [isOpen, setOpen, baseId, placement, align, offset],
  );

  return <DropdownMenuContext.Provider value={value}>{children}</DropdownMenuContext.Provider>;
}

export type DropdownMenuTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

function DropdownMenuTrigger({ className, children, onClick, onKeyDown, ...rest }: DropdownMenuTriggerProps) {
  const { open, setOpen, triggerRef, baseId } = useDropdownMenuContext();

  return (
    <button
      type="button"
      ref={triggerRef}
      id={`${baseId}-trigger`}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={`${baseId}-content`}
      className={cn('elyri-ui-dropdown-menu__trigger', className)}
      {...rest}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(!open);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          setOpen(true);
        }
      }}
    >
      {children}
    </button>
  );
}

export type DropdownMenuContentProps = HTMLAttributes<HTMLDivElement>;

function DropdownMenuContent({ className, children, onKeyDown, ...rest }: DropdownMenuContentProps) {
  const { open, setOpen, triggerRef, baseId, placement, align, offset, restoreFocusRef } = useDropdownMenuContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const refs = useMemo<RefObject<HTMLElement | null>[]>(() => [triggerRef, contentRef], [triggerRef]);
  const present = usePresence(open, EXIT_DURATION);
  const position = useFloatingPosition(triggerRef, contentRef, { open: present, placement, align, offset });
  // 只有 Escape 与选择项两种关闭路径才把焦点交还触发元素，外部点击/Tab 不抢焦点
  const dismiss = useMemo(
    () => (reason: DismissReason) => {
      restoreFocusRef.current = reason === 'escape';
      setOpen(false);
    },
    [setOpen, restoreFocusRef],
  );
  // 关闭时把焦点交还触发元素（仅当菜单确实打开过）
  const hasOpened = useRef(false);
  // typeahead：输入字符跳转到匹配项，500ms 后清空缓冲
  const typeahead = useRef({ query: '', timer: undefined as ReturnType<typeof setTimeout> | undefined });

  useDismiss({ open, onDismiss: dismiss, refs });

  useEffect(() => () => clearTimeout(typeahead.current.timer), []);

  const items = () => [
    ...(contentRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([data-disabled])') ?? []),
  ];

  const moveFocus = (index: number) => {
    const list = items();
    if (list.length === 0) return;
    const next = (index + list.length) % list.length;
    list[next].focus();
  };

  const matchTypeahead = (char: string) => {
    const state = typeahead.current;
    clearTimeout(state.timer);
    state.query += char.toLowerCase();
    state.timer = setTimeout(() => {
      state.query = '';
    }, 500);

    const list = items();
    // 从当前项之后开始找，重复输入同一字符可循环跳转
    const from = list.indexOf(document.activeElement as HTMLElement) + 1;
    const ordered = [...list.slice(from), ...list.slice(0, from)];
    const text = (item: HTMLElement) => (item.textContent ?? '').trim().toLowerCase();

    let match = ordered.find((item) => text(item).startsWith(state.query));
    if (!match && state.query.length > 1) {
      // 多字符未命中时退回最后一个字符再试（处理连续单字符跳转）
      state.query = state.query.at(-1) ?? '';
      match = ordered.find((item) => text(item).startsWith(state.query));
    }
    if (!match) return;

    match.focus();
  };

  useEffect(() => {
    if (open) {
      hasOpened.current = true;
      restoreFocusRef.current = false;
      moveFocus(0);
    } else if (hasOpened.current) {
      hasOpened.current = false;
      if (restoreFocusRef.current) triggerRef.current?.focus();
      restoreFocusRef.current = false;
    }
    // 仅在开关变化时移动焦点
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    // 可打印字符走 typeahead；空格留给原生按钮激活
    if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      matchTypeahead(event.key);
      return;
    }

    const list = items();
    const current = list.indexOf(document.activeElement as HTMLElement);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveFocus(current + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveFocus(current - 1);
        break;
      case 'Home':
        event.preventDefault();
        moveFocus(0);
        break;
      case 'End':
        event.preventDefault();
        moveFocus(list.length - 1);
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  };

  if (!present) return null;

  return (
    <Portal>
      <div
        ref={contentRef}
        id={`${baseId}-content`}
        role="menu"
        aria-labelledby={`${baseId}-trigger`}
        tabIndex={-1}
        data-state={open ? 'open' : 'closed'}
        data-placement={position.placement}
        className={cn('elyri-ui-dropdown-menu__content', className)}
        style={{ top: position.top, left: position.left }}
        {...rest}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </Portal>
  );
}

export interface DropdownMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 选中回调，随后菜单关闭 */
  onSelect?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** 危险操作（如删除）显示为警示色 */
  danger?: boolean;
}

function DropdownMenuItem({
  onSelect,
  danger,
  disabled,
  className,
  children,
  onClick,
  onPointerMove,
  ...rest
}: DropdownMenuItemProps) {
  const { setOpen, restoreFocusRef } = useDropdownMenuContext();

  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      disabled={disabled}
      data-disabled={disabled || undefined}
      className={cn('elyri-ui-dropdown-menu__item', danger && 'elyri-ui-dropdown-menu__item--danger', className)}
      {...rest}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        // 悬停即聚焦，鼠标与键盘共用同一个高亮项
        if (!disabled && document.activeElement !== event.currentTarget) event.currentTarget.focus();
      }}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled) return;
        onSelect?.(event);
        restoreFocusRef.current = true;
        setOpen(false);
      }}
    >
      {children}
    </button>
  );
}

function DropdownMenuLabel({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div role="presentation" className={cn('elyri-ui-dropdown-menu__label', className)} {...rest} />;
}

function DropdownMenuSeparator({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div role="separator" className={cn('elyri-ui-dropdown-menu__separator', className)} {...rest} />;
}

/** 下拉菜单：menu / menuitem 语义，方向键与 Home / End 导航，开合时管理焦点 */
export const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  Label: DropdownMenuLabel,
  Separator: DropdownMenuSeparator,
});
