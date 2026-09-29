import { useMemo } from 'react';
import type { CSSProperties } from 'react';

import { cn, splitTextUnits } from '../../../core';

import './WaveText.css';

export interface WaveTextProps {
  /** 需要起伏的文本，仅支持纯字符串 */
  children: string;
  className?: string;
  /** 振幅（像素） */
  amplitude?: number;
  /** 单个字符一次起伏的时长（毫秒） */
  speed?: number;
  /** 相邻字符的相位差（毫秒），越大波浪越稀疏 */
  stagger?: number;
}

/** 波浪文字：字符按正弦节奏依次上下起伏 */
export function WaveText({ children, className, amplitude = 6, speed = 1200, stagger = 60 }: WaveTextProps) {
  const segments = useMemo(() => splitTextUnits(children, 'char'), [children]);

  const style = {
    '--elyri-wave-text-amplitude': `${amplitude}px`,
    '--elyri-wave-text-speed': `${speed}ms`,
    '--elyri-wave-text-stagger': `${stagger}ms`,
  } as CSSProperties;

  return (
    <span className={cn('elyri-wave-text', className)} style={style} aria-label={children}>
      {segments.map((segment) =>
        segment.kind === 'space' ? (
          segment.value
        ) : (
          <span key={segment.key} className="elyri-wave-text__word">
            {segment.units.map((unit) => (
              <span
                key={unit.index}
                className="elyri-wave-text__unit"
                style={{ '--elyri-wave-text-index': unit.index } as CSSProperties}
                aria-hidden="true"
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
