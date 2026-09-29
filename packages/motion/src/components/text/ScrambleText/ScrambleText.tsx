import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import { cn, usePrefersReducedMotion } from '../../../core';

import './ScrambleText.css';

export type ScrambleTextTrigger = 'view' | 'hover';

export interface ScrambleTextProps {
  /** 需要解码显现的文本，仅支持纯字符串 */
  children: string;
  className?: string;
  /** 触发方式：进入视口或指针悬停 */
  trigger?: ScrambleTextTrigger;
  /** 乱码刷新间隔（毫秒） */
  speed?: number;
  /** 相邻字符依次定格的间隔（毫秒） */
  stagger?: number;
  /** 乱码字符池 */
  characters?: string;
  /** 乱码字符的强调色 */
  accentColor?: string;
  /** 乱码辉光强度倍率，0 为关闭，默认 1 */
  glow?: number;
  /** 视口模式下是否只在首次进入时触发 */
  once?: boolean;
}

interface Frame {
  chars: string[];
  resolved: number;
}

const DEFAULT_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_\\/[]{}=+*^?#';

const isSpace = (char: string) => /\s/.test(char);

export function ScrambleText({
  children,
  className,
  trigger = 'view',
  speed = 40,
  stagger = 60,
  characters = DEFAULT_CHARACTERS,
  accentColor,
  glow,
  once = true,
}: ScrambleTextProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  // 每次自增代表重新播放一轮解码
  const [runId, setRunId] = useState(0);
  const [frame, setFrame] = useState<Frame | null>(null);

  const chars = useMemo(() => Array.from(children), [children]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || prefersReducedMotion || trigger !== 'view') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRunId((id) => id + 1);
        if (once) observer.disconnect();
      },
      { threshold: 0.1 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [trigger, once, prefersReducedMotion]);

  useEffect(() => {
    if (runId === 0 || prefersReducedMotion) return;

    const pool = Array.from(characters || DEFAULT_CHARACTERS);
    const start = performance.now();

    // 按经过时间决定已定格的字符数，其余位置刷新为随机字符；返回是否已全部定格
    const step = () => {
      const resolved = Math.floor((performance.now() - start) / stagger);

      if (resolved >= chars.length) {
        setFrame(null);
        return true;
      }

      setFrame({
        resolved,
        chars: chars.map((char, index) =>
          index < resolved || isSpace(char) ? char : pool[Math.floor(Math.random() * pool.length)],
        ),
      });
      return false;
    };

    if (step()) return;

    const timer = setInterval(() => {
      if (step()) clearInterval(timer);
    }, speed);

    return () => clearInterval(timer);
  }, [runId, chars, characters, speed, stagger, prefersReducedMotion]);

  const replay = () => {
    if (!frame && !prefersReducedMotion) setRunId((id) => id + 1);
  };

  const hoverHandlers = trigger === 'hover' ? { onPointerEnter: replay, onFocus: replay } : null;

  const style = {
    ...(accentColor ? { '--elyri-scramble-accent': accentColor } : null),
    ...(glow !== undefined ? { '--elyri-scramble-glow': Math.max(0, glow) } : null),
  } as CSSProperties;

  return (
    <span ref={elementRef} className={cn('elyri-scramble-text', className)} style={style} {...hoverHandlers}>
      <span className="elyri-scramble-text__sr">{children}</span>
      <span aria-hidden="true">
        {chars.map((char, index) => {
          const isScrambled = frame !== null && index >= frame.resolved && !isSpace(char);

          // 原字符始终参与排版以固定宽度，乱码绝对定位叠在其上，不会改变行宽导致换行
          return (
            <span
              key={index}
              className={cn('elyri-scramble-text__char', isScrambled && 'elyri-scramble-text__char--scrambled')}
            >
              {char}
              {isScrambled && <span className="elyri-scramble-text__glyph">{frame.chars[index]}</span>}
            </span>
          );
        })}
      </span>
    </span>
  );
}
