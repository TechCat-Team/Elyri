import { useEffect, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { cn, hexToLinearRgb, useShaderCanvas } from '../../../core';

import './Velvet.css';

export interface VelvetProps {
  children?: ReactNode;
  className?: string;
  /** 丝绒本体色（hex） */
  color?: string;
  /** 绒面光晕色（hex） */
  sheenColor?: string;
  /** 褶皱密度倍率 */
  folds?: number;
  /** 动画速度倍率 */
  speed?: number;
  /** 光源是否跟随指针，指针划过是否留下渐消的压痕 */
  interactive?: boolean;
}

/** 压痕轨迹点数与消退时长 */
const TRAIL = 24;
const TRAIL_STEP_MS = 40;
const TRAIL_FADE_S = 1.6;
const trailData = new Float32Array(TRAIL * 3);

// 丝绒：斜向垂坠的褶皱高度场缓慢摆动。与缎面相反，丝绒正对视线处吸光发暗，
// 褶皱侧面因绒毛掠射散射而泛起柔光；叠加细密的绒毛颗粒。
// 指针轨迹以线段形式传入，被压倒的绒毛光晕消失、略显光亮，随时间回弹。
const FRAGMENT_SHADER = `
precision highp float;

#define TRAIL ${TRAIL}

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uBase;
uniform vec3 uSheen;
uniform float uFolds;
uniform vec3 uTrail[TRAIL];

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float drape(vec2 p, float t) {
  // 褶皱沿 x 分布、顺 y 垂下，并随高度缓慢摆动
  float sway = 0.35 * sin(p.y * 0.6 + t * 0.35) + 0.15 * sin(p.y * 1.3 - t * 0.27 + p.x * 0.4);
  float x = p.x + sway;
  float h = 0.55 * sin(x * 1.7 + 0.8 * sin(x * 0.5 + t * 0.1))
    + 0.3 * sin(x * 3.1 + p.y * 0.35 - t * 0.22)
    + 0.12 * sin(x * 5.3 - p.y * 0.6 + t * 0.3);
  h += 0.4 * (noise(p * 0.45 + vec2(t * 0.05, -t * 0.03)) - 0.5);
  return h;
}

float pressAt(vec2 frag, float minRes) {
  float s = 0.0;
  for (int i = 0; i < TRAIL - 1; i++) {
    vec3 a = uTrail[i];
    vec3 b = uTrail[i + 1];
    float w = min(a.z, b.z);
    if (w <= 0.0) continue;
    vec2 pa = frag - a.xy;
    vec2 ba = b.xy - a.xy;
    float k = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-3), 0.0, 1.0);
    vec2 d = (pa - ba * k) / minRes;
    s = max(s, w * exp(-dot(d, d) * 600.0));
  }
  return s;
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  float minRes = min(uResolution.x, uResolution.y);
  vec2 uv = frag / minRes;
  float t = uTime;

  // 斜向约 20° 的垂坠
  mat2 rot = mat2(0.94, 0.34, -0.34, 0.94);
  vec2 p = rot * uv * 2.4 * uFolds;

  float e = 0.01;
  float h = drape(p, t);
  vec2 grad = vec2(drape(p + vec2(e, 0.0), t) - h, drape(p + vec2(0.0, e), t) - h) / e;
  // 梯度转回屏幕坐标系
  grad = grad * rot;
  vec3 n = normalize(vec3(-grad * 0.5, 1.0));

  vec2 ptr = uPointer / minRes;
  vec3 L = normalize(vec3(ptr - uv, 0.8));
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float atten = 1.0 / (1.0 + 1.1 * dot(ptr - uv, ptr - uv));
  float NdotL = max(dot(n, L), 0.0);
  float wrap = clamp(dot(n, L) * 0.5 + 0.5, 0.0, 1.0);
  float rim = smoothstep(0.0, 0.45, 1.0 - n.z);

  float cavity = mix(0.3, 1.0, smoothstep(-0.9, 0.6, h));
  float pressed = pressAt(frag, minRes);

  // 绒毛颗粒：跟随布面，不随屏幕滑动
  float grain = 0.82 + 0.36 * noise(p * 70.0) * noise(p * 23.0 + 7.0);

  vec3 color = uBase * (0.05 + 0.4 * NdotL * NdotL * atten) * cavity;
  // 掠射角的绒面光晕，是丝绒的标志
  color += uSheen * rim * (0.25 + 0.9 * wrap * atten) * 0.75 * cavity * (1.0 - 0.85 * pressed);
  color += mix(uBase, uSheen, 0.4) * pow(max(dot(n, H), 0.0), 8.0) * 0.1 * atten;
  color *= mix(grain, 1.0, pressed * 0.7);

  // 压倒的绒毛：更暗、带一点顺毛的光泽
  color *= 1.0 - 0.3 * pressed;
  color += mix(uBase, uSheen, 0.6) * pow(max(dot(n, H), 0.0), 30.0) * 0.35 * pressed;

  vec2 vc = frag / uResolution - 0.5;
  color *= 1.0 - dot(vc, vc) * 1.2;
  color = pow(aces(color * 1.3), vec3(1.0 / 2.2));
  color += (hash(frag + fract(t)) - 0.5) / 255.0;

  gl_FragColor = vec4(color, 1.0);
}
`;

interface TrailPoint {
  x: number;
  y: number;
  t: number;
}

export function Velvet({
  children,
  className,
  color = '#6a1230',
  sheenColor = '#ffb3c8',
  folds = 1,
  speed = 1,
  interactive = true,
}: VelvetProps) {
  const trailRef = useRef<TrailPoint[]>([]);

  const canvasRef = useShaderCanvas({
    fragmentShader: FRAGMENT_SHADER,
    speed,
    interactive,
    onDraw: ({ gl, uniform, dpr }) => {
      const now = performance.now();
      trailData.fill(0);
      trailRef.current.forEach((point, i) => {
        const life = Math.max(0, 1 - (now - point.t) / 1000 / TRAIL_FADE_S);
        trailData[i * 3] = point.x * dpr;
        trailData[i * 3 + 1] = point.y * dpr;
        trailData[i * 3 + 2] = life * life;
      });
      gl.uniform3fv(uniform('uBase'), hexToLinearRgb(color));
      gl.uniform3fv(uniform('uSheen'), hexToLinearRgb(sheenColor));
      gl.uniform1f(uniform('uFolds'), Math.max(0.2, folds));
      gl.uniform3fv(uniform('uTrail'), trailData);
    },
  });

  useEffect(() => {
    trailRef.current = [];
    if (!interactive) return;

    // 记录相对画布的轨迹：每 40ms 落一个点，期间只更新末端位置，保证笔触连贯
    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const trail = trailRef.current;
      const now = performance.now();
      const last = trail[trail.length - 1];
      if (last && now - last.t < TRAIL_STEP_MS) {
        last.x = x;
        last.y = y;
        return;
      }
      trail.push({ x, y, t: now });
      if (trail.length > TRAIL) trail.shift();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [interactive, canvasRef]);

  return (
    <div className={cn('elyri-velvet', className)} style={{ '--elyri-velvet-color': color } as CSSProperties}>
      <canvas ref={canvasRef} className="elyri-velvet__canvas" aria-hidden="true" />
      {children != null && <div className="elyri-velvet__content">{children}</div>}
    </div>
  );
}
