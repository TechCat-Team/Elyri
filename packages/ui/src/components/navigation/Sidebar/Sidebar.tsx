import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
} from 'react';
import type { HTMLAttributes, KeyboardEvent, MouseEvent, ReactElement, ReactNode } from 'react';

import { cn, Slot, useControllableState } from '../../../core';

import './Sidebar.css';

const PREFIX = 'elyri-ui-sidebar';

/** value 可能含空格等非法 id 字符，清洗后再拼进 id，保证 aria 关联有效 */
const safeId = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '-');

/**
 * 侧边栏折叠态与激活项：可由 SidebarProvider 提升到 Sidebar 之外，
 * 也可由根组件自持。Item / SubItem 通过 value 与 active 决定 aria-current。
 */
interface SidebarStateValue {
  collapsed: boolean;
  collapsible: boolean;
  setCollapsed: (collapsed: boolean) => void;
  active: string;
  setActive: (value: string) => void;
}

/** SidebarProvider 注入的共享状态，供顶部导航栏等 Sidebar 之外的按钮读取 */
const SidebarStateContext = createContext<SidebarStateValue | null>(null);

/** 根组件在状态之外再补一个 DOM id 前缀 */
interface SidebarContextValue extends SidebarStateValue {
  baseId: string;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('Sidebar 的子组件必须放在 <Sidebar> 内使用');
  return context;
}

/** useSidebar 返回值：读取侧边栏状态，并用任意按钮控制折叠 */
export interface SidebarState {
  collapsed: boolean;
  collapsible: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  active: string;
  setActive: (value: string) => void;
}

/**
 * 读写侧边栏状态，把折叠能力挂到自定义按钮上。
 * 放在 <Sidebar> 内可用于 Header / Footer / Content 中的按钮；
 * 放在 <Sidebar> 外（如顶部导航栏）需先用 <SidebarProvider> 包住二者。
 */
export function useSidebar(): SidebarState {
  const root = useContext(SidebarContext);
  const shared = useContext(SidebarStateContext);
  const state = root ?? shared;
  if (!state) throw new Error('useSidebar 必须在 <Sidebar> 或 <SidebarProvider> 内使用');

  const { collapsed, collapsible, setCollapsed, active, setActive } = state;

  const toggleCollapsed = useCallback(() => {
    if (collapsible) setCollapsed(!collapsed);
  }, [collapsible, collapsed, setCollapsed]);

  return { collapsed, collapsible, setCollapsed, toggleCollapsed, active, setActive };
}

/** 子菜单展开态由父级 Item 注入，Sub 只负责渲染可折叠容器 */
const SidebarSubContext = createContext<{ open: boolean; id: string } | null>(null);

/** asChild 时合并到子元素上的属性；显式带上 data-* 便于写入对象字面量 */
type MergedProps = HTMLAttributes<HTMLElement> & { 'data-active'?: string };

/**
 * asChild：把行为合并到唯一子元素上，并用 content 重新填充它的 children，
 * 使图标 / 标签 / 徽标始终处于同一套结构里（折叠态隐藏标签才能生效）。
 */
function withSlot(child: ReactNode, props: MergedProps, content: (childChildren: ReactNode) => ReactNode) {
  const element = Children.only(child) as ReactElement<{ children?: ReactNode }>;
  const next = cloneElement(element, { children: content(element.props.children) });
  return <Slot {...props}>{next}</Slot>;
}

/** 折叠与激活相关属性，Sidebar 与 SidebarProvider 共用 */
export interface SidebarStateProps {
  /** 受控折叠态 */
  collapsed?: boolean;
  /** 非受控初始折叠态，默认 false */
  defaultCollapsed?: boolean;
  /** 折叠态变化回调 */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** 是否允许折叠，默认 true；为 false 时 Trigger 禁用 */
  collapsible?: boolean;
  /** 受控激活项 value */
  active?: string;
  /** 非受控初始激活项 value，默认空字符串（即无激活项） */
  defaultActive?: string;
  /** 激活项变化回调，受控与非受控都会触发 */
  onActiveChange?: (value: string) => void;
}

export type SidebarProps = HTMLAttributes<HTMLElement> & SidebarStateProps;

export interface SidebarProviderProps extends SidebarStateProps {
  children?: ReactNode;
}

/**
 * 把折叠 / 激活状态提升到 Sidebar 之外，让顶部导航栏等外部按钮也能通过
 * useSidebar() 控制侧边栏。放在应用外壳最外层，包住外部按钮与 <Sidebar>。
 * 存在 Provider 时以它为准，Sidebar 自身的状态相关属性会被忽略。
 */
export function SidebarProvider({
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  collapsible = true,
  active,
  defaultActive = '',
  onActiveChange,
  children,
}: SidebarProviderProps) {
  const [isCollapsed, setCollapsed] = useControllableState({
    value: collapsed,
    defaultValue: defaultCollapsed,
    onChange: onCollapsedChange,
  });
  const [current, setActive] = useControllableState({
    value: active,
    defaultValue: defaultActive,
    onChange: onActiveChange,
  });

  const value = useMemo<SidebarStateValue>(
    () => ({ collapsed: isCollapsed, collapsible, setCollapsed, active: current, setActive }),
    [isCollapsed, collapsible, setCollapsed, current, setActive],
  );

  return <SidebarStateContext.Provider value={value}>{children}</SidebarStateContext.Provider>;
}

function SidebarRoot({
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  collapsible = true,
  active,
  defaultActive = '',
  onActiveChange,
  className,
  children,
  ...rest
}: SidebarProps) {
  // Provider 存在时沿用它的状态，忽略根组件自身的状态属性
  const inherited = useContext(SidebarStateContext);

  const [isCollapsed, setCollapsed] = useControllableState({
    value: collapsed,
    defaultValue: defaultCollapsed,
    onChange: onCollapsedChange,
  });
  const [current, setActive] = useControllableState({
    value: active,
    defaultValue: defaultActive,
    onChange: onActiveChange,
  });
  const baseId = useId();

  const state: SidebarStateValue = inherited ?? {
    collapsed: isCollapsed,
    collapsible,
    setCollapsed,
    active: current,
    setActive,
  };

  const context = useMemo<SidebarContextValue>(
    () => ({
      collapsed: state.collapsed,
      collapsible: state.collapsible,
      setCollapsed: state.setCollapsed,
      active: state.active,
      setActive: state.setActive,
      baseId,
    }),
    [state.collapsed, state.collapsible, state.setCollapsed, state.active, state.setActive, baseId],
  );

  return (
    <aside
      className={cn(PREFIX, className)}
      data-collapsed={state.collapsed ? '' : undefined}
      data-collapsible={state.collapsible ? '' : undefined}
      {...rest}
    >
      <SidebarContext.Provider value={context}>{children}</SidebarContext.Provider>
    </aside>
  );
}

export type SidebarHeaderProps = HTMLAttributes<HTMLDivElement>;

/** 顶部区域：品牌、折叠开关等，折叠时只保留 Trigger */
function SidebarHeader({ className, ...rest }: SidebarHeaderProps) {
  return <div className={cn(`${PREFIX}__header`, className)} {...rest} />;
}

export type SidebarFooterProps = HTMLAttributes<HTMLDivElement>;

/** 底部区域：用户信息、设置入口等，折叠时只保留 Trigger */
function SidebarFooter({ className, ...rest }: SidebarFooterProps) {
  return <div className={cn(`${PREFIX}__footer`, className)} {...rest} />;
}

export type SidebarContentProps = HTMLAttributes<HTMLElement>;

/** 导航主体，可滚动 */
function SidebarContent({ className, ...rest }: SidebarContentProps) {
  return <nav className={cn(`${PREFIX}__content`, className)} {...rest} />;
}

export interface SidebarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** 分组标题，折叠时隐藏 */
  label?: ReactNode;
  /** 分组标题前置图标，折叠时保留，用来提示分组语义 */
  icon?: ReactNode;
}

/** 分组：标题 + 一组导航项 */
function SidebarGroup({ label, icon, className, children, ...rest }: SidebarGroupProps) {
  return (
    <div className={cn(`${PREFIX}__group`, className)} {...rest}>
      {label != null ? (
        <div className={`${PREFIX}__group-label`}>
          {icon != null ? (
            <span className={`${PREFIX}__group-icon`} aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <span className={`${PREFIX}__group-text`}>{label}</span>
        </div>
      ) : null}
      <div className={`${PREFIX}__group-items`}>{children}</div>
    </div>
  );
}

export type SidebarSeparatorProps = HTMLAttributes<HTMLDivElement>;

/** 分隔线 */
function SidebarSeparator({ className, ...rest }: SidebarSeparatorProps) {
  return <div role="separator" className={cn(`${PREFIX}__separator`, className)} {...rest} />;
}

interface SidebarItemBaseProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  /** 唯一值，与根组件的 active 对应 */
  value: string;
  /** 前置图标 */
  icon?: ReactNode;
  /** 右侧徽标 / 计数 */
  badge?: ReactNode;
  /** 显式指定激活态，覆盖 root 的 active 匹配 */
  active?: boolean;
  /** 禁用后不可点击，也不参与激活 */
  disabled?: boolean;
  /** 渲染为链接；传 asChild 时可换成路由的 Link */
  href?: string;
  /** 不渲染自带元素，把行为合并到唯一子元素（如 <Link>）上 */
  asChild?: boolean;
  children?: ReactNode;
}

export type SidebarItemProps = SidebarItemBaseProps;
export type SidebarSubItemProps = SidebarItemBaseProps;

/** 图标 / 标签 / 徽标 / 展开箭头的统一结构，叶子项与父项共用 */
function NavItemContent({
  icon,
  badge,
  arrow,
  children,
}: {
  icon?: ReactNode;
  badge?: ReactNode;
  arrow?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <>
      {icon != null ? (
        <span className={`${PREFIX}__item-icon`} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={`${PREFIX}__item-label`}>{children}</span>
      {badge != null ? <span className={`${PREFIX}__item-badge`}>{badge}</span> : null}
      {arrow}
    </>
  );
}

const ArrowIcon = () => (
  <span className={`${PREFIX}__item-arrow`} aria-hidden="true">
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  </span>
);

/** 子树里是否已有激活项，用于自动展开父级 */
function subtreeHasActive(node: ReactNode, active: string): boolean {
  if (active === '') return false;
  let found = false;
  Children.forEach(node, (child) => {
    if (found || !isValidElement(child)) return;
    const props = child.props as { value?: string; active?: boolean; children?: ReactNode };
    if (props.active === true || (props.active !== false && props.value === active)) {
      found = true;
      return;
    }
    if (subtreeHasActive(props.children, active)) found = true;
  });
  return found;
}

/** 导航项：含子级时是可展开的父项，否则是可选中 / 跳转的叶子项 */
function SidebarItem({
  value,
  icon,
  badge,
  active,
  disabled,
  href,
  asChild = false,
  className,
  children,
  onClick,
  onKeyDown,
  ...rest
}: SidebarItemProps) {
  const { active: activeValue, setActive, baseId, collapsed, setCollapsed } = useSidebarContext();

  // 拆出子级导航，其余内容作为标签
  const childArray = Children.toArray(children);
  const subNode = childArray.find((child) => isValidElement(child) && child.type === SidebarSub) ?? null;
  const hasSub = subNode !== null;
  const labelChildren = hasSub ? childArray.filter((child) => child !== subNode) : children;

  const selected = active ?? (activeValue !== '' && value === activeValue);
  const id = `${baseId}-item-${safeId(value)}`;
  const subId = `${baseId}-sub-${safeId(value)}`;

  const activeDescendant = hasSub && subtreeHasActive(subNode, activeValue);
  const [open, setOpen] = useState(activeDescendant);
  // 路由切换导致子级出现激活项时自动展开（React 官方的渲染期状态同步写法）
  const [prevActiveDescendant, setPrevActiveDescendant] = useState(activeDescendant);
  if (activeDescendant !== prevActiveDescendant) {
    setPrevActiveDescendant(activeDescendant);
    if (activeDescendant) setOpen(true);
  }

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) return;
    if (hasSub) {
      // 折叠态下先展开侧边栏，再展开子级
      if (collapsed) {
        setCollapsed(false);
        setOpen(true);
        return;
      }
      setOpen((current) => !current);
      return;
    }
    setActive(value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !hasSub) return;
    if (event.key === 'ArrowRight' && !open) {
      event.preventDefault();
      setOpen(true);
    } else if (event.key === 'ArrowLeft' && open) {
      event.preventDefault();
      setOpen(false);
    }
  };

  const sharedProps: MergedProps = {
    ...rest,
    id,
    className: cn(
      `${PREFIX}__item`,
      hasSub && `${PREFIX}__item--parent`,
      selected && `${PREFIX}__item--active`,
      className,
    ),
    'data-active': selected ? '' : undefined,
    'aria-current': selected ? 'page' : undefined,
    'aria-disabled': disabled || undefined,
    'aria-expanded': hasSub ? open : undefined,
    'aria-controls': hasSub ? subId : undefined,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
  };

  // asChild 仅用于叶子项：父项需要在其同级渲染子级容器，不能包进子元素里
  if (asChild && !hasSub) {
    return withSlot(children, sharedProps, (childChildren) => (
      <NavItemContent icon={icon} badge={badge}>
        {childChildren}
      </NavItemContent>
    ));
  }

  const content = (
    <NavItemContent icon={icon} badge={badge} arrow={hasSub ? <ArrowIcon /> : null}>
      {labelChildren}
    </NavItemContent>
  );

  return (
    <>
      {href && !hasSub ? (
        <a href={href} {...sharedProps}>
          {content}
        </a>
      ) : (
        <button type="button" disabled={disabled} {...sharedProps}>
          {content}
        </button>
      )}
      {hasSub ? (
        <SidebarSubContext.Provider value={{ open, id: subId }}>{subNode}</SidebarSubContext.Provider>
      ) : null}
    </>
  );
}

export type SidebarSubProps = HTMLAttributes<HTMLDivElement>;

/** 子级导航容器：展开态由父级 Item 通过 context 注入 */
function SidebarSub({ className, children, ...rest }: SidebarSubProps) {
  const context = useContext(SidebarSubContext);
  const open = context?.open ?? true;

  return (
    <div
      id={context?.id}
      data-open={open ? '' : undefined}
      className={cn(`${PREFIX}__sub`, className)}
      {...rest}
    >
      <div className={`${PREFIX}__sub-inner`}>
        <div className={`${PREFIX}__sub-list`}>{children}</div>
      </div>
    </div>
  );
}

/** 二级导航项：结构与叶子项一致，仅视觉上缩进 */
function SidebarSubItem({
  value,
  icon,
  badge,
  active,
  disabled,
  href,
  asChild = false,
  className,
  children,
  onClick,
  ...rest
}: SidebarSubItemProps) {
  const { active: activeValue, setActive, baseId } = useSidebarContext();
  const selected = active ?? (activeValue !== '' && value === activeValue);

  const sharedProps: MergedProps = {
    ...rest,
    id: `${baseId}-sub-item-${safeId(value)}`,
    className: cn(`${PREFIX}__sub-item`, selected && `${PREFIX}__sub-item--active`, className),
    'data-active': selected ? '' : undefined,
    'aria-current': selected ? 'page' : undefined,
    'aria-disabled': disabled || undefined,
    onClick: (event: MouseEvent<HTMLElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented && !disabled) setActive(value);
    },
  };

  if (asChild) {
    return withSlot(children, sharedProps, (childChildren) => (
      <NavItemContent icon={icon} badge={badge}>
        {childChildren}
      </NavItemContent>
    ));
  }

  const content = (
    <NavItemContent icon={icon} badge={badge}>
      {children}
    </NavItemContent>
  );

  return href ? (
    <a href={href} {...sharedProps}>
      {content}
    </a>
  ) : (
    <button type="button" disabled={disabled} {...sharedProps}>
      {content}
    </button>
  );
}

export interface SidebarTriggerProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** 不渲染自带按钮，把行为合并到唯一子元素（如 <Button>）上 */
  asChild?: boolean;
  /** 折叠时为“展开”，此处传展开的无障碍名称 */
  expandLabel?: string;
  /** 展开时为“收起”，此处传收起的无障碍名称 */
  collapseLabel?: string;
  children?: ReactNode;
}

/** 折叠开关 */
function SidebarTrigger({
  asChild = false,
  expandLabel = '展开侧边栏',
  collapseLabel = '收起侧边栏',
  className,
  children,
  onClick,
  ...rest
}: SidebarTriggerProps) {
  const { collapsed, collapsible, setCollapsed } = useSidebarContext();
  const label = collapsed ? expandLabel : collapseLabel;

  const props: MergedProps = {
    ...rest,
    className: cn(`${PREFIX}__trigger`, className),
    'aria-pressed': collapsed,
    'aria-label': label,
    'aria-disabled': collapsible ? undefined : true,
    title: label,
    onClick: (event: MouseEvent<HTMLElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented && collapsible) setCollapsed(!collapsed);
    },
  };

  const icon = (
    <span className={`${PREFIX}__trigger-icon`} aria-hidden="true">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {collapsed ? <path d="m9 6 6 6-6 6" /> : <path d="m15 6-6 6 6 6" />}
      </svg>
    </span>
  );

  if (asChild) {
    return withSlot(children, props, (childChildren) => (
      <>
        {childChildren}
        {icon}
      </>
    ));
  }

  return (
    <button type="button" disabled={!collapsible} {...props}>
      {icon}
    </button>
  );
}

/**
 * 侧边栏：可折叠为图标栏的应用导航，支持分组、二级嵌套、激活态与徽标。
 * 折叠态宽度由 CSS 变量控制，标签在视觉上隐藏但仍留在 DOM，读屏器可读。
 */
export const Sidebar = Object.assign(SidebarRoot, {
  Header: SidebarHeader,
  Content: SidebarContent,
  Group: SidebarGroup,
  Item: SidebarItem,
  Sub: SidebarSub,
  SubItem: SidebarSubItem,
  Separator: SidebarSeparator,
  Footer: SidebarFooter,
  Trigger: SidebarTrigger,
});
