import { useEffect, useState } from 'react';

import { cn, usePrefersReducedMotion } from '../../../core';

import './Typewriter.css';

export interface TypewriterProps {
  /** 需要逐字输出的文本，仅支持纯字符串 */
  children: string;
  className?: string;
  /** 每个字符的输入间隔（毫秒） */
  speed?: number;
  /** 开始输入前的延迟（毫秒） */
  startDelay?: number;
  /** 输入完成后是否循环重播 */
  loop?: boolean;
  /** 循环重播前的停顿（毫秒） */
  loopDelay?: number;
  /** 是否显示闪烁光标 */
  cursor?: boolean;
}

export function Typewriter({
  children,
  className,
  speed = 60,
  startDelay = 200,
  loop = false,
  loopDelay = 1200,
  cursor = true,
}: TypewriterProps) {
  const text = children;
  const prefersReducedMotion = usePrefersReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion || !text) return;

    let timer: ReturnType<typeof setTimeout>;
    let typed = 0;

    const typeNext = (wait: number) => {
      timer = setTimeout(() => {
        typed += 1;
        setCount(typed);

        if (typed < text.length) {
          typeNext(speed);
          return;
        }

        if (loop) {
          timer = setTimeout(() => {
            typed = 0;
            setCount(0);
            typeNext(speed);
          }, loopDelay);
        }
      }, wait);
    };

    // 起始延迟结束后归零并开始逐字输入
    timer = setTimeout(() => {
      typed = 0;
      setCount(0);
      typeNext(0);
    }, startDelay);

    return () => clearTimeout(timer);
  }, [text, speed, startDelay, loop, loopDelay, prefersReducedMotion]);

  const visible = prefersReducedMotion ? text : text.slice(0, count);

  return (
    <span className={cn('elyri-typewriter', className)}>
      <span className="elyri-typewriter__text">{visible}</span>
      {cursor && <span className="elyri-typewriter__cursor" aria-hidden="true" />}
    </span>
  );
}
