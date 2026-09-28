import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import { cn, usePrefersReducedMotion } from '../../../core';

import './SplitReveal.css';

export type SplitRevealBy = 'char' | 'word';

export interface SplitRevealProps {
  /** 需要浮现的文本，仅支持纯字符串 */
  children: string;
  className?: string;
  /** 拆分单位：按字符或按单词 */
  by?: SplitRevealBy;
  /** 起始延迟（毫秒） */
  delay?: number;
  /** 相邻单元之间的播放间隔（毫秒） */
  stagger?: number;
  /** 单个单元的动画时长（毫秒） */
  duration?: number;
  /** 位移距离（像素） */
  distance?: number;
  /** 是否只在首次进入视口时触发 */
  once?: boolean;
}

interface Unit {
  char: string;
  index: number;
}

type Segment = { kind: 'space'; key: string; value: string } | { kind: 'word'; key: string; units: Unit[] };

/** 按空白切分文本，保留空白片段，并为每个动画单元分配全局序号 */
const splitText = (text: string, by: SplitRevealBy): Segment[] => {
  let index = 0;

  return text
    .split(/(\s+)/)
    .filter(Boolean)
    .map((part, partIndex) => {
      if (/^\s+$/.test(part)) return { kind: 'space' as const, key: `space-${partIndex}`, value: part };

      const units = by === 'char' ? Array.from(part) : [part];

      return {
        kind: 'word' as const,
        key: `word-${partIndex}`,
        units: units.map((char) => ({ char, index: index++ })),
      };
    });
};

export function SplitReveal({
  children,
  className,
  by = 'char',
  delay = 0,
  stagger = 40,
  duration = 600,
  distance = 24,
  once = true,
}: SplitRevealProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (once) observer.disconnect();
          return;
        }

        if (!once) setIsIntersecting(false);
      },
      { threshold: 0.1 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [once, prefersReducedMotion]);

  const segments = useMemo(() => splitText(children, by), [children, by]);

  const style = {
    '--elyri-split-reveal-delay': `${delay}ms`,
    '--elyri-split-reveal-stagger': `${stagger}ms`,
    '--elyri-split-reveal-duration': `${duration}ms`,
    '--elyri-split-reveal-distance': `${distance}px`,
  } as CSSProperties;

  const isVisible = prefersReducedMotion || isIntersecting;

  return (
    <span
      ref={elementRef}
      className={cn('elyri-split-reveal', isVisible && 'elyri-split-reveal--visible', className)}
      style={style}
    >
      {segments.map((segment) =>
        segment.kind === 'space' ? (
          segment.value
        ) : (
          <span key={segment.key} className="elyri-split-reveal__word">
            {segment.units.map((unit) => (
              <span
                key={unit.index}
                className="elyri-split-reveal__unit"
                style={{ '--elyri-split-reveal-index': unit.index } as CSSProperties}
              >
                {unit.char}
              </span>
            ))}
          </span>
        ),
      )}
    </span>
  );
}
