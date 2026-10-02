import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode, RefObject } from 'react';

import { useControllableState } from '../hooks/useControllableState';
import { useDismiss } from '../hooks/useDismiss';
import type { DismissReason } from '../hooks/useDismiss';
import { useFloatingPosition } from '../hooks/useFloatingPosition';
import type { Alignment, Placement } from '../hooks/useFloatingPosition';
import { usePresence } from '../hooks/usePresence';
import { cn } from '../utils/cn';

import { Portal } from './Portal';

/** 与菜单离场动画时长保持一致 */
const EXIT_DURATION = 120;

/** 可参与键盘导航的菜单项：普通项、勾选项与单选项 */
const ITEM_SELECTOR =
  '[role="menuitem"]:not([data-disabled]), ' +
  '[role="menuitemcheckbox"]:not([data-disabled]), ' +
  '[role="menuitemradio"]:not([data-disabled])';

/** 只读一个 .current 的引用类型，兼容 React 18 / 19 的 useRef 返回值 */
interface MutableRef<T> {
  current: T;
}

/**
 * 菜单元件共用一套逻辑：DropdownMenu 与 ContextMenu 只是锚点不同，
 * 通过 MenuProvider 注入状态、通过 MenuClassProvider 注入各自的类名前缀。
 */
export interface MenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** 定位锚点：根菜单是触发元素或右键位置，子菜单是父级项 */
  anchorRef: RefObject<HTMLElement | null>;
  /** 关闭后焦点归还的元素 */
  focusTargetRef: RefObject<HTMLElement | null>;
  placement: Placement;
  align: Alignment;
  offset: number;
  baseId: string;
  /** 整棵菜单树共享的浮层引用，供根级判断“外部点击” */
  layers: MutableRef<RefObject<HTMLElement | null>[]>;
  /** 关闭时是否把焦点交还锚点（仅 Escape、选择与左键退回） */
  restoreFocusRef: MutableRef<boolean>;
  /** 当前层打开的子菜单关闭函数，导航换项时统一收起 */
  subsRef: MutableRef<Set<() => void>>;
  /** 关闭整棵菜单，restoreFocus 决定是否把焦点交还根触发元素 */
  closeRoot: (restoreFocus: boolean) => void;
  /** 是否为子菜单内容 */
  submenu: boolean;
}

const MenuContext = createContext<MenuContextValue | null>(null);

/** 取最近一层菜单状态，必须在 MenuProvider 内使用 */
export function useMenuContext() {
  const context = useContext(MenuContext);
  if (!context) throw new Error('菜单子组件必须放在 <DropdownMenu> 或 <ContextMenu> 内使用');
  return context;
}

/** 根 / 子菜单统一的状态注入，同时把锚点登记为浮层，外部点击时忽略 */
export function MenuProvider({ value, children }: { value: MenuContextValue; children?: ReactNode }) {
  const { anchorRef, layers } = value;

  useEffect(() => {
    // layers.current 始终是同一个数组（只增删元素），可安全地在清理时复用
    const list = layers.current;
    list.push(anchorRef);
    return () => {
      const index = list.indexOf(anchorRef);
      if (index >= 0) list.splice(index, 1);
    };
  }, [layers, anchorRef]);

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

const MenuClassContext = createContext('elyri-ui-menu');

/** 注入类名前缀，如 elyri-ui-dropdown-menu / elyri-ui-context-menu */
export function MenuClassProvider({ prefix, children }: { prefix: string; children?: ReactNode }) {
  return <MenuClassContext.Provider value={prefix}>{children}</MenuClassContext.Provider>;
}

const usePrefix = () => useContext(MenuClassContext);

/**
 * 菜单键盘导航：方向键 / Home / End 移动，可打印字符走 typeahead。
 * onNavigate 在换项后调用，用于收起已展开的子菜单。
 */
function useMenuNavigation(contentRef: RefObject<HTMLElement | null>, onNavigate?: () => void) {
  // typeahead：输入字符跳转到匹配项，500ms 后清空缓冲
  const typeahead = useRef({ query: '', timer: undefined as ReturnType<typeof setTimeout> | undefined });

  useEffect(() => () => clearTimeout(typeahead.current.timer), []);

  const items = () => [...(contentRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? [])];

  const moveFocus = (index: number) => {
    const list = items();
    if (list.length === 0) return;
    const next = (index + list.length) % list.length;
    list[next].focus();
    onNavigate?.();
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
    if (match) match.focus();
  };

  /** 处理方向键与首字母跳转，命中则返回 true */
  const handleNavigateKey = (event: KeyboardEvent<HTMLElement>) => {
    // 可打印字符走 typeahead；空格留给原生按钮激活
    if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      matchTypeahead(event.key);
      return true;
    }

    const list = items();
    const current = list.indexOf(document.activeElement as HTMLElement);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveFocus(current + 1);
        return true;
      case 'ArrowUp':
        event.preventDefault();
        moveFocus(current - 1);
        return true;
      case 'Home':
        event.preventDefault();
        moveFocus(0);
        return true;
      case 'End':
        event.preventDefault();
        moveFocus(list.length - 1);
        return true;
      default:
        return false;
    }
  };

  return { moveFocus, handleNavigateKey };
}

export interface MenuContentProps extends HTMLAttributes<HTMLDivElement> {
  /** 子菜单内容：不接管外部点击，Escape / 左键退回父级 */
  submenu?: boolean;
}

/** 菜单容器，role="menu"，负责定位、进出场与键盘导航 */
export function MenuContent({ submenu = false, className, children, onKeyDown, ...rest }: MenuContentProps) {
  const {
    open,
    setOpen,
    anchorRef,
    focusTargetRef,
    layers,
    subsRef,
    closeRoot,
    baseId,
    placement,
    align,
    offset,
    restoreFocusRef,
  } = useMenuContext();
  const prefix = usePrefix();
  const contentRef = useRef<HTMLDivElement>(null);
  const present = usePresence(open, EXIT_DURATION);
  const position = useFloatingPosition(anchorRef, contentRef, { open: present, placement, align, offset });

  const closeSubs = useCallback(() => {
    for (const close of subsRef.current) close();
  }, [subsRef]);

  const nav = useMenuNavigation(contentRef, closeSubs);

  // 内容也登记为浮层，点击菜单内部不会触发外部关闭
  useEffect(() => {
    const list = layers.current;
    list.push(contentRef);
    return () => {
      const index = list.indexOf(contentRef);
      if (index >= 0) list.splice(index, 1);
    };
  }, [layers]);

  // 根菜单接管外部点击与 Escape；子菜单由父级统一关闭
  const dismiss = useCallback(
    (reason: DismissReason) => {
      restoreFocusRef.current = reason === 'escape';
      setOpen(false);
    },
    [restoreFocusRef, setOpen],
  );
  useDismiss({ open: !submenu && open, onDismiss: dismiss, refs: layers.current });

  const hasOpened = useRef(false);
  useEffect(() => {
    if (open) {
      hasOpened.current = true;
      restoreFocusRef.current = false;
      nav.moveFocus(0);
    } else if (hasOpened.current) {
      hasOpened.current = false;
      if (restoreFocusRef.current) activate(focusTargetRef.current);
      restoreFocusRef.current = false;
    }
    // 仅在开关变化时移动焦点
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        restoreFocusRef.current = true;
        setOpen(false);
        return;
      case 'Tab':
        event.preventDefault();
        event.stopPropagation();
        closeRoot(false);
        return;
      case 'ArrowLeft':
        if (submenu) {
          event.preventDefault();
          event.stopPropagation();
          restoreFocusRef.current = true;
          setOpen(false);
          return;
        }
        break;
      case 'ArrowRight':
        // 展开更深层的子菜单由聚焦的 SubTrigger 处理
        return;
      default:
        break;
    }

    nav.handleNavigateKey(event);
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
        className={cn(`${prefix}__content`, className)}
        style={{ top: position.top, left: position.left }}
        {...rest}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </Portal>
  );
}

/** 关闭后把焦点交还目标元素（子菜单触发项 / 根触发元素） */
function activate(element: HTMLElement | null) {
  element?.focus();
}

export interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 选中回调；在回调里调用 event.preventDefault() 可让菜单保持打开 */
  onSelect?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** 危险操作（如删除）显示为警示色 */
  danger?: boolean;
}

/** 普通菜单项，role="menuitem"，选中后默认关闭 */
export function MenuItem({
  onSelect,
  danger,
  disabled,
  className,
  children,
  onClick,
  onPointerMove,
  ...rest
}: MenuItemProps) {
  const { closeRoot } = useMenuContext();
  const prefix = usePrefix();

  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      disabled={disabled}
      data-disabled={disabled || undefined}
      className={cn(`${prefix}__item`, danger && `${prefix}__item--danger`, className)}
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
        // onSelect 里 preventDefault 表示“保持打开”（如触发一次异步动作）
        if (event.defaultPrevented) return;
        // 选中叶项关闭整棵菜单，焦点回到根触发元素（子菜单里也一样）
        closeRoot(true);
      }}
    >
      {children}
    </button>
  );
}

const MenuRadioGroupContext = createContext<{ value: string; setValue: (value: string) => void } | null>(null);

export interface MenuRadioGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** 受控选中值 */
  value?: string;
  /** 非受控初始选中值 */
  defaultValue?: string;
  /** 选中值变化回调 */
  onValueChange?: (value: string) => void;
}

/** 单选项分组，role="group" */
export function MenuRadioGroup({ value, defaultValue = '', onValueChange, children, ...rest }: MenuRadioGroupProps) {
  const prefix = usePrefix();
  const [current, setValue] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const context = useMemo(() => ({ value: current, setValue }), [current, setValue]);

  return (
    <MenuRadioGroupContext.Provider value={context}>
      <div role="group" className={`${prefix}__group`} {...rest}>
        {children}
      </div>
    </MenuRadioGroupContext.Provider>
  );
}

/** 单选菜单项，role="menuitemradio"，选中后保持打开 */
export function MenuRadioItem({
  value,
  danger,
  disabled,
  className,
  children,
  onClick,
  onPointerMove,
  ...rest
}: MenuItemCheckableProps & { value: string }) {
  const group = useContext(MenuRadioGroupContext);
  if (!group) throw new Error('<DropdownMenu.RadioItem> 必须放在 <DropdownMenu.RadioGroup> 内使用');
  const prefix = usePrefix();
  const checked = group.value === value;

  return (
    <button
      type="button"
      role="menuitemradio"
      tabIndex={-1}
      aria-checked={checked}
      disabled={disabled}
      data-disabled={disabled || undefined}
      data-state={checked ? 'checked' : 'unchecked'}
      className={cn(`${prefix}__item`, danger && `${prefix}__item--danger`, className)}
      {...rest}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (!disabled && document.activeElement !== event.currentTarget) event.currentTarget.focus();
      }}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled) return;
        group.setValue(value);
        // 单选项不关闭菜单，保持在同一分组内继续切换
        event.preventDefault();
      }}
    >
      <MenuIndicator prefix={prefix}>
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <circle cx="6" cy="6" r="3" fill="currentColor" />
          </svg>
        )}
      </MenuIndicator>
      {children}
    </button>
  );
}

export interface MenuCheckboxItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** 受控选中态 */
  checked?: boolean;
  /** 非受控初始选中态 */
  defaultChecked?: boolean;
  /** 选中态变化回调 */
  onCheckedChange?: (checked: boolean) => void;
  /** 危险操作显示为警示色 */
  danger?: boolean;
}

/** 可勾选菜单项，role="menuitemcheckbox"，切换后保持打开 */
export function MenuCheckboxItem({
  checked,
  defaultChecked,
  onCheckedChange,
  danger,
  disabled,
  className,
  children,
  onClick,
  onPointerMove,
  ...rest
}: MenuCheckboxItemProps) {
  const prefix = usePrefix();
  const [isChecked, setChecked] = useControllableState({
    value: checked,
    defaultValue: defaultChecked ?? false,
    onChange: onCheckedChange,
  });

  return (
    <button
      type="button"
      role="menuitemcheckbox"
      tabIndex={-1}
      aria-checked={isChecked}
      disabled={disabled}
      data-disabled={disabled || undefined}
      data-state={isChecked ? 'checked' : 'unchecked'}
      className={cn(`${prefix}__item`, danger && `${prefix}__item--danger`, className)}
      {...rest}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (!disabled && document.activeElement !== event.currentTarget) event.currentTarget.focus();
      }}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled) return;
        setChecked(!isChecked);
        // 勾选项不关闭菜单，方便连续切换多项
        event.preventDefault();
      }}
    >
      <MenuIndicator prefix={prefix}>
        {isChecked && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </MenuIndicator>
      {children}
    </button>
  );
}

type MenuItemCheckableProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  /** 危险操作显示为警示色 */
  danger?: boolean;
};

/** 勾选 / 单选共用的左侧指示位，占位保证文字对齐 */
function MenuIndicator({ prefix, children }: { prefix: string; children?: ReactNode }) {
  return (
    <span className={`${prefix}__item-indicator`} aria-hidden="true">
      {children}
    </span>
  );
}

/** 分组，role="group"，可配 aria-label 描述 */
export function MenuGroup({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const prefix = usePrefix();
  return <div role="group" className={cn(`${prefix}__group`, className)} {...rest} />;
}

/** 分组标题 */
export function MenuLabel({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const prefix = usePrefix();
  return <div role="presentation" className={cn(`${prefix}__label`, className)} {...rest} />;
}

/** 分隔线 */
export function MenuSeparator({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const prefix = usePrefix();
  return <div role="separator" className={cn(`${prefix}__separator`, className)} {...rest} />;
}

/** 右侧快捷键提示，如 ⌘K */
export function MenuShortcut({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  const prefix = usePrefix();
  return <span className={cn(`${prefix}__shortcut`, className)} {...rest} />;
}

interface MenuSubHover {
  scheduleOpen: () => void;
  scheduleClose: () => void;
  cancelClose: () => void;
}

const MenuSubHoverContext = createContext<MenuSubHover | null>(null);

/** 子菜单悬停开合延迟，避免误触与闪烁 */
const SUB_OPEN_DELAY = 80;
const SUB_CLOSE_DELAY = 120;

export interface MenuSubProps {
  /** 受控开关 */
  open?: boolean;
  /** 非受控初始开关 */
  defaultOpen?: boolean;
  /** 开关变化回调 */
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/** 子菜单：拥有独立的开关与锚点，但浮层引用与父级共享 */
export function MenuSub({ open, defaultOpen = false, onOpenChange, children }: MenuSubProps) {
  const parent = useMenuContext();
  const prefix = usePrefix();
  const [isOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const baseId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef(false);
  const subsRef = useRef<Set<() => void>>(new Set());

  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hover = useMemo<MenuSubHover>(
    () => ({
      scheduleOpen: () => {
        clearTimeout(closeTimer.current);
        openTimer.current = setTimeout(() => setOpen(true), SUB_OPEN_DELAY);
      },
      cancelClose: () => clearTimeout(closeTimer.current),
      scheduleClose: () => {
        clearTimeout(openTimer.current);
        closeTimer.current = setTimeout(() => setOpen(false), SUB_CLOSE_DELAY);
      },
    }),
    [setOpen],
  );
  useEffect(
    () => () => {
      clearTimeout(openTimer.current);
      clearTimeout(closeTimer.current);
    },
    [],
  );

  // 父级关闭时同步收起子菜单
  useEffect(() => {
    if (!parent.open) setOpen(false);
  }, [parent.open, setOpen]);

  // 登记到父级：父级导航换项时统一收起
  const closeSelf = useCallback(() => setOpen(false), [setOpen]);
  useEffect(() => {
    const subs = parent.subsRef.current;
    subs.add(closeSelf);
    return () => {
      subs.delete(closeSelf);
    };
  }, [parent.subsRef, closeSelf]);

  const value = useMemo<MenuContextValue>(
    () => ({
      open: isOpen,
      setOpen,
      anchorRef: triggerRef,
      focusTargetRef: triggerRef,
      placement: 'right',
      align: 'start',
      offset: 4,
      baseId,
      layers: parent.layers,
      restoreFocusRef,
      subsRef,
      closeRoot: parent.closeRoot,
      submenu: true,
    }),
    [isOpen, setOpen, baseId, parent.layers, parent.closeRoot],
  );

  return (
    <MenuSubHoverContext.Provider value={hover}>
      <MenuProvider value={value}>
        <MenuClassProvider prefix={prefix}>{children}</MenuClassProvider>
      </MenuProvider>
    </MenuSubHoverContext.Provider>
  );
}

export interface MenuSubTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 危险操作显示为警示色 */
  danger?: boolean;
}

/** 子菜单触发项，role="menuitem"，带 aria-haspopup 与展开箭头 */
export function MenuSubTrigger({
  danger,
  disabled,
  className,
  children,
  onClick,
  onKeyDown,
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
  ...rest
}: MenuSubTriggerProps) {
  const { open, setOpen, anchorRef, baseId } = useMenuContext();
  const hover = useContext(MenuSubHoverContext);
  const prefix = usePrefix();

  return (
    <button
      type="button"
      ref={anchorRef as RefObject<HTMLButtonElement>}
      id={`${baseId}-trigger`}
      role="menuitem"
      tabIndex={-1}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={`${baseId}-content`}
      disabled={disabled}
      data-disabled={disabled || undefined}
      data-state={open ? 'open' : 'closed'}
      className={cn(`${prefix}__item`, `${prefix}__sub-trigger`, danger && `${prefix}__item--danger`, className)}
      {...rest}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (!disabled && document.activeElement !== event.currentTarget) event.currentTarget.focus();
      }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (!disabled) hover?.scheduleOpen();
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        hover?.scheduleClose();
      }}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled) return;
        setOpen(!open);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
        } else if (event.key === 'Escape' && open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
        }
      }}
    >
      {children}
      <span className={`${prefix}__sub-arrow`} aria-hidden="true">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      </span>
    </button>
  );
}

export type MenuSubContentProps = MenuContentProps;

/** 子菜单内容，复用 MenuContent 但锚定父级触发项 */
export function MenuSubContent({ className, onPointerEnter, onPointerLeave, ...rest }: MenuSubContentProps) {
  const hover = useContext(MenuSubHoverContext);
  const prefix = usePrefix();

  return (
    <MenuContent
      submenu
      className={cn(`${prefix}__sub-content`, className)}
      {...rest}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        hover?.cancelClose();
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        hover?.scheduleClose();
      }}
    />
  );
}
