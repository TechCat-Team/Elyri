import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { HTMLAttributes, InputHTMLAttributes, KeyboardEvent, MouseEvent, ReactNode, RefObject } from 'react';

import {
  Portal,
  cn,
  useControllableState,
  useDismiss,
  useField,
  useFieldControlId,
  useFloatingPosition,
  usePresence,
} from '../../../core';
import type { Alignment, Placement } from '../../../core';

import './Select.css';

/** 与 Select.css 中离场动画时长保持一致 */
const EXIT_DURATION = 120;
/** typeahead 缓冲区在最后一次输入后保留多久 */
const TYPEAHEAD_TIMEOUT = 500;

/** 默认搜索匹配：忽略首尾空白、大小写不敏感的包含匹配 */
const defaultFilter = (label: string, query: string) => label.toLowerCase().includes(query.trim().toLowerCase());

export type SelectSize = 'sm' | 'md' | 'lg';

interface SelectContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLDivElement | null>;
  /** 浮层容器，键盘导航据此按 DOM 顺序取选项 */
  contentRef: RefObject<HTMLDivElement | null>;
  /** Trigger 实际使用的 id，浮层 aria-labelledby 指向它 */
  triggerId: string;
  /** Trigger 上报自身实际 id（自定义 id 场景），浮层据此更新 aria-labelledby / aria-controls */
  registerTriggerId: (id: string) => void;
  baseId: string;
  multiple: boolean;
  /** 归一化后的选中值数组，单选至多一个元素 */
  values: string[];
  /** 选项 value -> 文案，由 Item 挂载时注册，关闭后靠静态解析兜底 */
  labels: Record<string, string>;
  /** 当前高亮项的值，配合 aria-activedescendant 使用，焦点始终留在 Trigger */
  activeValue?: string;
  /** 当前高亮项在 DOM 中的 id，作为 Trigger 的 aria-activedescendant */
  activeDescendant?: string;
  setActiveValue: (value: string | undefined) => void;
  registerItem: (value: string, label: string) => () => void;
  registerOption: (value: string, id: string) => () => void;
  /** Trigger 上的键盘交互统一入口（焦点不进入浮层） */
  onTriggerKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  /** 搜索模式：当前关键词；null 表示未在输入（回显选中项文案） */
  query: string | null;
  /** 搜索模式：更新关键词 */
  setQuery: (query: string) => void;
  /** 搜索输入框的键盘入口；可打印字符交由输入框自身处理 */
  onSearchKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  /** 选项文案是否匹配当前关键词，供 Select.Item 判断显隐 */
  matchesQuery: (label: string) => boolean;
  placeholder?: string;
  size: SelectSize;
  disabled?: boolean;
  clearLabel: string;
  placement: Placement;
  align: Alignment;
  offset: number;
  isSelected: (value: string) => boolean;
  select: (value: string) => void;
  removeValue: (value: string) => void;
  clear: () => void;
}

const SelectContext = createContext<SelectContextValue | null>(null);

const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('Select 的子组件必须放在 <Select> 内使用');
  return context;
};

export interface SelectProps {
  /** 受控选中值：单选 string，多选 string[]（配合 multiple） */
  value?: string | string[];
  /** 非受控初始值，形态与 value 一致 */
  defaultValue?: string | string[];
  /** 选中值变化回调，单选回传 string、多选回传 string[] */
  onValueChange?: (value: string | string[]) => void;
  /** 多选模式：值为 string[]，Trigger 以 Tag 展示选中项 */
  multiple?: boolean;
  /** 禁用整个下拉 */
  disabled?: boolean;
  /** 未选中时 Trigger 展示的占位文案 */
  placeholder?: string;
  /** Trigger 尺寸，与 Input 三档对齐，默认 md */
  size?: SelectSize;
  /** 期望方向，默认 bottom */
  placement?: Placement;
  /** 交叉轴对齐，默认 start */
  align?: Alignment;
  /** 与触发元素的间距，默认 4 */
  offset?: number;
  /** 受控开关 */
  open?: boolean;
  /** 非受控初始开关，默认 false */
  defaultOpen?: boolean;
  /** 开关变化回调 */
  onOpenChange?: (open: boolean) => void;
  /** 多选时清空按钮的无障碍名称，默认 "Clear" */
  clearLabel?: string;
  /** 自定义搜索匹配：默认按选项文案做大小写不敏感的包含匹配 */
  filter?: (label: string, query: string) => boolean;
  /** 搜索关键词变化回调，可配合自定义 / 异步过滤 */
  onSearchChange?: (query: string) => void;
  /** 表单字段名：设置后在 Select 内渲染隐藏 input，使选中值可随原生表单提交 */
  name?: string;
  children?: ReactNode;
}

interface OptionMeta {
  value: string;
  label?: string;
  disabled: boolean;
}

/**
 * 静态解析 children 里的 Select.Item，得到有序、带禁用信息的选项表。
 * 关闭态下选项不挂载，这一步保证首屏无需展开即可显示选中项文案、并推断初始高亮项。
 */
function collectOptions(node: ReactNode, out: OptionMeta[]) {
  Children.forEach(node, (child) => {
    if (!isValidElement(child)) return;
    const props = child.props as { value?: string; children?: ReactNode; disabled?: boolean };
    if (child.type === SelectItem && typeof props.value === 'string') {
      const { children } = props;
      const label = typeof children === 'string' || typeof children === 'number' ? String(children) : undefined;
      out.push({ value: props.value, label, disabled: props.disabled === true });
    }
    collectOptions(props.children, out);
  });
}

function SelectRoot({
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  disabled,
  placeholder,
  size = 'md',
  placement = 'bottom',
  align = 'start',
  offset = 4,
  open,
  defaultOpen = false,
  onOpenChange,
  clearLabel = 'Clear',
  filter,
  onSearchChange,
  name,
  children,
}: SelectProps) {
  const field = useField();
  const [isOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const [selected, setSelected] = useControllableState<string | string[]>({
    value,
    defaultValue: defaultValue ?? (multiple ? [] : ''),
    onChange: onValueChange,
  });
  const [registeredLabels, setRegisteredLabels] = useState<Record<string, string>>({});
  const [optionIds, setOptionIds] = useState<Record<string, string>>({});
  const [activeValue, setActiveValue] = useState<string | undefined>(undefined);
  const [query, setQueryState] = useState<string | null>(null);
  const baseId = useId();
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [triggerId, setTriggerId] = useState(field?.controlId ?? `${baseId}-trigger`);
  const registerTriggerId = useCallback((id: string) => setTriggerId(id), []);
  const typeahead = useRef({ query: '', timer: undefined as ReturnType<typeof setTimeout> | undefined });

  // 静态选项表：关闭态下选项未挂载，用它的文案兜底，并据此推断初始高亮项
  const optionMetas = useMemo(() => {
    const out: OptionMeta[] = [];
    collectOptions(children, out);
    return out;
  }, [children]);

  /** 选项文案是否匹配当前关键词；Select.Item 据此显隐，Trigger 据此推断高亮项 */
  const matchesQuery = useCallback(
    (label: string) => {
      const keyword = query ?? '';
      return keyword === '' || (filter ?? defaultFilter)(label, keyword);
    },
    [query, filter],
  );

  // 挂载后的注册值优先，兼容动态渲染 / 自定义包装的选项
  const labels = useMemo(() => {
    const derived: Record<string, string> = {};
    for (const meta of optionMetas) {
      if (meta.label !== undefined && !(meta.value in derived)) derived[meta.value] = meta.label;
    }
    return { ...derived, ...registeredLabels };
  }, [optionMetas, registeredLabels]);

  const values = useMemo(() => {
    if (multiple) return Array.isArray(selected) ? selected : selected ? [selected] : [];
    return typeof selected === 'string' && selected !== '' ? [selected] : [];
  }, [multiple, selected]);

  // 当前可见选项：过滤后据此推断高亮，避免高亮停留在被隐藏的选项上
  const visibleMetas = optionMetas.filter((meta) => matchesQuery(meta.label ?? meta.value));

  // 高亮：输入时 setQuery 会清空 activeValue，这里回退到选中项或第一个可见项；关闭时不显示
  const firstEnabledValue = visibleMetas.find((meta) => !meta.disabled)?.value;
  const fallbackActive = values.find((itemValue) =>
    visibleMetas.some((meta) => meta.value === itemValue && !meta.disabled),
  );
  const effectiveActive = activeValue ?? (isOpen ? (fallbackActive ?? firstEnabledValue) : undefined);

  const isSelected = useCallback((itemValue: string) => values.includes(itemValue), [values]);

  const select = useCallback(
    (itemValue: string) => {
      if (multiple) {
        setSelected(values.includes(itemValue) ? values.filter((item) => item !== itemValue) : [...values, itemValue]);
      } else {
        setSelected(itemValue);
        setOpen(false);
      }
    },
    [multiple, values, setSelected, setOpen],
  );

  const removeValue = useCallback(
    (itemValue: string) => setSelected(values.filter((item) => item !== itemValue)),
    [values, setSelected],
  );

  const clear = useCallback(() => setSelected(multiple ? [] : ''), [multiple, setSelected]);

  const setQuery = useCallback(
    (next: string) => {
      setQueryState(next);
      onSearchChange?.(next);
      // 过滤后原高亮项可能被隐藏，清空后由下方 effect 重置到第一个可见项
      setActiveValue(undefined);
    },
    [onSearchChange],
  );

  const registerItem = useCallback((itemValue: string, label: string) => {
    setRegisteredLabels((prev) => (prev[itemValue] === label ? prev : { ...prev, [itemValue]: label }));
    return () => {
      setRegisteredLabels((prev) => {
        if (!(itemValue in prev)) return prev;
        const next = { ...prev };
        delete next[itemValue];
        return next;
      });
    };
  }, []);

  const registerOption = useCallback((itemValue: string, id: string) => {
    setOptionIds((prev) => (prev[itemValue] === id ? prev : { ...prev, [itemValue]: id }));
    return () => {
      setOptionIds((prev) => {
        if (!(itemValue in prev)) return prev;
        const next = { ...prev };
        delete next[itemValue];
        return next;
      });
    };
  }, []);

  // 按 DOM 顺序取可用选项；禁用项以 data-disabled 标记，被搜索过滤的项带 hidden
  const enabledOptions = useCallback(
    () =>
      contentRef.current
        ? Array.from(
            contentRef.current.querySelectorAll<HTMLElement>('[role="option"]:not([data-disabled]):not([hidden])'),
          )
        : [],
    [],
  );

  const setActive = useCallback((element: HTMLElement) => {
    setActiveValue(element.dataset.value);
    element.scrollIntoView?.({ block: 'nearest' });
  }, []);

  const moveActive = useCallback(
    (delta: number) => {
      const list = enabledOptions();
      if (list.length === 0) return;
      const current = list.findIndex((element) => element.dataset.value === effectiveActive);
      const next = current < 0 ? (delta > 0 ? 0 : list.length - 1) : (current + delta + list.length) % list.length;
      setActive(list[next]);
    },
    [enabledOptions, effectiveActive, setActive],
  );

  const activateEdge = useCallback(
    (edge: 'first' | 'last') => {
      const list = enabledOptions();
      if (list.length === 0) return;
      setActive(edge === 'first' ? list[0] : list[list.length - 1]);
    },
    [enabledOptions, setActive],
  );

  const matchTypeahead = useCallback(
    (char: string) => {
      const state = typeahead.current;
      clearTimeout(state.timer);
      state.query += char.toLowerCase();
      state.timer = setTimeout(() => {
        state.query = '';
      }, TYPEAHEAD_TIMEOUT);

      const list = enabledOptions();
      const text = (element: HTMLElement) => (element.textContent ?? '').trim().toLowerCase();
      // 从当前项之后开始找，重复输入同一字符可循环跳转
      const from = list.findIndex((element) => element.dataset.value === effectiveActive) + 1;
      const ordered = [...list.slice(from), ...list.slice(0, from)];

      let match = ordered.find((element) => text(element).startsWith(state.query));
      if (!match && state.query.length > 1) {
        // 多字符未命中时退回最后一个字符再试（处理连续单字符跳转）
        state.query = state.query.at(-1) ?? '';
        match = ordered.find((element) => text(element).startsWith(state.query));
      }
      if (match) setActive(match);
    },
    [enabledOptions, effectiveActive, setActive],
  );

  const onTriggerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const { key } = event;
      if (key === 'ArrowDown') {
        event.preventDefault();
        if (isOpen) moveActive(1);
        else setOpen(true);
        return;
      }
      if (key === 'ArrowUp') {
        event.preventDefault();
        if (isOpen) moveActive(-1);
        else setOpen(true);
        return;
      }
      if (!isOpen) return;
      switch (key) {
        case 'Home':
          event.preventDefault();
          activateEdge('first');
          break;
        case 'End':
          event.preventDefault();
          activateEdge('last');
          break;
        case 'Escape':
          event.preventDefault();
          setOpen(false);
          break;
        case 'Tab':
          // 关闭浮层但不拦截默认行为，让焦点照常移走
          setOpen(false);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (effectiveActive !== undefined) select(effectiveActive);
          break;
        default:
          // 可打印字符走 typeahead
          if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            matchTypeahead(key);
          }
      }
    },
    [isOpen, setOpen, moveActive, activateEdge, effectiveActive, select, matchTypeahead],
  );

  // 搜索输入框：可打印字符交给输入框本身过滤，这里只处理导航与提交
  const onSearchKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      const { key } = event;
      if (key === 'ArrowDown') {
        event.preventDefault();
        if (isOpen) moveActive(1);
        else setOpen(true);
        return;
      }
      if (key === 'ArrowUp') {
        event.preventDefault();
        if (isOpen) moveActive(-1);
        else setOpen(true);
        return;
      }
      if (!isOpen) return;
      switch (key) {
        case 'Home':
          event.preventDefault();
          activateEdge('first');
          break;
        case 'End':
          event.preventDefault();
          activateEdge('last');
          break;
        case 'Escape':
          event.preventDefault();
          setOpen(false);
          break;
        case 'Tab':
          // 关闭浮层但不拦截默认行为，让焦点照常移走
          setOpen(false);
          break;
        case 'Enter':
          event.preventDefault();
          if (effectiveActive !== undefined) select(effectiveActive);
          break;
        default:
          break;
      }
    },
    [isOpen, setOpen, moveActive, activateEdge, effectiveActive, select],
  );

  // 关闭时清空高亮与关键词；渲染期同步，避免多余帧。typeahead 缓冲由超时自行失效
  const [trackedOpen, setTrackedOpen] = useState(isOpen);
  if (trackedOpen !== isOpen) {
    setTrackedOpen(isOpen);
    if (!isOpen) {
      if (activeValue !== undefined) setActiveValue(undefined);
      if (query !== null) setQueryState(null);
    }
  }

  useEffect(() => () => clearTimeout(typeahead.current.timer), []);

  const contextValue = useMemo<SelectContextValue>(
    () => ({
      open: isOpen,
      setOpen,
      triggerRef,
      contentRef,
      triggerId,
      registerTriggerId,
      baseId,
      multiple,
      values,
      labels,
      activeValue: effectiveActive,
      activeDescendant: effectiveActive !== undefined ? optionIds[effectiveActive] : undefined,
      setActiveValue,
      registerItem,
      registerOption,
      onTriggerKeyDown,
      query,
      setQuery,
      onSearchKeyDown,
      matchesQuery,
      placeholder,
      size,
      disabled,
      clearLabel,
      placement,
      align,
      offset,
      isSelected,
      select,
      removeValue,
      clear,
    }),
    [
      isOpen,
      setOpen,
      triggerId,
      registerTriggerId,
      baseId,
      multiple,
      values,
      labels,
      effectiveActive,
      optionIds,
      registerItem,
      registerOption,
      onTriggerKeyDown,
      query,
      setQuery,
      onSearchKeyDown,
      matchesQuery,
      placeholder,
      size,
      disabled,
      clearLabel,
      placement,
      align,
      offset,
      isSelected,
      select,
      removeValue,
      clear,
    ],
  );

  return (
    <SelectContext.Provider value={contextValue}>
      {children}
      {/* name 存在时渲染隐藏 input，让选中值随原生表单提交（多选按值重复字段名） */}
      {name !== undefined &&
        (multiple ? (
          values.map((itemValue) => (
            <input key={itemValue} type="hidden" name={name} value={itemValue} disabled={disabled} readOnly />
          ))
        ) : (
          <input
            type="hidden"
            name={name}
            value={typeof selected === 'string' ? selected : ''}
            disabled={disabled}
            readOnly
          />
        ))}
    </SelectContext.Provider>
  );
}

export interface SelectTriggerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** 覆盖根组件的禁用状态 */
  disabled?: boolean;
}

function SelectTrigger({
  className,
  id,
  disabled,
  children,
  onClick,
  onKeyDown,
  'aria-describedby': ariaDescribedBy,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: SelectTriggerProps) {
  const {
    open,
    setOpen,
    triggerRef,
    triggerId,
    registerTriggerId,
    multiple,
    values,
    labels,
    placeholder,
    size,
    disabled: rootDisabled,
    clearLabel,
    removeValue,
    clear,
    activeDescendant,
    onTriggerKeyDown,
  } = useSelectContext();
  const field = useField();
  const resolvedId = id ?? triggerId;
  useFieldControlId(id);
  // 上报实际 id，使浮层 aria-labelledby / aria-controls 在自定义 id 时也指向真实节点
  useEffect(() => {
    registerTriggerId(resolvedId);
  }, [registerTriggerId, resolvedId]);
  const isDisabled = disabled ?? rootDisabled ?? field?.disabled;
  const isInvalid = field?.invalid === true;
  const describedBy = [ariaDescribedBy, ...(field?.describedIds ?? [])].filter(Boolean).join(' ') || undefined;

  const toggle = () => {
    if (!isDisabled) setOpen(!open);
  };

  // 触发器内放了 Select.Search 即进入可输入模式：combobox 语义移到输入框上
  const hasSearch = Children.toArray(children).some(
    (child) => isValidElement(child) && child.type === SelectSearch,
  );

  const handleTriggerClick = (event: MouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    // 搜索模式下触发器只是外壳：点击聚焦输入框并展开，交互由输入框承担
    if (hasSearch) {
      if (isDisabled) return;
      triggerRef.current?.querySelector('input')?.focus();
      setOpen(true);
      return;
    }
    toggle();
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (hasSearch || event.defaultPrevented || isDisabled) return;
    // 焦点在 Tag 移除 / 清空按钮上时，交由其原生按键激活
    if (event.target !== event.currentTarget) return;
    onTriggerKeyDown(event);
  };

  const tags = multiple ? (
    <>
      {values.map((itemValue) => {
        const label = labels[itemValue] ?? itemValue;
        return (
          <span key={itemValue} className="elyri-ui-select__tag">
            {label}
            <button
              type="button"
              className="elyri-ui-select__tag-remove"
              aria-label={`Remove ${label}`}
              disabled={isDisabled}
              onClick={(event) => {
                event.stopPropagation();
                removeValue(itemValue);
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </span>
        );
      })}
      {values.length > 0 && (
        <button
          type="button"
          className="elyri-ui-select__clear"
          aria-label={clearLabel}
          disabled={isDisabled}
          onClick={(event) => {
            event.stopPropagation();
            clear();
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
    </>
  ) : null;

  return (
    // div + combobox：多选 Tag 内含移除按钮，不能嵌套在 button 里
    // 可输入模式下 combobox 角色交给内部的 Select.Search 输入框
    <div
      ref={triggerRef}
      id={resolvedId}
      data-disabled={isDisabled || undefined}
      className={cn(
        'elyri-ui-select__trigger',
        `elyri-ui-select__trigger--${size}`,
        multiple && 'elyri-ui-select__trigger--multi',
        hasSearch && 'elyri-ui-select__trigger--searchable',
        isInvalid && 'is-invalid',
        className,
      )}
      {...rest}
      // 非搜索模式：div 自身承载 combobox 语义与键盘交互；搜索模式交给内部的 Select.Search 输入框
      {...(hasSearch
        ? { onClick: handleTriggerClick, onKeyDown: handleTriggerKeyDown }
        : {
            role: 'combobox',
            'aria-haspopup': 'listbox',
            'aria-expanded': open,
            // combobox 的 div 不是 labelable 元素，label 的 htmlFor 无法命名，改由 labelledby 关联
            'aria-controls': `${triggerId}--content`,
            'aria-labelledby': ariaLabelledBy ?? field?.labelId,
            'aria-activedescendant': open ? activeDescendant : undefined,
            'aria-disabled': isDisabled || undefined,
            'aria-required': field?.required || undefined,
            'aria-invalid': isInvalid || undefined,
            'aria-describedby': describedBy,
            tabIndex: isDisabled ? -1 : 0,
            onClick: handleTriggerClick,
            onKeyDown: handleTriggerKeyDown,
          })}
    >
      {hasSearch ? (
        <>
          {tags}
          {children}
        </>
      ) : (
        <>
          {multiple ? (
            <>
              {values.length === 0 && (
                <span className="elyri-ui-select__value" data-empty="true">
                  {placeholder}
                </span>
              )}
              {tags}
            </>
          ) : (
            <span className="elyri-ui-select__value" data-empty={values.length === 0 || undefined}>
              {values.length > 0 ? (labels[values[0]] ?? values[0]) : placeholder}
            </span>
          )}
          {children}
        </>
      )}
      <svg
        className="elyri-ui-select__chevron"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

export type SelectContentProps = HTMLAttributes<HTMLDivElement>;

function SelectContent({ className, children, ...rest }: SelectContentProps) {
  const { open, setOpen, triggerRef, contentRef, triggerId, multiple, placement, align, offset } = useSelectContext();
  const refs = useMemo<RefObject<HTMLElement | null>[]>(() => [triggerRef, contentRef], [triggerRef, contentRef]);
  const present = usePresence(open, EXIT_DURATION);
  const position = useFloatingPosition(triggerRef, contentRef, {
    open: present,
    placement,
    align,
    offset,
    matchAnchorWidth: true,
  });
  const dismiss = useMemo(() => () => setOpen(false), [setOpen]);

  useDismiss({ open, onDismiss: dismiss, refs });

  // 关闭态（含离场动画结束后）不渲染选项，避免常驻 DOM；文案由静态解析兜底
  if (!present) return null;

  return (
    <Portal>
      <div
        ref={contentRef}
        id={`${triggerId}--content`}
        role="listbox"
        aria-labelledby={triggerId}
        aria-multiselectable={multiple || undefined}
        data-state={open ? 'open' : 'closed'}
        data-placement={position.placement}
        className={cn('elyri-ui-select__content', className)}
        style={{ top: position.top, left: position.left, width: position.width }}
        {...rest}
      >
        {children}
      </div>
    </Portal>
  );
}

export interface SelectItemProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'value'> {
  /** 该选项的值 */
  value: string;
  /** 禁用该选项 */
  disabled?: boolean;
}

function SelectItem({
  value,
  disabled,
  className,
  children,
  onPointerMove,
  onMouseDown,
  onClick,
  ...rest
}: SelectItemProps) {
  const { isSelected, select, registerItem, registerOption, activeValue, setActiveValue, matchesQuery, labels } =
    useSelectContext();
  const ref = useRef<HTMLButtonElement>(null);
  const generatedId = useId();
  const selected = isSelected(value);
  const active = activeValue === value;
  // 搜索过滤：优先用文案，取不到时退回已注册 / value 兜底；命中则保留在 DOM，仅置 hidden
  const filterText =
    typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : (labels[value] ?? value);
  const filtered = !matchesQuery(filterText);

  useEffect(() => {
    // 注册文案供 Trigger 展示；children 变化时重新注册，卸载时注销
    if (!ref.current) return;
    return registerItem(value, ref.current.textContent ?? value);
  }, [value, children, registerItem]);

  // 上报 id，供 Trigger 的 aria-activedescendant 引用
  useEffect(() => registerOption(value, generatedId), [value, generatedId, registerOption]);

  return (
    <button
      ref={ref}
      id={generatedId}
      type="button"
      role="option"
      tabIndex={-1}
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      data-value={value}
      data-disabled={disabled || undefined}
      data-active={active || undefined}
      data-state={selected ? 'checked' : 'unchecked'}
      className={cn('elyri-ui-select__item', className)}
      {...rest}
      hidden={filtered || undefined}
      data-filtered={filtered || undefined}
      onMouseDown={(event) => {
        onMouseDown?.(event);
        // 阻止鼠标按下把焦点从 combobox 移走，保持 aria-activedescendant 模型
        if (!event.defaultPrevented) event.preventDefault();
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        // 悬停只更新高亮，不抢焦点：焦点始终留在 combobox
        if (!disabled) setActiveValue(value);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled) return;
        select(value);
      }}
    >
      <span className="elyri-ui-select__item-indicator" aria-hidden="true">
        {selected && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12.5l4.5 4.5L19 7" />
          </svg>
        )}
      </span>
      <span className="elyri-ui-select__item-text">{children}</span>
    </button>
  );
}

export type SelectSearchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'size' | 'type'>;

/** 触发器内的搜索输入框：承载 combobox 语义，输入即过滤选项 */
function SelectSearch({
  className,
  placeholder,
  onKeyDown,
  onClick,
  onFocus,
  'aria-describedby': ariaDescribedBy,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: SelectSearchProps) {
  const {
    open,
    setOpen,
    query,
    setQuery,
    onSearchKeyDown,
    triggerId,
    activeDescendant,
    multiple,
    values,
    labels,
    placeholder: triggerPlaceholder,
    disabled,
  } = useSelectContext();
  const field = useField();
  const ref = useRef<HTMLInputElement>(null);
  const describedBy = [ariaDescribedBy, ...(field?.describedIds ?? [])].filter(Boolean).join(' ') || undefined;

  // 未在输入时单选回显选中项文案（query 为 null）；输入过程中即便清空也保持为空
  const selectedLabel = !multiple && values.length > 0 ? (labels[values[0]] ?? values[0]) : '';
  const displayValue = query !== null ? query : selectedLabel;

  useEffect(() => {
    if (open) ref.current?.select();
  }, [open]);

  return (
    <input
      ref={ref}
      {...rest}
      type="text"
      role="combobox"
      autoComplete="off"
      aria-autocomplete="list"
      aria-expanded={open}
      aria-controls={`${triggerId}--content`}
      aria-activedescendant={open ? activeDescendant : undefined}
      aria-labelledby={ariaLabelledBy ?? field?.labelId}
      aria-describedby={describedBy}
      aria-required={field?.required || undefined}
      aria-invalid={field?.invalid || undefined}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      value={displayValue}
      placeholder={placeholder ?? triggerPlaceholder}
      className={cn('elyri-ui-select__search', className)}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        onSearchKeyDown(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        // 阻止冒泡，避免触发器外壳把它当成展开 / 收起
        event.stopPropagation();
        if (!disabled) setOpen(true);
      }}
      onChange={(event) => {
        setQuery(event.target.value);
        if (!open) setOpen(true);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (!disabled && !open) setOpen(true);
      }}
    />
  );
}

/** 下拉选择：combobox + listbox 语义，方向键 / Home / End / typeahead 导航，支持单选与多选 */
export const Select = Object.assign(SelectRoot, {
  Trigger: SelectTrigger,
  Content: SelectContent,
  Item: SelectItem,
  Search: SelectSearch,
});
