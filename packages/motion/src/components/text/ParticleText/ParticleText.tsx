import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import { cn, useColorScheme, usePrefersReducedMotion } from '../../../core';

import './ParticleText.css';

export interface ParticleTextProps {
  /** 由粒子组成的文本，仅支持纯字符串，可用 \n 换行 */
  children: string;
  className?: string;
  /** 粒子颜色，默认继承文字颜色；也可用 CSS 变量 --elyri-particle-color 覆盖 */
  color?: string;
  /** 单个粒子边长（CSS 像素） */
  particleSize?: number;
  /** 采样间距（CSS 像素），越小粒子越密 */
  gap?: number;
  /** 指针排斥半径（CSS 像素），0 为关闭交互 */
  radius?: number;
  /** 排斥力度倍率 */
  force?: number;
  /** 首次进入视口时粒子是否从四周飞入聚合成字 */
  assemble?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  /** 回弹刚度，每颗略有差异，聚合时先后到位更自然 */
  k: number;
}

type Context2D = CanvasRenderingContext2D & { letterSpacing?: string };

const FRICTION = 0.86;

export function ParticleText({
  children,
  className,
  color,
  particleSize = 2,
  gap = 3,
  radius = 80,
  force = 1,
  assemble = true,
}: ParticleTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const scheme = useColorScheme();
  const [ready, setReady] = useState(false);

  // 跨重建保留粒子，字体加载、尺寸或文本变化时从当前位置流向新字形，而不是重新播放聚合
  const particlesRef = useRef<Particle[]>([]);
  const padRef = useRef(0);
  const optionsRef = useRef({ particleSize, force });
  const wakeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    optionsRef.current = { particleSize, force };
    wakeRef.current?.();
  }, [particleSize, force, color, scheme]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!root || !canvas || !ctx) return;

    const style = getComputedStyle(root);
    const interactive = radius > 0 && !prefersReducedMotion;
    const pointer = { x: 0, y: 0, active: false };
    let width = 0;
    let height = 0;
    let dpr = 1;
    let visible = false;
    let running = false;
    let frame = 0;
    let buildFrame = 0;
    let last = 0;
    let lastColor = '';

    const build = () => {
      const w = root.offsetWidth;
      const h = root.offsetHeight;
      if (!w || !h) return;

      // 画布四周留出排斥半径，被推开的粒子不会被裁掉
      const pad = Math.ceil(Math.max(radius, 0) + 16);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = w + pad * 2;
      height = h + pad * 2;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.style.left = canvas.style.top = `${-pad}px`;

      // 在离屏画布上按元素的实际字体绘制文字，再按间距采样不透明像素作为粒子目标点
      const sampler = document.createElement('canvas');
      sampler.width = Math.ceil(w);
      sampler.height = Math.ceil(h);
      const sctx = sampler.getContext('2d', { willReadFrequently: true }) as Context2D | null;
      if (!sctx) return;

      sctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      if ('letterSpacing' in sctx) sctx.letterSpacing = style.letterSpacing === 'normal' ? '0px' : style.letterSpacing;
      const align = style.textAlign;
      const alignRight = align === 'right' || align === 'end';
      sctx.textAlign = align === 'center' ? 'center' : alignRight ? 'right' : 'left';
      const originX = align === 'center' ? w / 2 : alignRight ? w : 0;

      const lines = children.split('\n');
      const lineHeight = h / lines.length;
      lines.forEach((line, index) => {
        const m = sctx.measureText(line);
        const ascent = m.fontBoundingBoxAscent ?? m.actualBoundingBoxAscent;
        const descent = m.fontBoundingBoxDescent ?? m.actualBoundingBoxDescent;
        sctx.fillText(line, originX, index * lineHeight + (lineHeight - ascent - descent) / 2 + ascent);
      });

      const data = sctx.getImageData(0, 0, sampler.width, sampler.height).data;
      const step = Math.max(1, gap);
      const targets: [number, number][] = [];
      for (let y = step / 2; y < sampler.height; y += step) {
        for (let x = step / 2; x < sampler.width; x += step) {
          if (data[(Math.floor(y) * sampler.width + Math.floor(x)) * 4 + 3] > 128) targets.push([x + pad, y + pad]);
        }
      }
      // 打乱顺序，文本变化时粒子交错流动而非整行平移
      for (let i = targets.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [targets[i], targets[j]] = [targets[j], targets[i]];
      }

      const prev = particlesRef.current;
      const shift = pad - padRef.current;
      const scatter = assemble && !prefersReducedMotion && prev.length === 0;
      particlesRef.current = targets.map(([tx, ty], index) => {
        const k = 0.03 + Math.random() * 0.04;
        if (prefersReducedMotion) return { x: tx, y: ty, vx: 0, vy: 0, tx, ty, k };
        const source = prev[index] ?? (prev.length ? prev[Math.floor(Math.random() * prev.length)] : null);
        if (source) return { x: source.x + shift, y: source.y + shift, vx: source.vx, vy: source.vy, tx, ty, k };
        if (scatter) return { x: Math.random() * width, y: Math.random() * height, vx: 0, vy: 0, tx, ty, k };
        return { x: tx, y: ty, vx: 0, vy: 0, tx, ty, k };
      });
      padRef.current = pad;
      lastColor = '';
      setReady(true);
      wake();
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 16.667, 3);
      last = now;
      const { particleSize: size, force: strength } = optionsRef.current;
      const damping = Math.pow(FRICTION, dt);
      const r2 = radius * radius;
      const push = Math.max(0, strength) * 3 * dt;
      let active = false;

      for (const p of particlesRef.current) {
        p.vx += (p.tx - p.x) * p.k * dt;
        p.vy += (p.ty - p.y) * p.k * dt;

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < r2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / radius) * push;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }

        p.vx *= damping;
        p.vy *= damping;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (!active && Math.abs(p.vx) + Math.abs(p.vy) + Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y) > 0.05) {
          active = true;
        }
      }

      // 优先使用 color 属性写入的 CSS 变量，否则跟随文字颜色（主题切换时自动更新）
      const fill = style.getPropertyValue('--elyri-particle-color').trim() || style.color;
      if (fill !== lastColor) {
        lastColor = fill;
        active = true;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = fill;
      const half = size / 2;
      for (const p of particlesRef.current) ctx.fillRect(p.x - half, p.y - half, size, size);

      // 全部静止且指针不在附近时停帧，省电
      if (visible && (active || pointer.active)) {
        frame = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    function wake() {
      if (running || !visible) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
    wakeRef.current = wake;

    const scheduleBuild = () => {
      cancelAnimationFrame(buildFrame);
      buildFrame = requestAnimationFrame(build);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      if (!inside && !pointer.active) return;
      pointer.x = x;
      pointer.y = y;
      pointer.active = inside;
      wake();
    };
    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    const resize = new ResizeObserver(scheduleBuild);
    intersection.observe(root);
    resize.observe(root);
    document.fonts?.addEventListener('loadingdone', scheduleBuild);
    if (interactive) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', handlePointerLeave);
    }
    build();

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(buildFrame);
      intersection.disconnect();
      resize.disconnect();
      document.fonts?.removeEventListener('loadingdone', scheduleBuild);
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
      wakeRef.current = null;
    };
  }, [children, gap, radius, assemble, prefersReducedMotion]);

  const style = (color ? { '--elyri-particle-color': color } : undefined) as CSSProperties | undefined;

  return (
    <span
      ref={rootRef}
      className={cn('elyri-particle-text', ready && 'elyri-particle-text--ready', className)}
      style={style}
    >
      {/* 真实文本负责排版尺寸与读屏，粒子就绪后才隐藏；服务端渲染与脚本未执行时仍可见 */}
      <span className="elyri-particle-text__label">{children}</span>
      <canvas ref={canvasRef} className="elyri-particle-text__canvas" aria-hidden="true" />
    </span>
  );
}
