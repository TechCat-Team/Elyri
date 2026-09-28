import { useEffect, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { cn, usePrefersReducedMotion } from '../../../core';

import './DragonScales.css';

export interface DragonScalesProps {
  children?: ReactNode;
  className?: string;
  /** 鳞片本体色（hex） */
  color?: string;
  /** 反光条与鳞缘高光色（hex） */
  highlightColor?: string;
  /** 单片鳞宽度（px） */
  scaleSize?: number;
  /** 动画速度倍率 */
  speed?: number;
  /** 鳞片开合幅度 0-1，0 为关闭 */
  flare?: number;
  /** 光源是否跟随指针 */
  interactive?: boolean;
}

const VERTEX_SHADER = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

// 鳞片为尖头鱼鳞形（vesica），侧向排列：鳞尖朝右，左侧鳞片压住右侧。
// 表面是黑曜石般的高光釉面：窄倒角 + 平缓鼓面，反射一组线形灯带，
// 灯带在曲面上被拉成贴着轮廓的弧形亮线，鳞缘再勾一道细亮边。
const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uLight;
uniform float uScale;
uniform vec3 uBase;
uniform vec3 uHighlight;
uniform float uFlare;

const float R = 0.92;
const float D = 0.30;
const float B = 0.8697;
const float ROW = 0.5;
const float BEVEL = 0.075;
const float TAU = 6.28318;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float sdScale(vec2 p) {
  p = abs(p);
  return ((p.y - B) * D > p.x * B) ? length(p - vec2(0.0, B)) : length(p - vec2(-D, 0.0)) - R;
}

float scaleHeight(vec2 q) {
  float inner = clamp(-sdScale(q) / BEVEL, 0.0, 1.0);
  float bevel = sqrt(1.0 - (1.0 - inner) * (1.0 - inner));
  vec2 d = vec2(q.x / 0.62, (q.y - 0.35) / 0.75);
  float dome = 0.14 * (1.0 - dot(d, d));
  float keel = 0.035 * exp(-q.x * q.x / 0.03) * smoothstep(-0.1, B, q.y);
  return bevel * (0.07 + dome + keel);
}

// 开合：一道波沿身体方向推进，经过的鳞片依次张开再合拢
float openAmount(vec2 c) {
  return uFlare * smoothstep(0.15, 1.0, sin(c.y * 0.45 - uTime * 1.3 + c.x * 0.3));
}

// 张开时鳞片绕根部翘起，透视上表现为鳞尖伸长、略微变宽
vec2 warp(vec2 q, float o) {
  return vec2(q.x / (1.0 + 0.05 * o), (q.y + 0.2) / (1.0 + 0.2 * o) - 0.2);
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  // 形状空间的 y（鳞尖方向）对应屏幕 x，实现侧向排列
  vec2 p = frag.yx / uScale;
  float px = 1.0 / uScale;
  float t = uTime;

  // 从左到右查找第一片覆盖当前像素的鳞，并记录到压在上面的鳞片边缘的距离。
  // 阴影与缝隙散光按每片上方鳞分别计算后取最大值，避免在两片张开程度不同的鳞之间出现接缝
  float j0 = floor(p.y / ROW);
  vec2 center = vec2(0.0);
  vec2 cell = vec2(0.0);
  float sd = -1.0;
  float cover = 1.0;
  float shade = 0.0;
  float gap = 0.0;
  float open = 0.0;
  float above = 1.0;
  float aboveShade = 0.0;
  float aboveGap = 0.0;
  float found = 0.0;
  for (int dj = -2; dj <= 2; dj++) {
    float j = j0 + float(dj);
    float offset = mod(j, 2.0) * 0.5;
    float i0 = floor(p.x - offset + 0.5);
    float rowMin = 1.0;
    float rowShade = 0.0;
    float rowGap = 0.0;
    for (int di = -1; di <= 1; di++) {
      vec2 id = vec2(i0 + float(di), j);
      vec2 c = vec2(id.x + offset, j * ROW);
      float o = openAmount(c);
      float d = sdScale(warp(p - c, o));
      if (found < 0.5 && d < 0.0) {
        found = 1.0;
        center = c;
        cell = id;
        sd = d;
        open = o;
        cover = above;
        shade = aboveShade;
        gap = aboveGap;
      }
      rowMin = min(rowMin, d);
      // 上方鳞片张开时投下更宽的阴影，下方透出散射光
      rowShade = max(rowShade, 1.0 - smoothstep(0.0, 0.16 + 0.3 * o, d));
      rowGap = max(rowGap, (1.0 - smoothstep(0.0, 0.1 + 0.25 * o, d)) * o);
    }
    if (found < 0.5) {
      above = min(above, rowMin);
      aboveShade = max(aboveShade, rowShade);
      aboveGap = max(aboveGap, rowGap);
    }
  }

  vec2 q = warp(p - center, open);
  float seed = hash(cell);
  float seed2 = hash(cell + 17.31);

  float e = 0.006;
  vec2 grad = vec2(
    scaleHeight(q + vec2(e, 0.0)) - scaleHeight(q - vec2(e, 0.0)),
    scaleHeight(q + vec2(0.0, e)) - scaleHeight(q - vec2(0.0, e))
  ) / (2.0 * e);
  vec3 ns = normalize(vec3(-grad, 1.0));

  // 每片鳞各自略微倾斜，再叠一道沿身体方向滚动的起伏，让反光条在鳞间流动
  float wave = sin(center.y * 0.35 - t * 0.9 + sin(center.x * 0.2 + t * 0.25) * 1.2);
  ns = normalize(ns + vec3((seed - 0.5) * 0.22, (seed2 - 0.5) * 0.22 + wave * 0.1 - open * 0.45, 0.0));
  vec3 n = vec3(ns.y, ns.x, ns.z);

  float minRes = min(uResolution.x, uResolution.y);
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 toLight = vec3(uLight - frag, minRes * 0.6);
  float dist = length(toLight);
  vec3 L = toLight / dist;
  float atten = 1.0 / (1.0 + 1.5 * pow(dist / minRes, 2.0));
  float NdotH = max(dot(n, normalize(L + V)), 0.0);
  float NdotV = max(n.z, 0.0);
  float soft = pow(NdotH, 24.0) * atten;
  float ao = mix(0.04, 1.0, 1.0 - shade);
  float fres = 0.35 + 0.65 * pow(1.0 - NdotV, 2.0);

  // 线形灯带：主灯带穿过光源位置并缓慢转动，副灯带只落在朝向一侧的倒角上
  vec3 Rf = reflect(-V, n);
  vec2 toL = (uLight - frag) / minRes;
  float a = 0.7 + 0.45 * sin(t * 0.17);
  vec2 dir = vec2(cos(a), sin(a));
  float s1 = dot(Rf.xy, dir) - dot(toL, dir) * 1.3 + 0.12 * sin(t * 0.5 + seed * TAU);
  float line1 = exp(-s1 * s1 / 0.0022);
  float band1 = exp(-s1 * s1 / 0.09);
  float s2 = dot(Rf.xy, vec2(-dir.y, dir.x)) - 0.85 - 0.15 * sin(t * 0.33);
  float line2 = exp(-s2 * s2 / 0.01);

  // 本体近黑，只在朝向光源的区域泛出一层柔和的底色，亮度主要来自反光条
  vec3 bloom = mix(uBase, uHighlight, 0.35);
  vec3 color = uBase * (0.006 + 0.5 * soft * mix(0.6, 1.1, seed)) * ao;
  color += bloom * band1 * 0.3 * atten * ao;
  color += uHighlight * line1 * 1.4 * fres * (0.3 + atten) * ao;
  color += uHighlight * line2 * 0.18 * fres * ao;

  // 双线鳞缘：上层鳞的边与被压住的下层鳞的边各一道细亮线，中间留一条暗缝
  float rimLight = (0.07 + 0.6 * soft + band1 * 0.9) * (1.0 + 1.2 * open);
  float r1 = (sd + 1.6 * px) / (1.4 * px);
  float r2 = (cover - 1.8 * px) / (1.4 * px);
  color += uHighlight * exp(-r1 * r1) * rimLight * 0.9;
  color += uHighlight * exp(-r2 * r2) * rimLight * 0.35;

  color += mix(uBase, uHighlight, 0.2) * gap * 0.35 * (0.3 + atten + band1);

  color += uHighlight * 0.03 * exp(-pow(length(frag - uLight) / (minRes * 0.4), 2.0));

  vec2 vc = frag / uResolution - 0.5;
  color *= 1.0 - dot(vc, vc) * 1.5;
  color = pow(aces(color * 1.3), vec3(1.0 / 2.2));
  color += (hash(frag + fract(t)) - 0.5) / 255.0;

  gl_FragColor = vec4(color, 1.0);
}
`;

const UNIFORMS = ['uResolution', 'uTime', 'uLight', 'uScale', 'uBase', 'uHighlight', 'uFlare'] as const;

type Rgb = [number, number, number];

/** hex 转线性空间 RGB，着色器内统一在线性空间计算光照 */
const toLinearRgb = (hex: string): Rgb => {
  let value = hex.replace('#', '');
  if (value.length === 3) value = [...value].map((char) => char + char).join('');
  const int = parseInt(value.slice(0, 6), 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255].map((channel) => (channel / 255) ** 2.2) as Rgb;
};

const createProgram = (gl: WebGLRenderingContext) => {
  const program = gl.createProgram();
  if (!program) return null;

  for (const [type, source] of [
    [gl.VERTEX_SHADER, VERTEX_SHADER],
    [gl.FRAGMENT_SHADER, FRAGMENT_SHADER],
  ] as const) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('[elyri] DragonScales shader failed:', gl.getShaderInfoLog(shader));
    }
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }

  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('[elyri] DragonScales program failed:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
};

export function DragonScales({
  children,
  className,
  color = '#7b3fe4',
  highlightColor = '#e7a6ff',
  scaleSize = 110,
  speed = 1,
  flare = 0,
  interactive = true,
}: DragonScalesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const redrawRef = useRef<() => void>(undefined);
  const prefersReducedMotion = usePrefersReducedMotion();
  const optionsRef = useRef({ color, highlightColor, scaleSize, speed, flare, interactive });

  useEffect(() => {
    optionsRef.current = { color, highlightColor, scaleSize, speed, flare, interactive };
    redrawRef.current?.();
  }, [color, highlightColor, scaleSize, speed, flare, interactive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl', { alpha: false, antialias: false });
    if (!canvas || !gl) return;

    const program = createProgram(gl);
    if (!program) return;

    // 单个覆盖全屏的三角形
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniforms = Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])) as Record<
      (typeof UNIFORMS)[number],
      WebGLUniformLocation | null
    >;

    let width = 1;
    let height = 1;
    let dpr = 1;
    // 静止模式下停在一个光影较好的时刻
    let time = prefersReducedMotion ? 2.4 : 0;
    // 光源位置用 0-1 的相对坐标，指针离开时回到缓慢游走的轨迹
    const light = { x: 0.62, y: 0.32 };
    let pointer: { x: number; y: number } | null = null;

    const wander = () => ({ x: 0.5 + 0.32 * Math.sin(time * 0.31), y: 0.42 + 0.26 * Math.cos(time * 0.23) });

    const draw = () => {
      const options = optionsRef.current;
      gl.uniform2f(uniforms.uResolution, width, height);
      gl.uniform1f(uniforms.uTime, time);
      gl.uniform2f(uniforms.uLight, light.x * width, light.y * height);
      gl.uniform1f(uniforms.uScale, Math.max(8, options.scaleSize) * dpr);
      gl.uniform3fv(uniforms.uBase, toLinearRgb(options.color));
      gl.uniform3fv(uniforms.uHighlight, toLinearRgb(options.highlightColor));
      gl.uniform1f(uniforms.uFlare, Math.min(Math.max(options.flare, 0), 1));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.dataset.ready = '';
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
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
      if (prefersReducedMotion && pointer && optionsRef.current.interactive) {
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
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      time += dt * optionsRef.current.speed;
      const target = pointer && optionsRef.current.interactive ? pointer : wander();
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
  }, [prefersReducedMotion]);

  const style = { '--elyri-dragon-scales-color': color } as CSSProperties;

  return (
    <div className={cn('elyri-dragon-scales', className)} style={style}>
      <canvas ref={canvasRef} className="elyri-dragon-scales__canvas" aria-hidden="true" />
      {children != null && <div className="elyri-dragon-scales__content">{children}</div>}
    </div>
  );
}
