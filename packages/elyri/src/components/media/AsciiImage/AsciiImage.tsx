import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import { cn, useColorScheme, usePrefersReducedMotion } from '../../../core';

import './AsciiImage.css';

export interface AsciiImageProps {
  /** 图片地址。跨域图片需服务端允许 CORS，否则无法读取像素，会退回显示原图 */
  src: string;
  /** 替代文本，提供给读屏软件 */
  alt?: string;
  className?: string;
  /** 每行字符数，越大细节越多 */
  columns?: number;
  /** 字符梯度，从稀疏到密集排列 */
  characters?: string;
  /** 是否按原图像素着色 */
  colored?: boolean;
  /** 单色模式下的字符颜色，默认继承文字颜色；也可用 CSS 变量 --elyri-ascii-color 覆盖 */
  color?: string;
  /** 反转明暗映射（默认深色主题下亮处字符密集，浅色主题下暗处字符密集） */
  invert?: boolean;
  /** 进入视口时是否自上而下解码显现 */
  animated?: boolean;
  /** 显现动画时长（毫秒） */
  duration?: number;
  /** 是否有一道斜向高光周期性扫过 */
  shimmer?: boolean;
  /** 每帧随机闪烁的字符比例（0-1），0 为关闭 */
  flicker?: number;
  /** 指针附近的字符是否被推开、提亮并乱码 */
  interactive?: boolean;
  /** 指针影响半径（CSS 像素） */
  radius?: number;
}

interface Cell {
  /** 字符格左上角坐标 */
  x: number;
  y: number;
  /** 字符在梯度中的下标 */
  glyph: number;
  r: number;
  g: number;
  b: number;
  /** 开始显现的进度阈值 */
  threshold: number;
  /** 沿高光扫过方向的归一化坐标 */
  diagonal: number;
}

const DEFAULT_CHARACTERS = ' .:-=+*#%@';
/** 解码时先显示乱码的进度窗口 */
const SCRAMBLE_WINDOW = 0.08;
/** 持续动效的帧间隔，字符画无需满帧 */
const FRAME_INTERVAL = 1000 / 40;
/** 高光扫过一次的周期（秒）与光带半宽 */
const SHIMMER_PERIOD = 4.5;
const SHIMMER_WIDTH = 0.07;

export function AsciiImage({
  src,
  alt = '',
  className,
  columns = 100,
  characters = DEFAULT_CHARACTERS,
  colored = false,
  color,
  invert = false,
  animated = true,
  duration = 1200,
  shimmer = true,
  flicker = 0.01,
  interactive = true,
  radius = 90,
}: AsciiImageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const scheme = useColorScheme();
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [failed, setFailed] = useState(false);
  const [width, setWidth] = useState(0);
  const [inView, setInView] = useState(false);
  // 只播放一次显现动画，之后尺寸、参数或可见性变化直接进入持续动效
  const playedRef = useRef(false);

  useEffect(() => {
    let disposed = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => {
      if (disposed) return;
      // 跨域图片未开启 CORS 时画布被污染，无法读取像素，改为显示原图
      const probe = document.createElement('canvas').getContext('2d');
      try {
        probe?.drawImage(img, 0, 0, 1, 1);
        probe?.getImageData(0, 0, 1, 1);
      } catch {
        setFailed(true);
        return;
      }
      setFailed(false);
      setImage(img);
    };
    img.onerror = () => {
      if (!disposed) setFailed(true);
    };
    img.src = src;
    return () => {
      disposed = true;
    };
  }, [src]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const resize = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    // 持续跟踪可见性，离屏时停止动效
    const intersection = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    resize.observe(root);
    intersection.observe(root);

    return () => {
      resize.disconnect();
      intersection.disconnect();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!root || !canvas || !ctx || !image || !width || !image.naturalWidth) return;

    const style = getComputedStyle(root);
    const ramp = Array.from(characters || DEFAULT_CHARACTERS);
    const cols = Math.min(400, Math.max(8, Math.round(columns)));
    const font = (size: number) => `${style.fontWeight} ${size}px ${style.fontFamily}`;

    // 按等宽字体实际字宽反推字号，让每行恰好铺满容器宽度；行高等于字号
    ctx.font = font(100);
    const cellW = width / cols;
    const fontSize = (cellW * 100) / ctx.measureText('M').width;
    const cellH = fontSize;
    const rows = Math.max(1, Math.round(((cols * image.naturalHeight) / image.naturalWidth) * (cellW / cellH)));
    const height = rows * cellH;

    // 把图片缩放到 cols × rows，每个像素对应一个字符格
    const sampler = document.createElement('canvas');
    sampler.width = cols;
    sampler.height = rows;
    const sctx = sampler.getContext('2d', { willReadFrequently: true });
    if (!sctx) return;
    sctx.imageSmoothingQuality = 'high';
    sctx.drawImage(image, 0, 0, cols, rows);

    let data: Uint8ClampedArray;
    try {
      data = sctx.getImageData(0, 0, cols, rows).data;
    } catch {
      // 加载时已校验过可读性，这里仅作兜底
      return;
    }

    // 深色主题下亮处字符密集，浅色主题下暗处字符密集，保证字符与背景形成对比
    const light = scheme === 'light';
    const flip = light !== invert;
    // 只保留非空白格：透明或最稀疏处始终留白，动效不会越出图形轮廓
    const cells: Cell[] = [];
    for (let i = 0; i < cols * rows; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      const a = data[i * 4 + 3] / 255;
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      const glyph = Math.min(ramp.length - 1, Math.floor((flip ? 1 - lum : lum) * a * ramp.length));
      if (!ramp[glyph].trim()) continue;
      const col = i % cols;
      const row = Math.floor(i / cols);
      cells.push({
        x: col * cellW,
        y: row * cellH,
        glyph,
        r,
        g,
        b,
        // 自上而下显现，并带少许随机错落
        threshold: (row / rows) * (1 - SCRAMBLE_WINDOW - 0.2) + Math.random() * 0.2,
        diagonal: (col / cols + row / rows) / 2,
      });
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.height = `${height}px`;

    const noise = ramp.filter((char) => char.trim());
    const fill = style.getPropertyValue('--elyri-ascii-color').trim() || style.color;
    // 高光在深色主题下偏白，浅色主题下偏黑，始终朝着更醒目的方向
    const highlight = light ? 0 : 255;
    const lift = Math.min(3, ramp.length - 1);
    const flickerRate = Math.min(1, Math.max(0, flicker));
    const reach = Math.max(1, radius);
    const motion = !prefersReducedMotion;
    const lens = motion && interactive;
    const pointer = { x: 0, y: 0, strength: 0, target: 0, tx: 0, ty: 0 };

    const draw = (progress: number, time: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.font = font(fontSize);
      ctx.textBaseline = 'top';
      ctx.fillStyle = fill;

      // 光带中心从左上外侧扫到右下外侧，之后留一段空档
      const band = motion && shimmer ? ((time / SHIMMER_PERIOD) % 1) * 1.8 - 0.4 : -10;

      for (const cell of cells) {
        let char = ramp[cell.glyph];
        if (progress < 1) {
          if (progress < cell.threshold) continue;
          // 刚进入显现窗口的格子先闪烁随机字符，再定格
          if (progress < cell.threshold + SCRAMBLE_WINDOW) char = noise[Math.floor(Math.random() * noise.length)];
        }

        const offset = (cell.diagonal - band) / SHIMMER_WIDTH;
        let boost = offset > -3 && offset < 3 ? Math.exp(-offset * offset) : 0;
        let x = cell.x;
        let y = cell.y;

        if (pointer.strength > 0.01) {
          const dx = x + cellW / 2 - pointer.x;
          const dy = y + cellH / 2 - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < reach) {
            const t = (1 - d / reach) * pointer.strength;
            // 指针处的字符被推开，形成一圈凸起的透镜
            const push = t * t * cellW * 2.2;
            if (d > 0.01) {
              x += (dx / d) * push;
              y += (dy / d) * push;
            }
            boost = Math.max(boost, t);
            if (Math.random() < t * 0.35) char = noise[Math.floor(Math.random() * noise.length)];
          }
        }

        if (boost > 0.05) char = ramp[Math.min(ramp.length - 1, cell.glyph + Math.round(boost * lift))];
        if (flickerRate && Math.random() < flickerRate) char = noise[Math.floor(Math.random() * noise.length)];

        ctx.globalAlpha = 0.82 + 0.18 * boost;
        if (colored) {
          const mix = boost * 0.6;
          ctx.fillStyle = `rgb(${cell.r + (highlight - cell.r) * mix},${cell.g + (highlight - cell.g) * mix},${cell.b + (highlight - cell.b) * mix})`;
        }
        ctx.fillText(char, x, y);
      }
      ctx.globalAlpha = 1;
    };

    // 减弱动态效果时只画静止成品
    if (!motion) {
      draw(1, 0);
      return;
    }
    const reveal = animated && !playedRef.current;
    // 未进入视口前：需要显现的保持空白，否则画出成品
    if (!inView) {
      draw(reveal ? 0 : 1, 0);
      return;
    }

    const continuous = shimmer || flickerRate > 0 || lens;
    const start = performance.now();
    let frame = 0;
    let last = 0;

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (now - last < FRAME_INTERVAL) return;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;

      const progress = reveal ? Math.min(1, (now - start) / Math.max(1, duration)) : 1;
      if (progress >= 1) playedRef.current = true;

      // 指针位置与强度都做平滑，进出时透镜渐显渐隐
      const ease = 1 - Math.exp(-dt * 12);
      pointer.x += (pointer.tx - pointer.x) * ease;
      pointer.y += (pointer.ty - pointer.y) * ease;
      pointer.strength += (pointer.target - pointer.strength) * (1 - Math.exp(-dt * 6));

      draw(progress, (now - start) / 1000);
      if (!continuous && progress >= 1) cancelAnimationFrame(frame);
    };
    frame = requestAnimationFrame(tick);

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const inside = x >= -reach && y >= -reach && x <= rect.width + reach && y <= rect.height + reach;
      // 首次进入时直接跳到指针处，避免透镜从角落滑过来
      if (inside && pointer.target === 0 && pointer.strength < 0.01) {
        pointer.x = x;
        pointer.y = y;
      }
      pointer.tx = x;
      pointer.ty = y;
      pointer.target = inside ? 1 : 0;
    };
    const handlePointerLeave = () => {
      pointer.target = 0;
    };
    if (lens) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', handlePointerLeave);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [
    image,
    width,
    columns,
    characters,
    colored,
    color,
    invert,
    scheme,
    animated,
    duration,
    shimmer,
    flicker,
    interactive,
    radius,
    inView,
    prefersReducedMotion,
  ]);

  const style = (color ? { '--elyri-ascii-color': color } : undefined) as CSSProperties | undefined;

  return (
    <div ref={rootRef} className={cn('elyri-ascii-image', className)} style={style}>
      {failed ? (
        <img className="elyri-ascii-image__fallback" src={src} alt={alt} />
      ) : (
        <canvas
          ref={canvasRef}
          className="elyri-ascii-image__canvas"
          role={alt ? 'img' : undefined}
          aria-label={alt || undefined}
          aria-hidden={alt ? undefined : true}
        />
      )}
    </div>
  );
}
