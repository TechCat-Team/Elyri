import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

import { Portal, STATUS_GLYPH_PATHS, STATUS_RING_PATH, STATUS_TRIANGLE_PATH, cn } from '../../../core';

import './Toast.css';

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger' | 'loading';

/**
 * 默认状态图标。loading 时外圈是旋转的缺口弧；切到其它状态时弧线补满成圆（warning 则收起圆、描出三角），
 * 再描出内部符号，形成从加载到结果的连续过渡
 */
function ToastStatusIcon({ variant }: { variant: ToastVariant }) {
  const [prevVariant, setPrevVariant] = useState(variant);
  // 状态发生过切换才播放描边动画，首次渲染直接显示完整图标
  const [morph, setMorph] = useState(false);
  // 离开 loading 后继续旋转，直到外圈补满（满圆旋转不可见），避免旋转角度突变
  const [spinning, setSpinning] = useState(variant === 'loading');

  if (prevVariant !== variant) {
    setPrevVariant(variant);
    setMorph(true);
    if (variant === 'loading') setSpinning(true);
  }

  return (
    <svg
      className="elyri-ui-toast__status"
      data-variant={variant}
      data-morph={morph || undefined}
      data-spinning={spinning || undefined}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <g className="elyri-ui-toast__status-spin">
        <path
          className="elyri-ui-toast__status-ring"
          d={STATUS_RING_PATH}
          pathLength={1}
          onTransitionEnd={() => {
            if (variant !== 'loading') setSpinning(false);
          }}
        />
      </g>
      {variant === 'warning' && (
        <path className="elyri-ui-toast__status-shape" d={STATUS_TRIANGLE_PATH} pathLength={1} />
      )}
      {variant !== 'loading' && (
        <path key={variant} className="elyri-ui-toast__status-glyph" d={STATUS_GLYPH_PATHS[variant]} pathLength={1} />
      )}
    </svg>
  );
}

/** 视口停靠方向，共六个 */
export type ToastPosition = 'top-left' | 'top' | 'top-right' | 'bottom-left' | 'bottom' | 'bottom-right';

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** 语义与配色，默认 info */
  variant?: ToastVariant;
  /** 标题 */
  title?: ReactNode;
  /** 描述文案 */
  description?: ReactNode;
  /** 左侧图标，默认按 variant 显示；传 null 隐藏 */
  icon?: ReactNode;
  /** 右侧操作区 */
  action?: ReactNode;
  /** 传入后显示关闭按钮 */
  onClose?: () => void;
  /** 关闭按钮的无障碍名称，默认 Dismiss */
  closeLabel?: string;
}

/** 单条提示的展示组件。定时的展示与堆叠由 ToastProvider 负责 */
export function Toast({
  variant = 'info',
  title,
  description,
  icon,
  action,
  onClose,
  closeLabel = 'Dismiss',
  className,
  children,
  ...rest
}: ToastProps) {
  const iconNode = icon === undefined ? <ToastStatusIcon variant={variant} /> : icon;
  // 没有描述和自定义内容时只显示一行标题，图标与文字垂直居中
  const singleLine = description == null && children == null;

  return (
    <div
      role={variant === 'danger' ? 'alert' : 'status'}
      aria-busy={variant === 'loading' || undefined}
      className={cn('elyri-ui-toast', `elyri-ui-toast--${variant}`, className)}
      data-single-line={singleLine || undefined}
      {...rest}
    >
      {iconNode && <span className="elyri-ui-toast__icon">{iconNode}</span>}

      <div className="elyri-ui-toast__body">
        {title && <div className="elyri-ui-toast__title">{title}</div>}
        {description && <div className="elyri-ui-toast__description">{description}</div>}
        {children}
      </div>

      {action && <div className="elyri-ui-toast__action">{action}</div>}

      {onClose && (
        <button type="button" className="elyri-ui-toast__close" onClick={onClose} aria-label={closeLabel}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      )}
    </div>
  );
}

export interface ToastOptions extends Omit<ToastProps, 'onClose' | 'closeLabel'> {
  /** 自动关闭毫秒数，0 表示不自动关闭；省略使用 Provider 默认值 */
  duration?: number;
  /** 常驻：不自动关闭、不显示关闭按钮、不会因超出 limit 被挤出，只能由程序 dismiss 关闭 */
  persistent?: boolean;
  /** 是否显示关闭按钮，默认 true；persistent 时始终不显示 */
  dismissible?: boolean;
}

/** 提示关闭的原因：手动关闭、超时自动关闭、超出 limit 被挤出 */
export type ToastCloseReason = 'manual' | 'timeout' | 'limit';

export interface ToastPromiseMessages<T> {
  /** 进行中的提示，通常是 variant: loading */
  loading: ToastOptions;
  /** 成功时的提示，或由结果映射出提示 */
  success: ToastOptions | ((data: T) => ToastOptions);
  /** 失败时的提示，或由错误映射出提示 */
  error: ToastOptions | ((error: unknown) => ToastOptions);
}

interface ToastRecord {
  id: string;
  /** false 表示正在播放离场动画，结束后从列表移除 */
  open: boolean;
  duration?: number;
  persistent?: boolean;
  dismissible?: boolean;
  reason?: ToastCloseReason;
  props: Omit<ToastOptions, 'duration' | 'persistent' | 'dismissible'>;
}

interface ToastContextValue {
  /** 弹出一条提示，返回其 id */
  toast: (options: ToastOptions) => string;
  /** 按 id 更新已有提示（如 loading 完成后改成 success / danger） */
  update: (id: string, options: Partial<ToastOptions>) => void;
  /** 手动关闭某条提示；不传 id 时关闭全部 */
  dismiss: (id?: string) => void;
  /** 跟踪一个 promise，自动完成 loading → success / error 的切换，并返回原 promise */
  promise: <T>(input: Promise<T>, messages: ToastPromiseMessages<T>) => Promise<T>;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** 拿到 toast / update / dismiss。必须在 <ToastProvider> 内使用 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast 必须在 <ToastProvider> 内使用');
  return context;
}

export interface ToastProviderProps {
  children?: ReactNode;
  /** 默认自动关闭毫秒数，默认 4000；0 表示不自动关闭 */
  duration?: number;
  /** 同时最多显示的数量，默认 4 */
  limit?: number;
  /** 视口停靠方向，默认 top */
  position?: ToastPosition;
  /** 视口区域的无障碍名称 */
  label?: string;
  /** 任一提示关闭后的回调，reason 区分手动关闭、超时与被 limit 挤出 */
  onClose?: (id: string, reason: ToastCloseReason) => void;
}

/** 与 Toast.css 中离场动画时长保持一致 */
const EXIT_DURATION = 320;

let counter = 0;

/** 提示容器：把 toast() 调用变成堆叠的浮层，负责定时关闭、悬停暂停与进出场动画 */
export function ToastProvider({
  children,
  duration = 4000,
  limit = 4,
  position = 'top',
  label = 'Notifications',
  onClose,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const [paused, setPaused] = useState(false);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const exitTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const dismiss = useCallback((id?: string, reason: ToastCloseReason = 'manual') => {
    setToasts((current) =>
      current.map((item) =>
        (id === undefined ? item.open : item.id === id && item.open) ? { ...item, open: false, reason } : item,
      ),
    );
  }, []);

  const update = useCallback(
    (id: string, { duration: time, persistent, dismissible, ...props }: Partial<ToastOptions>) => {
      // 清掉旧的自动关闭计时，更新后按新时长重新计时
      const timer = timers.current.get(id);
      if (timer) {
        clearTimeout(timer);
        timers.current.delete(id);
      }
      setToasts((current) =>
        current.map((item) =>
          item.id === id && item.open
            ? {
                ...item,
                duration: time ?? item.duration,
                persistent: persistent ?? item.persistent,
                dismissible: dismissible ?? item.dismissible,
                props: { ...item.props, ...props },
              }
            : item,
        ),
      );
    },
    [],
  );

  const toast = useCallback(
    ({ duration: time, persistent, dismissible, ...props }: ToastOptions) => {
      counter += 1;
      const id = `elyri-ui-toast-${counter}`;
      setToasts((current) => {
        const next = [...current, { id, open: true, duration: time, persistent, dismissible, props }];
        // 超出上限时让最早的非常驻提示走离场动画，而不是直接消失
        let overflow = next.filter((item) => item.open).length - limit;
        if (overflow <= 0) return next;
        return next.map((item) => {
          if (overflow > 0 && item.open && !item.persistent && item.id !== id) {
            overflow -= 1;
            return { ...item, open: false, reason: 'limit' as const };
          }
          return item;
        });
      });
      return id;
    },
    [limit],
  );

  const promise = useCallback(
    <T,>(input: Promise<T>, { loading, success, error }: ToastPromiseMessages<T>) => {
      // loading 提示默认不自动关闭，等 promise 落定后由 update 切换状态
      const id = toast({ variant: 'loading', ...loading });
      input.then(
        (data) => update(id, { variant: 'success', ...(typeof success === 'function' ? success(data) : success) }),
        (reason) => update(id, { variant: 'danger', ...(typeof error === 'function' ? error(reason) : error) }),
      );
      return input;
    },
    [toast, update],
  );

  // 为每条提示安排自动关闭；悬停暂停时先清空，移开后重新计时
  useEffect(() => {
    const timersNow = timers.current;
    if (paused) {
      for (const timer of timersNow.values()) clearTimeout(timer);
      timersNow.clear();
      return;
    }

    for (const [id, timer] of timersNow) {
      if (!toasts.some((item) => item.id === id && item.open)) {
        clearTimeout(timer);
        timersNow.delete(id);
      }
    }

    for (const item of toasts) {
      if (!item.open || item.persistent || timersNow.has(item.id)) continue;
      // loading 提示默认不自动关闭，直到被 update 成其它状态
      const time = item.duration ?? (item.props.variant === 'loading' ? 0 : duration);
      if (time <= 0) continue;
      timersNow.set(
        item.id,
        setTimeout(() => dismiss(item.id, 'timeout'), time),
      );
    }
  }, [toasts, paused, duration, dismiss]);

  // 离场动画结束后真正移除
  useEffect(() => {
    const exitNow = exitTimers.current;
    for (const item of toasts) {
      if (item.open || exitNow.has(item.id)) continue;
      exitNow.set(
        item.id,
        setTimeout(() => {
          exitNow.delete(item.id);
          onCloseRef.current?.(item.id, item.reason ?? 'manual');
          setToasts((current) => current.filter((record) => record.id !== item.id));
        }, EXIT_DURATION),
      );
    }
  }, [toasts]);

  useEffect(() => {
    const timersNow = timers.current;
    const exitNow = exitTimers.current;
    return () => {
      for (const timer of timersNow.values()) clearTimeout(timer);
      for (const timer of exitNow.values()) clearTimeout(timer);
      timersNow.clear();
      exitNow.clear();
    };
  }, []);

  const value = useMemo(() => ({ toast, update, dismiss, promise }), [toast, update, dismiss, promise]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Portal>
        <div
          className="elyri-ui-toast-viewport"
          data-position={position}
          role="region"
          aria-label={label}
          aria-live="polite"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {toasts.map(({ id, open, persistent, dismissible, props }) => (
            <div key={id} className="elyri-ui-toast-item" data-state={open ? 'open' : 'closed'}>
              <div className="elyri-ui-toast-item__inner">
                <Toast
                  {...props}
                  // 播报交给常驻的 viewport live region，单条不再自行插播，避免重复朗读
                  aria-live="off"
                  onClose={!persistent && dismissible !== false ? () => dismiss(id) : undefined}
                />
              </div>
            </div>
          ))}
        </div>
      </Portal>
    </ToastContext.Provider>
  );
}
