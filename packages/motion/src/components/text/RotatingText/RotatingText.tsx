import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import { cn, usePrefersReducedMotion } from '../../../core';

import './RotatingText.css';

/** 相邻字符进出动画的间隔（毫秒） */
const CHAR_STAGGER = 30;

export interface RotatingTextProps {
  /** 轮播的词语列表，至少一个 */
  words: string[];
  className?: string;
  /** 每个词的停留时长（毫秒） */
  interval?: number;
  /** 单词翻转进出的动画时长（毫秒） */
  duration?: number;
  /** 切换效果：flip 为 3D 翻转字符；block 为圆角色块包裹文字，块宽随词伸缩 */
  variant?: 'flip' | 'block';
}

/** 词语轮换：多个词依次翻转切换，容器宽度随词宽平滑过渡 */
export function RotatingText({
  words,
  className,
  interval = 2500,
  duration = 500,
  variant = 'flip',
}: RotatingTextProps) {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [width, setWidth] = useState<number>();
  const wordRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // words 变化时在渲染期间直接重置，从头开始轮播
  const [prevWords, setPrevWords] = useState(words);
  if (prevWords !== words) {
    setPrevWords(words);
    setIndex(0);
    setLeaving(null);
  }

  const count = words.length;
  const current = words[index] ?? words[0] ?? '';

  useEffect(() => {
    if (count < 2) return;

    const timer = window.setInterval(() => {
      // 减弱动态效果时直接替换，不播离场动画
      setLeaving(prefersReducedMotion ? null : current);
      setIndex((value) => (value + 1) % count);
    }, interval);

    return () => window.clearInterval(timer);
  }, [count, current, interval, prefersReducedMotion]);

  // 离场词在动画结束后移除
  useEffect(() => {
    if (leaving == null) return;

    const timer = window.setTimeout(() => setLeaving(null), duration + CHAR_STAGGER * leaving.length);
    return () => window.clearTimeout(timer);
  }, [leaving, duration]);

  // 容器宽度跟随当前词宽，配合 CSS transition 平滑伸缩
  useLayoutEffect(() => {
    const word = wordRef.current;
    if (word) setWidth(word.offsetWidth);
  }, [current]);

  const style = {
    '--elyri-rotating-text-duration': `${duration}ms`,
    width: width != null ? `${width}px` : undefined,
  } as CSSProperties;

  const renderChars = (word: string) =>
    Array.from(word).map((char, charIndex) => (
      <span
        key={`${char}-${charIndex}`}
        className="elyri-rotating-text__char"
        style={
          {
            '--elyri-rotating-text-index': charIndex,
            '--elyri-rotating-text-stagger': `${CHAR_STAGGER}ms`,
          } as CSSProperties
        }
        aria-hidden="true"
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));

  return (
    <span
      className={cn('elyri-rotating-text', variant !== 'flip' && `elyri-rotating-text--${variant}`, className)}
      style={style}
      aria-label={current}
    >
      <span ref={wordRef} className="elyri-rotating-text__word elyri-rotating-text__word--entering">
        {renderChars(current)}
      </span>
      {leaving != null && (
        <span className="elyri-rotating-text__word elyri-rotating-text__word--leaving" aria-hidden="true">
          {renderChars(leaving)}
        </span>
      )}
    </span>
  );
}
