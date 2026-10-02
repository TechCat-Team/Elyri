import { useCallback, useId, useMemo, useRef } from 'react';
import type { ButtonHTMLAttributes, KeyboardEvent, MouseEvent, ReactNode, RefObject, Ref } from 'react';

import {
  MenuCheckboxItem,
  MenuClassProvider,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuProvider,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  Slot,
  cn,
  useControllableState,
  useMenuContext,
} from '../../../core';
import type {
  Alignment,
  MenuCheckboxItemProps,
  MenuContentProps,
  MenuContextValue,
  MenuItemProps,
  MenuRadioGroupProps,
  MenuSubProps,
  Placement,
} from '../../../core';

import './DropdownMenu.css';

/**
 * 下拉菜单：menu / menuitem 语义，方向键与 Home / End 导航、typeahead 跳转，
 * 开合时管理焦点。菜单项支持普通 / 勾选 / 单选 / 子菜单，均可保持打开或选中后关闭。
 */
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
  const layers = useRef<RefObject<HTMLElement | null>[]>([]);
  const subsRef = useRef<Set<() => void>>(new Set());
  const closeRoot = useCallback(
    (restoreFocus: boolean) => {
      if (restoreFocus) restoreFocusRef.current = true;
      setOpen(false);
    },
    [setOpen],
  );

  const value = useMemo<MenuContextValue>(
    () => ({
      open: isOpen,
      setOpen,
      anchorRef: triggerRef,
      focusTargetRef: triggerRef,
      placement,
      align,
      offset,
      baseId,
      layers,
      restoreFocusRef,
      subsRef,
      closeRoot,
      submenu: false,
    }),
    [isOpen, setOpen, baseId, placement, align, offset, closeRoot],
  );

  return (
    <MenuProvider value={value}>
      <MenuClassProvider prefix="elyri-ui-dropdown-menu">{children}</MenuClassProvider>
    </MenuProvider>
  );
}

export interface DropdownMenuTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 不渲染自带按钮，把行为合并到唯一子元素上（如 <Button>） */
  asChild?: boolean;
}

function DropdownMenuTrigger({
  asChild = false,
  className,
  children,
  onClick,
  onKeyDown,
  ...rest
}: DropdownMenuTriggerProps) {
  const { open, setOpen, anchorRef, baseId } = useMenuContext();

  const props = {
    id: `${baseId}-trigger`,
    'aria-haspopup': 'menu' as const,
    'aria-expanded': open,
    'aria-controls': `${baseId}-content`,
    ...rest,
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) setOpen(!open);
    },
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        setOpen(true);
      }
    },
  };

  if (asChild) {
    return (
      <Slot {...props} ref={anchorRef as Ref<HTMLElement>} className={className}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      type="button"
      ref={anchorRef as Ref<HTMLButtonElement>}
      className={cn('elyri-ui-dropdown-menu__trigger', className)}
      {...props}
    >
      {children}
    </button>
  );
}

export type DropdownMenuContentProps = MenuContentProps;
export type DropdownMenuItemProps = MenuItemProps;
export type DropdownMenuCheckboxItemProps = MenuCheckboxItemProps;
export type DropdownMenuRadioGroupProps = MenuRadioGroupProps;
export type DropdownMenuSubProps = MenuSubProps;

/** 下拉菜单根组件与各部件，用法与 shadcn 风格一致 */
export const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Trigger: DropdownMenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  CheckboxItem: MenuCheckboxItem,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  Group: MenuGroup,
  Label: MenuLabel,
  Separator: MenuSeparator,
  Shortcut: MenuShortcut,
  Sub: MenuSub,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuSubContent,
});
