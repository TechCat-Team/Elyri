import { useEffect, useRef } from 'react';

import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const VERTEX_SHADER = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

/** 绘制帧率上限；留 1ms 容差，避免 60Hz 屏上因 rAF 抖动被误判而丢帧 */
const FRAME_INTERVAL = 1000 / 60 - 1;

export interface ShaderFrame {
  gl: WebGLRenderingContext;
  /** 按名称取 uniform 位置（带缓存） */
  uniform: (name: string) => WebGLUniformLocation | null;
  /** 当前使用的设备像素比 */
  dpr: number;
}

export interface ShaderCanvasOptions {
  /**
   * 全屏片元着色器。每帧自动写入：
   * - uResolution：画布尺寸（设备像素）
   * - uTime：累计动画时间（秒，已乘 speed）
   * - uPointer：平滑后的指针位置（设备像素，原点左上）；无指针时沿轨迹缓慢游走
   */
  fragmentShader: string;
  /** 每次绘制前写入组件自定义的 uniform */
  onDraw?: (frame: ShaderFrame) => void;
  speed?: number;
  interactive?: boolean;
  /** 减弱动态效果时停留的时间点 */
  stillTime?: number;
  /** 内部渲染分辨率上限（设备像素比），默认 2；重着色器可调低以省填充率 */
  maxDpr?: number;
}

const compile = (gl: WebGLRenderingContext, fragmentShader: string) => {
  const program = gl.createProgram();
  if (!program) return null;

  for (const [type, source] of [
    [gl.VERTEX_SHADER, VERTEX_SHADER],
    [gl.FRAGMENT_SHADER, fragmentShader],
  ] as const) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('[elyri] shader compile failed:', gl.getShaderInfoLog(shader));
    }
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }

  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('[elyri] shader link failed:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
};

/**
 * 把一个全屏片元着色器渲染到 canvas 上：负责尺寸与 DPR、指针跟随、
 * 离屏/后台暂停，以及减弱动态效果时只绘制静止帧。
 */
export function useShaderCanvas(options: ShaderCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const optionsRef = useRef(options);
  const redrawRef = useRef<() => void>(undefined);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { fragmentShader } = options;

  // 每次渲染同步最新参数；静止模式下参数变化需要手动重绘
  useEffect(() => {
    optionsRef.current = options;
    redrawRef.current?.();
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl', { alpha: false, antialias: false });
    if (!canvas || !gl) return;

    const program = compile(gl, fragmentShader);
    if (!program) return;

    // 单个覆盖全屏的三角形
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const locations = new Map<string, WebGLUniformLocation | null>();
    const uniform = (name: string) => {
      if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
      return locations.get(name) ?? null;
    };

    let width = 1;
    let height = 1;
    let dpr = 1;
    let time = prefersReducedMotion ? (optionsRef.current.stillTime ?? 2.4) : 0;
    // 指针位置用 0-1 的相对坐标
    const light = { x: 0.62, y: 0.32 };
    let pointer: { x: number; y: number } | null = null;

    const wander = () => ({ x: 0.5 + 0.32 * Math.sin(time * 0.31), y: 0.42 + 0.26 * Math.cos(time * 0.23) });

    const draw = () => {
      gl.uniform2f(uniform('uResolution'), width, height);
      gl.uniform1f(uniform('uTime'), time);
      gl.uniform2f(uniform('uPointer'), light.x * width, light.y * height);
      optionsRef.current.onDraw?.({ gl, uniform, dpr });
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.dataset.ready = '';
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, optionsRef.current.maxDpr ?? 2);
      width = Math.max(1, Math.round(rect.width * dpr));
      height = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      draw();
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      pointer = x >= 0 && x <= 1 && y >= 0 && y <= 1 ? { x, y } : null;
      if (prefersReducedMotion && pointer && (optionsRef.current.interactive ?? true)) {
        Object.assign(light, pointer);
        draw();
      }
    };
    const handlePointerLeave = () => {
      pointer = null;
    };

    let frame = 0;
    let last = 0;
    let inView = true;

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (last && now - last < FRAME_INTERVAL) return;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      const { speed = 1, interactive = true } = optionsRef.current;
      time += dt * speed;
      const target = pointer && interactive ? pointer : wander();
      const ease = 1 - Math.exp(-dt * 4);
      light.x += (target.x - light.x) * ease;
      light.y += (target.y - light.y) * ease;
      draw();
    };

    const start = () => {
      if (prefersReducedMotion || frame || !inView || document.hidden) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const handleVisibility = () => (document.hidden ? stop() : start());

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) start();
      else stop();
    });
    intersectionObserver.observe(canvas);

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibility);
    redrawRef.current = () => {
      if (prefersReducedMotion) draw();
    };

    resize();
    start();

    return () => {
      stop();
      redrawRef.current = undefined;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [fragmentShader, prefersReducedMotion]);

  return canvasRef;
}
