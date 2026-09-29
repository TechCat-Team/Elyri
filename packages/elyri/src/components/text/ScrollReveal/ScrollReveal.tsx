import { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';

import { cn, splitTextUnits, usePrefersReducedMotion } from '../../../core';
import type { SplitTextSegment } from '../../../core';

import './ScrollReveal.css';

export type ScrollRevealBy = 'char' | 'word';

/**
 * 点亮线固定在视口该比例高度处（0.65 即屏幕下方 35% 始终留作未点亮区）。
 * 固定不动才能让明暗过渡一直在屏幕里可见；若让它随滚动漂移，中后段整屏都会落在线上方。
 */
const LEAD_RATIO = 0.65;

export interface ScrollRevealProps {
  /** 需要点亮的文本，仅支持纯字符串 */
  children: string;
  className?: string;
  /** 点亮单位：按单词或按字符 */
  by?: ScrollRevealBy;
  /** 滚动区域高度（像素），文本超出后可滚动 */
  height?: number;
  /** 未点亮时的不透明度，0 为完全不可见 */
  dimOpacity?: number;
  /** 未点亮时的模糊半径（像素），0 为不模糊 */
  blur?: number;
}

const segmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl ? new Intl.Segmenter(undefined, { granularity: 'word' }) : null;

/**
 * 按「词」切分文本。用 Intl.Segmenter 取词边界，中文、日文等没有空格的语言也能按词点亮；
 * 标点并入前一个词（没有前词时暂存到下一个词），空白保持原样输出。
 * 不支持 Intl.Segmenter 时退回按空白切分。
 */
const splitWords = (text: string): SplitTextSegment[] => {
  if (!segmenter) return splitTextUnits(text, 'word');

  const segments: SplitTextSegment[] = [];
  let index = 0;
  let wordPart = 0;
  let spacePart = 0;
  let pending = '';

  for (const { segment: value, isWordLike } of segmenter.segment(text)) {
    if (/^\s+$/.test(value)) {
      segments.push({ kind: 'space', key: `space-${spacePart++}`, value });
      continue;
    }

    if (isWordLike) {
      segments.push({ kind: 'word', key: `word-${wordPart++}`, units: [{ char: pending + value, index: index++ }] });
      pending = '';
      continue;
    }

    const last = segments[segments.length - 1];
    if (!pending && last?.kind === 'word') {
      last.units[0].char += value;
    } else {
      pending += value;
    }
  }

  if (pending) {
    segments.push({ kind: 'word', key: `word-${wordPart}`, units: [{ char: pending, index }] });
  }

  return segments;
};

/** 滚动点亮：随容器滚动，文本从头至尾逐单元点亮 */
export function ScrollReveal({
  children,
  className,
  by = 'word',
  height = 280,
  dimOpacity = 0.15,
  blur = 0,
}: ScrollRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const segments = useMemo(
    () => (by === 'word' ? splitWords(children) : splitTextUnits(children, 'char')),
    [children, by],
  );
  const count = useMemo(
    () => segments.reduce((total, segment) => (segment.kind === 'word' ? total + segment.units.length : total), 0),
    [segments],
  );

  useEffect(() => {
    const root = rootRef.current;
    const content = contentRef.current;
    // 减弱动态效果时保持 CSS 默认的全亮进度，不挂监听
    if (!root || !content || prefersReducedMotion) return;

    let frame = 0;

    const update = () => {
      frame = 0;

      // 文本自身高度即点亮线的行程终点
      const travel = content.offsetHeight;
      if (travel <= 0) return;

      const { clientHeight, scrollHeight, scrollTop } = root;
      const range = scrollHeight - clientHeight;
      if (range <= 0) {
        root.style.setProperty('--elyri-scroll-reveal-progress', '1');
        return;
      }

      // 点亮线默认固定在视口的 LEAD_RATIO 高度处，屏幕下方始终留出一段未点亮的文字，
      // 明暗过渡在任何滚动位置都看得见。
      const line = scrollTop + clientHeight * LEAD_RATIO;

      // 收尾：在最后一屏的滚动里把点亮线平滑推到文末，因此滚到底时正好全文点亮，
      // 也就不必在文末补白。
      const tailStart = Math.max(0, range - clientHeight);
      const tail = Math.min(1, Math.max(0, (scrollTop - tailStart) / clientHeight));
      // 像素取整会让滚到底时差出 1px，直接判为全文点亮，避免最后一个词只亮一半
      const head = scrollTop >= range - 1 ? travel : line + tail * (travel - range - clientHeight * LEAD_RATIO);

      root.style.setProperty('--elyri-scroll-reveal-progress', String(Math.min(1, Math.max(0, head / travel))));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    root.addEventListener('scroll', onScroll, { passive: true });
    // 内容尺寸变化（字体加载、容器宽度变化）会改变行程长度，需要重新计算
    const observer = new ResizeObserver(onScroll);
    observer.observe(content);

    return () => {
      root.removeEventListener('scroll', onScroll);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [prefersReducedMotion, count]);

  const style = {
    '--elyri-scroll-reveal-height': `${height}px`,
    '--elyri-scroll-reveal-dim': dimOpacity,
    '--elyri-scroll-reveal-blur': `${blur}px`,
    '--elyri-scroll-reveal-count': count,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={cn('elyri-scroll-reveal', blur > 0 && 'elyri-scroll-reveal--blur', className)}
      style={style}
    >
      <div ref={contentRef} className="elyri-scroll-reveal__content" aria-label={children}>
        {segments.map((segment) =>
          segment.kind === 'space' ? (
            segment.value
          ) : (
            <span key={segment.key} className="elyri-scroll-reveal__word">
              {segment.units.map((unit) => (
                <span
                  key={unit.index}
                  className="elyri-scroll-reveal__unit"
                  style={{ '--elyri-scroll-reveal-index': unit.index } as CSSProperties}
                  aria-hidden="true"
                >
                  {unit.char}
                </span>
              ))}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
