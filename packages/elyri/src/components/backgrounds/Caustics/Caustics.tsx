import type { CSSProperties, ReactNode } from 'react';

import { cn, hexToLinearRgb, useShaderCanvas } from '../../../core';

import './Caustics.css';

export interface CausticsProps {
  children?: ReactNode;
  className?: string;
  /** 水体颜色（hex） */
  color?: string;
  /** 焦散光色（hex） */
  highlightColor?: string;
  /** 光纹密度倍率 */
  density?: number;
  /** 动画速度倍率 */
  speed?: number;
  /** 指针处是否荡开水波并聚光 */
  interactive?: boolean;
}

// 水下焦散：两层运动 Voronoi 的细胞边缘构成光网，交汇处叠加增亮；
// RGB 三通道轻微错位模拟色散，再加顶部斜射的光束与随深度变暗的水体。
const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uBase;
uniform vec3 uHighlight;
uniform float uDensity;
uniform float uRipple;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

float cellEdge(vec2 p, float t) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float f1 = 8.0;
  float f2 = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 o = 0.5 + 0.4 * sin(t * 0.8 + 6.2831 * hash2(i + g));
      float d = length(g + o - f);
      if (d < f1) {
        f2 = f1;
        f1 = d;
      } else if (d < f2) {
        f2 = d;
      }
    }
  }
  return f2 - f1;
}

float caustic(vec2 p, float t) {
  p += 0.25 * vec2(sin(p.y * 1.3 + t * 0.7), cos(p.x * 1.1 - t * 0.6));
  float a = exp(-cellEdge(p, t) * 9.0);
  float b = exp(-cellEdge(p * 1.7 + vec2(3.1, 7.4), t * 1.3) * 9.0);
  return a * 0.7 + b * 0.45 + a * b * 1.5;
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  float minRes = min(uResolution.x, uResolution.y);
  float t = uTime;
  vec2 p = frag / minRes * 4.0 * uDensity;

  // 指针处荡开的水波
  vec2 dp = (frag - uPointer) / minRes;
  float r = length(dp);
  p += dp / (r + 1e-4) * sin(r * 38.0 - t * 4.0) * 0.06 * exp(-r * 5.0) * uRipple;

  vec3 caus = vec3(
    caustic(p + vec2(0.014, 0.0), t),
    caustic(p, t),
    caustic(p - vec2(0.014, 0.0), t)
  );

  float depth = frag.y / uResolution.y;
  vec3 color = mix(uBase * 0.35, uBase * 0.025, depth);

  // 斜射光束
  float x = frag.x / minRes + depth * 0.35;
  float rays = (0.5 + 0.5 * sin(x * 9.0 + sin(x * 3.1 + t * 0.3) * 2.0 + t * 0.2)) * (0.5 + 0.5 * sin(x * 17.0 - t * 0.35));
  color += uHighlight * 0.12 * rays * rays * (1.0 - depth) * (1.0 - depth);

  float focus = 0.6 + 0.8 * exp(-dot(dp, dp) * 3.0) * uRipple;
  color += uHighlight * caus * 0.5 * mix(1.0, 0.3, depth) * focus;

  vec2 vc = frag / uResolution - 0.5;
  color *= 1.0 - dot(vc, vc) * 1.1;
  color = pow(aces(color * 1.2), vec3(1.0 / 2.2));
  color += (hash(frag + fract(t)) - 0.5) / 255.0;

  gl_FragColor = vec4(color, 1.0);
}
`;

export function Caustics({
  children,
  className,
  color = '#0a6fa8',
  highlightColor = '#c8fbff',
  density = 1,
  speed = 1,
  interactive = true,
}: CausticsProps) {
  const canvasRef = useShaderCanvas({
    fragmentShader: FRAGMENT_SHADER,
    speed,
    interactive,
    onDraw: ({ gl, uniform }) => {
      gl.uniform3fv(uniform('uBase'), hexToLinearRgb(color));
      gl.uniform3fv(uniform('uHighlight'), hexToLinearRgb(highlightColor));
      gl.uniform1f(uniform('uDensity'), Math.max(0.2, density));
      gl.uniform1f(uniform('uRipple'), interactive ? 1 : 0);
    },
  });

  return (
    <div className={cn('elyri-caustics', className)} style={{ '--elyri-caustics-color': color } as CSSProperties}>
      <canvas ref={canvasRef} className="elyri-caustics__canvas" aria-hidden="true" />
      {children != null && <div className="elyri-caustics__content">{children}</div>}
    </div>
  );
}
