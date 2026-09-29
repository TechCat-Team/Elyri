import type { CSSProperties, ReactNode } from 'react';

import { cn, hexToLinearRgb, useShaderCanvas } from '../../../core';

import './Aurora.css';

export interface AuroraProps {
  children?: ReactNode;
  className?: string;
  /** 三段渐变色：帘底、中段、帘顶（hex） */
  colors?: [string, string, string];
  /** 动画速度倍率 */
  speed?: number;
  /** 极光亮度倍率 */
  intensity?: number;
  /** 是否显示星空 */
  stars?: boolean;
  /** 指针附近的极光是否增亮 */
  interactive?: boolean;
}

const DEFAULT_COLORS: [string, string, string] = ['#3cffb0', '#2a8cff', '#c04dff'];

// 多层极光帘幕：每层是一条被 fbm 扭动的曲线，下缘锐利、向上柔和衰减，
// 叠加沿水平方向的高频竖向光束，颜色随高度从帘底色过渡到帘顶色。
const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uIntensity;
uniform float uStars;

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

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.1, 9.2);
    a *= 0.5;
  }
  return v;
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.y;
  vec2 pointer = vec2(uPointer.x, uResolution.y - uPointer.y) / uResolution.y;
  float t = uTime;

  // 夜空底色：地平线附近略带帘底色的微光
  vec3 color = mix(vec3(0.002, 0.004, 0.012), vec3(0.006, 0.01, 0.03), uv.y);
  color += uColor1 * 0.025 * exp(-uv.y * 5.0);

  // 星空
  vec2 grid = uv * 55.0;
  vec2 cell = floor(grid);
  float rnd = hash(cell);
  vec2 offset = vec2(hash(cell + 3.1), hash(cell + 7.7)) - 0.5;
  float starDist = length(fract(grid) - 0.5 - offset * 0.7);
  float twinkle = 0.6 + 0.4 * sin(t * (1.5 + rnd * 3.0) + rnd * 40.0);
  float star = step(0.93, rnd) * exp(-starDist * starDist * 180.0) * twinkle * smoothstep(0.1, 0.6, uv.y);
  color += vec3(0.8, 0.85, 1.0) * star * uStars;

  vec3 aurora = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float x = uv.x * (0.6 + fi * 0.15) + fi * 3.7;
    float curve = 0.42 + fi * 0.09 + (fbm(vec2(x * 1.2 - t * 0.05 * (1.0 + fi * 0.3), fi * 5.3 + t * 0.03)) - 0.5) * 0.45;
    float d = uv.y - curve;
    float body = d > 0.0 ? exp(-d * (3.5 + fi)) : exp(d * 40.0);
    float rays = fbm(vec2(x * 28.0 + curve * 6.0, t * 0.35 + fi));
    rays = 0.25 + 1.5 * rays * rays;
    float flow = 0.6 + 0.4 * sin(x * 3.0 - t * 0.4 + fi * 1.7);
    vec3 c = mix(uColor1, uColor2, smoothstep(0.0, 0.3, d));
    c = mix(c, uColor3, smoothstep(0.12, 0.55, d) * (0.55 + 0.45 * sin(fi * 2.1 + x * 0.8 + t * 0.1)));
    aurora += c * body * rays * flow * (0.5 - fi * 0.08);
  }

  vec2 dp = uv - pointer;
  aurora *= 1.0 + 0.7 * exp(-dot(dp, dp) * 6.0);
  color += aurora * uIntensity;

  vec2 vc = gl_FragCoord.xy / uResolution - 0.5;
  color *= 1.0 - dot(vc, vc) * 0.9;
  color = pow(aces(color * 1.2), vec3(1.0 / 2.2));
  color += (hash(gl_FragCoord.xy + fract(t)) - 0.5) / 255.0;

  gl_FragColor = vec4(color, 1.0);
}
`;

export function Aurora({
  children,
  className,
  colors = DEFAULT_COLORS,
  speed = 1,
  intensity = 1,
  stars = true,
  interactive = true,
}: AuroraProps) {
  const [bottom = DEFAULT_COLORS[0], middle = DEFAULT_COLORS[1], top = DEFAULT_COLORS[2]] = colors;

  const canvasRef = useShaderCanvas({
    fragmentShader: FRAGMENT_SHADER,
    speed,
    interactive,
    onDraw: ({ gl, uniform }) => {
      gl.uniform3fv(uniform('uColor1'), hexToLinearRgb(bottom));
      gl.uniform3fv(uniform('uColor2'), hexToLinearRgb(middle));
      gl.uniform3fv(uniform('uColor3'), hexToLinearRgb(top));
      gl.uniform1f(uniform('uIntensity'), Math.max(0, intensity));
      gl.uniform1f(uniform('uStars'), stars ? 1 : 0);
    },
  });

  return (
    <div className={cn('elyri-aurora', className)} style={{ '--elyri-aurora-color': bottom } as CSSProperties}>
      <canvas ref={canvasRef} className="elyri-aurora__canvas" aria-hidden="true" />
      {children != null && <div className="elyri-aurora__content">{children}</div>}
    </div>
  );
}
