import { createContext, useCallback, useContext, useId, useMemo, useRef, useState } from 'react';
import type { HTMLAttributes, MouseEvent, ReactNode, RefObject } from 'react';

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

import './ContextMenu.css';

/** 记录右键位置，供触发项与锚点共享 */
const ContextMenuPointContext = createContext<((x: number, y: number) => void) | null>(null);

/**
 * 右键菜单：在指针位置弹出，与 DropdownMenu 共用一套菜单逻辑与部件，
 * 同样支持勾选 / 单选 / 分组 / 子菜单与键盘导航。
 */
export interface ContextMenuProps {
  /** 受控开关 */
  open?: boolean;
  /** 非受控初始开关，默认 false */
  defaultOpen?: boolean;
  /** 开关变化回调 */
  onOpenChange?: (open: boolean) => void;
  /** 相对指针的期望方向，默认 bottom */
  placement?: Placement;
  /** 相对指针的交叉轴对齐，默认 start */
  align?: Alignment;
  /** 与指针的间距，默认 2 */
  offset?: number;
  children?: ReactNode;
}

function ContextMenuRoot({
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom',
  align = 'start',
  offset = 2,
  children,
}: ContextMenuProps) {
  const [isOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const baseId = useId();
  const pointRef = useRef<HTMLSpanElement>(null);
  const focusTargetRef = useRef<HTMLElement>(null);
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const layers = useRef<RefObject<HTMLElement | null>[]>([]);
  const restoreFocusRef = useRef(false);
  const subsRef = useRef<Set<() => void>>(new Set());
  const closeRoot = useCallback(
    (restoreFocus: boolean) => {
      if (restoreFocus) restoreFocusRef.current = true;
      setOpen(false);
    },
    [setOpen],
  );
  // 零尺寸锚点：把指针位置交给统一的浮层定位
  const movePoint = useCallback((x: number, y: number) => setPoint({ x, y }), []);

  const value = useMemo<MenuContextValue>(
    () => ({
      open: isOpen,
      setOpen,
      anchorRef: pointRef,
      focusTargetRef,
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
    <ContextMenuPointContext.Provider value={movePoint}>
      <MenuProvider value={value}>
        <MenuClassProvider prefix="elyri-ui-context-menu">
          <span
            ref={pointRef}
            className="elyri-ui-context-menu__anchor"
            style={{ top: point.y, left: point.x }}
            aria-hidden="true"
          />
          {children}
        </MenuClassProvider>
      </MenuProvider>
    </ContextMenuPointContext.Provider>
  );
}

export interface ContextMenuTriggerProps extends HTMLAttributes<HTMLDivElement> {
  /** 不渲染自带容器，把行为合并到唯一子元素上 */
  asChild?: boolean;
}

function ContextMenuTrigger({ asChild = false, className, children, onContextMenu, ...rest }: ContextMenuTriggerProps) {
  const { open, setOpen, baseId, focusTargetRef } = useMenuContext();
  const movePoint = useContext(ContextMenuPointContext);

  // 右键触发不是 disclosure 控件，不加 aria-expanded / haspopup，避免在非按钮元素上使用不支持的 ARIA
  const props = {
    id: `${baseId}-trigger`,
    'data-state': open ? 'open' : 'closed',
    ...rest,
    onContextMenu: (event: MouseEvent<HTMLDivElement>) => {
      onContextMenu?.(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      movePoint?.(event.clientX, event.clientY);
      focusTargetRef.current = event.currentTarget as HTMLElement;
      setOpen(true);
    },
  };

  if (asChild) {
    return (
      <Slot {...props} className={className}>
        {children}
      </Slot>
    );
  }

  return (
    <div tabIndex={-1} className={cn('elyri-ui-context-menu__trigger', className)} {...props}>
      {children}
    </div>
  );
}

export type ContextMenuContentProps = MenuContentProps;
export type ContextMenuItemProps = MenuItemProps;
export type ContextMenuCheckboxItemProps = MenuCheckboxItemProps;
export type ContextMenuRadioGroupProps = MenuRadioGroupProps;
export type ContextMenuSubProps = MenuSubProps;

/** 右键菜单根组件与各部件 */
export const ContextMenu = Object.assign(ContextMenuRoot, {
  Trigger: ContextMenuTrigger,
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
