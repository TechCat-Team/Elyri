import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export type Placement = 'top' | 'bottom' | 'left' | 'right';
export type Alignment = 'start' | 'center' | 'end';

export interface FloatingPosition {
  top: number;
  left: number;
  /** 实际采用的方向，可能与期望的不同（空间不足时翻转） */
  placement: Placement;
  /** 沿交叉轴指向锚点中心的偏移（px），用于定位箭头 */
  arrow: number;
  /** 浮层宽度（px），仅在 matchAnchorWidth 开启时返回 */
  width?: number;
}

export interface UseFloatingPositionOptions {
  /** 打开时才计算并与滚动 / 尺寸变化保持同步 */
  open?: boolean;
  /** 期望方向，默认 bottom */
  placement?: Placement;
  /** 沿交叉轴的对齐方式，默认 center */
  align?: Alignment;
  /** 浮层与触发元素之间的间距，默认 8 */
  offset?: number;
  /** 浮层宽度与锚点对齐（如 Select 下拉与触发器同宽），默认 false */
  matchAnchorWidth?: boolean;
}

const OPPOSITE: Record<Placement, Placement> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

/** 服务端没有布局，退回 useEffect 以避免 useLayoutEffect 的 SSR 警告 */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * 测量触发元素与浮层，算出 fixed 定位坐标。
 * 首选方向空间不足时翻转到对侧，最终坐标会收进视口避免被裁切，零依赖。
 */
export function useFloatingPosition(
  anchorRef: RefObject<HTMLElement | null>,
  floatingRef: RefObject<HTMLElement | null>,
  { open = true, placement = 'bottom', align = 'center', offset = 8, matchAnchorWidth = false }: UseFloatingPositionOptions = {},
): FloatingPosition {
  const [position, setPosition] = useState<FloatingPosition>({ top: 0, left: 0, placement, arrow: 0 });
  // 保存最新一次定位结果，避免相同坐标引发多余渲染
  const latest = useRef(position);

  const update = useCallback(() => {
    const anchor = anchorRef.current;
    const floating = floatingRef.current;
    if (!anchor || !floating) return;

    const a = anchor.getBoundingClientRect();
    const f = floating.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const room: Record<Placement, number> = { top: a.top, bottom: vh - a.bottom, left: a.left, right: vw - a.right };
    const needed: Record<Placement, number> = {
      top: f.height + offset,
      bottom: f.height + offset,
      left: f.width + offset,
      right: f.width + offset,
    };

    let side = placement;
    if (room[side] < needed[side] && room[OPPOSITE[side]] > room[side]) side = OPPOSITE[side];

    let top: number;
    let left: number;
    if (side === 'top' || side === 'bottom') {
      top = side === 'bottom' ? a.bottom + offset : a.top - f.height - offset;
      left = align === 'start' ? a.left : align === 'end' ? a.right - f.width : a.left + (a.width - f.width) / 2;
    } else {
      left = side === 'right' ? a.right + offset : a.left - f.width - offset;
      top = align === 'start' ? a.top : align === 'end' ? a.bottom - f.height : a.top + (a.height - f.height) / 2;
    }

    left = Math.min(Math.max(left, offset), Math.max(offset, vw - f.width - offset));
    top = Math.min(Math.max(top, offset), Math.max(offset, vh - f.height - offset));

    // 锚点中心相对浮层左上角的交叉轴偏移，交给箭头定位使用
    const arrow =
      side === 'top' || side === 'bottom' ? a.left + a.width / 2 - left : a.top + a.height / 2 - top;

    const width = matchAnchorWidth ? a.width : undefined;

    const current = latest.current;
    if (
      current.top === top &&
      current.left === left &&
      current.placement === side &&
      current.arrow === arrow &&
      current.width === width
    ) {
      return;
    }
    latest.current = { top, left, placement: side, arrow, width };
    setPosition(latest.current);
  }, [anchorRef, floatingRef, placement, align, offset, matchAnchorWidth]);

  useIsomorphicLayoutEffect(() => {
    if (open) update();
  }, [open, update]);

  useEffect(() => {
    if (!open) return;

    const handle = () => update();
    window.addEventListener('scroll', handle, true);
    window.addEventListener('resize', handle);

    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(handle);
    if (observer) {
      if (anchorRef.current) observer.observe(anchorRef.current);
      if (floatingRef.current) observer.observe(floatingRef.current);
    }

    return () => {
      window.removeEventListener('scroll', handle, true);
      window.removeEventListener('resize', handle);
      observer?.disconnect();
    };
  }, [open, update, anchorRef, floatingRef]);

  return position;
}
