import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';

import { clamp, hsvToRgb, parseColor, rgbToHsv, toHex, toRgb } from '../lib/color';
import type { HSV, RGB } from '../lib/color';
import { useI18n } from '../lib/i18n';

const CHANNELS: Array<{ key: keyof RGB; label: string }> = [
  { key: 'r', label: 'R' },
  { key: 'g', label: 'G' },
  { key: 'b', label: 'B' },
];

/** 与 CSS 里退场动画时长保持一致 */
const EXIT_MS = 140;

/** 与 CSS 里弹层与触发元素的间距保持一致 */
const GAP = 16;

/** 触发元素与视口边缘之间至少留出的空间 */
const MIN_ROOM = 8;

interface ColorPickerProps {
  value: string;
  label: string;
  onChange: (value: string) => void;
}

/** 自绘选色器：色盘 + 色相条 + 颜色代码 + RGB 滑杆 */
export function ColorPicker({ value, label, onChange }: ColorPickerProps) {
  const { t } = useI18n();
  const [rendered, setRendered] = useState(false);
  const [closing, setClosing] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  /** 三角相对弹层左边缘的位置 */
  const [caretX, setCaretX] = useState(0);
  /** 下方放不下时改为在触发元素上方展开 */
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');

  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const swatchRef = useRef<HTMLButtonElement>(null);
  const squareRef = useRef<HTMLDivElement>(null);

  const rgb = toRgb(value);
  const derived = rgbToHsv(rgb);
  // 灰阶时色相会丢失，用最近一次的色相兜底，避免色盘跳回红色
  const [lastHue, setLastHue] = useState(derived.h);
  const hsv: HSV = { h: derived.s === 0 ? lastHue : derived.h, s: derived.s, v: derived.v };

  const isOpen = rendered && !closing;
  // 输入框显示草稿，没有草稿时跟随外部颜色值
  const codeText = draft ?? value;

  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(() => {
      setRendered(false);
      setClosing(false);
    }, EXIT_MS);
    return () => clearTimeout(timer);
  }, [closing]);

  const measure = () => {
    const popover = popoverRef.current;
    const swatch = swatchRef.current;
    const root = rootRef.current;
    if (!popover || !swatch || !root) return;

    // 弹层入场时有缩放动画，getBoundingClientRect 会拿到动画中的尺寸，
    // 这里用 offsetWidth / offsetHeight（不受 transform 影响）推算实际尺寸。
    const rootRect = root.getBoundingClientRect();
    const swatchRect = swatch.getBoundingClientRect();
    const swatchCenter = swatchRect.left + swatchRect.width / 2 - rootRect.left;
    const popoverLeft = rootRect.width - popover.offsetWidth;
    const nextCaretX = clamp(swatchCenter - popoverLeft, 18, popover.offsetWidth - 18);

    const spaceBelow = window.innerHeight - rootRect.bottom - GAP;
    const spaceAbove = rootRect.top - GAP;
    const nextPlacement = spaceBelow >= popover.offsetHeight + MIN_ROOM || spaceBelow >= spaceAbove ? 'bottom' : 'top';

    // 滚动时会频繁触发，值没变就保留原状态，避免每帧重渲染
    setCaretX((prev) => (prev === nextCaretX ? prev : nextCaretX));
    setPlacement((prev) => (prev === nextPlacement ? prev : nextPlacement));
  };

  // 用布局副作用，避免先按默认位置画一帧再翻转
  useLayoutEffect(() => {
    if (rendered) measure();
  }, [rendered]);

  useEffect(() => {
    if (!isOpen) return;
    const onViewportChange = () => measure();
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setClosing(true);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setClosing(true);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
    };
  }, [isOpen]);

  const emit = (next: HSV) => {
    setLastHue(next.h);
    onChange(toHex(hsvToRgb(next)));
  };

  const setChannel = (key: keyof RGB, next: number) => onChange(toHex({ ...rgb, [key]: next }));

  const trackOf = (key: keyof RGB) => ({
    background: `linear-gradient(90deg, ${toHex({ ...rgb, [key]: 0 })}, ${toHex({ ...rgb, [key]: 255 })})`,
  });

  const pickFromSquare = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = squareRef.current?.getBoundingClientRect();
    if (!rect) return;
    const s = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const v = 1 - clamp((event.clientY - rect.top) / rect.height, 0, 1);
    emit({ h: hsv.h, s, v });
  };

  const commitDraft = () => {
    const parsed = parseColor(codeText);
    if (parsed) {
      onChange(parsed);
      setLastHue(rgbToHsv(toRgb(parsed)).h);
    }
    setDraft(null);
  };

  return (
    <div className="color-picker" ref={rootRef}>
      <button
        ref={swatchRef}
        type="button"
        className="color-swatch"
        style={{ background: value }}
        aria-label={label}
        aria-expanded={isOpen}
        onClick={() => {
          if (isOpen) {
            setClosing(true);
            return;
          }
          setClosing(false);
          setDraft(null);
          setRendered(true);
        }}
      />
      <code className="color-hex">{value}</code>

      {rendered && (
        <div
          ref={popoverRef}
          className={`color-popover${placement === 'top' ? ' is-top' : ''}${closing ? ' is-closing' : ''}`}
          style={{ '--color-caret-x': `${caretX}px` } as CSSProperties}
          role="dialog"
          aria-label={label}
        >
          <div className="color-popover-body">
            <div
              ref={squareRef}
              className="color-square"
              style={{ backgroundColor: `hsl(${hsv.h} 100% 50%)` }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                setDragging(true);
                pickFromSquare(event);
              }}
              onPointerMove={(event) => {
                if (dragging) pickFromSquare(event);
              }}
              onPointerUp={(event) => {
                setDragging(false);
                event.currentTarget.releasePointerCapture(event.pointerId);
              }}
            >
              <span className="color-square-cursor" style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }} />
            </div>

            <input
              type="range"
              min={0}
              max={359}
              className="color-hue"
              aria-label="Hue"
              value={hsv.h}
              onChange={(event) => emit({ ...hsv, h: Number(event.target.value) })}
            />

            <label className="color-code">
              <span className="color-code-label">{t('color.code')}</span>
              <input
                className="color-code-input"
                value={codeText}
                spellCheck={false}
                placeholder={t('color.codePlaceholder')}
                onChange={(event) => setDraft(event.target.value)}
                onBlur={commitDraft}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return;
                  event.preventDefault();
                  commitDraft();
                }}
              />
            </label>

            {CHANNELS.map((channel) => (
              <label key={channel.key} className="color-row">
                <span className="color-channel">{channel.label}</span>
                <input
                  type="range"
                  min={0}
                  max={255}
                  className="color-slider"
                  style={trackOf(channel.key)}
                  value={rgb[channel.key]}
                  onChange={(event) => setChannel(channel.key, Number(event.target.value))}
                />
                <span className="color-channel-value">{rgb[channel.key]}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
