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
  /** 绒毛质感强度，0 为光洁、1 为明显的毛绒颗粒 */
  fuzz?: number;
  /** 四周暗角强度，0 为无暗角 */
  vignette?: number;
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

// 丝绒：圆背窄谷的斜向垂坠褶皱缓慢摆动。用 Charlie 绒面分布着色——正对视线处吸光发暗，
// 褶皱侧面因绒毛掠射散射而泛起柔光；绒光上叠加可调强度的像素级纤维亮点与碎绒明暗。
// 指针轨迹以线段形式传入，被压倒的绒毛光晕消失、略显光亮，随时间回弹。
const FRAGMENT_SHADER = `
precision highp float;

#define TRAIL ${TRAIL}
#define PI 3.14159265

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uBase;
uniform vec3 uSheen;
uniform float uFolds;
uniform float uFuzz;
uniform float uVignette;
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

// 圆润的褶背 + 收紧的折痕：|sin| 在零点处形成 V 形谷，k 控制谷底锐度
float fold(float s, float k) {
  return sqrt(s * s + k);
}

float drape(vec2 p, float t) {
  // 褶皱沿 x 分布、顺 y 垂下，并随高度缓慢摆动
  float sway = 0.28 * sin(p.y * 0.5 + t * 0.3) + 0.12 * sin(p.y * 1.15 - t * 0.23 + p.x * 0.3);
  float x = p.x + sway;
  float s1 = sin(x * 1.35 + 0.6 * sin(x * 0.37 + t * 0.08));
  float s2 = sin(x * 2.7 + p.y * 0.28 - t * 0.18 + 1.3);
  float h = 0.62 * fold(s1, 0.012) + 0.26 * fold(s2, 0.03);
  // 褶背上的斜向细皱
  h += 0.05 * sin(p.x * 4.0 - p.y * 5.5 + t * 0.25) * s1 * s1;
  h += 0.25 * noise(p * 0.5 + vec2(t * 0.04, -t * 0.03));
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

  // 斜向约 16° 的垂坠
  mat2 rot = mat2(0.96, 0.28, -0.28, 0.96);
  vec2 p = rot * uv * 2.2 * uFolds;

  // 中心差分求法线，步长足够小以保留折痕的锐利边缘
  float e = 0.004;
  vec2 ex = vec2(e, 0.0);
  vec2 ey = vec2(0.0, e);
  float h = drape(p, t);
  vec2 grad = vec2(drape(p + ex, t) - drape(p - ex, t), drape(p + ey, t) - drape(p - ey, t)) / (2.0 * e);
  // 梯度转回屏幕坐标系
  grad = grad * rot;
  vec3 n = normalize(vec3(-grad * 0.75, 1.0));
  float NdotV = max(n.z, 1e-3);

  float pressed = pressAt(frag, minRes);
  // 绒毛：像素级的纤维亮点，沿垂坠方向略拉长；大块碎绒明暗与之同步受 uFuzz 控制
  vec2 fp = rot * frag;
  float fiber = 0.55 * hash(floor(fp)) + 0.45 * hash(floor(vec2(fp.x * 0.5, fp.y * 0.2)) + 31.0);
  float nap = 1.0 + (noise(p * 0.9 + 3.1) - 0.5) * 0.7 * uFuzz;
  float fuzz = mix(1.0, 0.45 + 1.1 * fiber, uFuzz);
  float ao = mix(0.4, 1.0, smoothstep(0.1, 0.8, h));

  // 主光：左上方固定柔光，保证形体稳定可读；辅光：跟随指针的点光
  vec2 ptr = uPointer / minRes;
  vec2 toPtr = ptr - uv;
  vec3 lights[2];
  lights[0] = normalize(vec3(-0.45, -0.55, 0.7));
  lights[1] = normalize(vec3(toPtr, 0.55));
  float power[2];
  power[0] = 1.5;
  power[1] = 1.6 / (1.0 + 3.0 * dot(toPtr, toPtr));

  // Charlie 绒面分布：正对光处吸光，掠射角散射出柔光
  const float INV_A = 1.0 / 0.38;
  vec3 color = uBase * 0.03 * ao;
  for (int i = 0; i < 2; i++) {
    vec3 L = lights[i];
    vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
    float NdotL = max(dot(n, L), 0.0);
    float NdotH = max(dot(n, H), 0.0);
    float sin2 = max(1.0 - NdotH * NdotH, 0.0078125);
    float D = (2.0 + INV_A) * pow(sin2, INV_A * 0.5) / (2.0 * PI);
    float vis = 1.0 / (4.0 * (NdotL + NdotV - NdotL * NdotV) + 1e-3);
    vec3 diffuse = uBase * (0.08 + 0.55 * NdotL) * ao;
    vec3 sheen = uSheen * D * vis * NdotL * nap * mix(fuzz, 1.0, pressed) * (1.0 - 0.85 * pressed);
    // 压倒的绒毛：顺毛方向出现一点缎面般的光泽
    vec3 gloss = mix(uBase, uSheen, 0.6) * pow(NdotH, 40.0) * 0.35 * pressed;
    color += (diffuse * (1.0 - 0.3 * pressed) + sheen + gloss) * power[i];
  }

  vec2 vc = frag / uResolution - 0.5;
  color *= max(1.0 - dot(vc, vc) * 1.2 * uVignette, 0.0);
  color = pow(aces(color * 1.2), vec3(1.0 / 2.2));
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
  fuzz = 0.4,
  vignette = 0.5,
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
      gl.uniform1f(uniform('uFuzz'), Math.min(1, Math.max(0, fuzz)));
      gl.uniform1f(uniform('uVignette'), Math.min(1, Math.max(0, vignette)));
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
