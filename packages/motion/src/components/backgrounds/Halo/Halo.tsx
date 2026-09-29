import type { CSSProperties, ReactNode } from 'react';

import { cn, hexToLinearRgb, useColorScheme, useShaderCanvas } from '../../../core';

import './Halo.css';

export interface HaloProps {
  children?: ReactNode;
  className?: string;
  /** 光环的两种渐变色（hex），沿圆周缓慢流转 */
  colors?: [string, string];
  /** 光环半径，相对画面高度的倍率 */
  size?: number;
  /** 动画速度倍率 */
  speed?: number;
  /** 光环中心是否轻微偏向指针 */
  interactive?: boolean;
}

const DEFAULT_COLORS: [string, string] = ['#8fb4ff', '#e7c6ff'];

// 画面中央一圈极细的光环：半径随角度轻微起伏，两束高光沿圆周流动，
// 外侧只有很淡的辉光，其余区域保持近黑，留白克制。
const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uSize;
uniform float uInteractive;
uniform vec3 uBg;
uniform float uScheme;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// 深色下光线叠加发亮；浅色下改为按色相吸收底色，像墨色细线落在纸面上
vec3 shade(vec3 bg, vec3 light) {
  if (uScheme > 0.5) {
    float amount = max(max(light.r, light.g), light.b);
    vec3 tint = light / max(amount, 1e-4);
    return bg * exp(-amount * 1.6 * (1.0 - tint * 0.8));
  }
  return bg + 1.0 - exp(-light * 1.4);
}

void main() {
  vec2 res = uResolution;
  vec2 p = (gl_FragCoord.xy - 0.5 * res) / res.y;
  vec2 pointer = (vec2(uPointer.x, res.y - uPointer.y) - 0.5 * res) / res.y;
  p -= pointer * 0.06 * uInteractive;
  float t = uTime;

  float r = length(p);
  float a = atan(p.y, p.x);

  float radius = 0.3 * uSize;
  radius += 0.010 * sin(a * 3.0 + t * 0.5) + 0.006 * sin(a * 5.0 - t * 0.8);
  float d = abs(r - radius);

  float line = exp(-d * d * 60000.0);
  float glow = exp(-d * 22.0) * 0.28 + exp(-d * 6.0) * 0.05;

  // 两束高光沿圆周以不同速度流动
  float f1 = pow(0.5 + 0.5 * cos(a - t * 0.45), 6.0);
  float f2 = pow(0.5 + 0.5 * cos(a + 2.4 + t * 0.28), 10.0);
  float flow = 0.12 + f1 + 0.6 * f2;

  vec3 tint = mix(uColor1, uColor2, 0.5 + 0.5 * sin(a + t * 0.2));
  vec3 light = tint * (line * 1.1 + glow) * flow;
  // 圈内极淡的雾光
  light += uColor1 * 0.015 * exp(-r * r / (radius * radius) * 1.5);

  vec3 color = pow(clamp(shade(uBg, light), 0.0, 1.0), vec3(1.0 / 2.2));
  color += (hash(gl_FragCoord.xy + fract(t)) - 0.5) / 255.0;

  gl_FragColor = vec4(color, 1.0);
}
`;

export function Halo({
  children,
  className,
  colors = DEFAULT_COLORS,
  size = 1,
  speed = 1,
  interactive = true,
}: HaloProps) {
  const [first = DEFAULT_COLORS[0], second = DEFAULT_COLORS[1]] = colors;
  const scheme = useColorScheme();

  const canvasRef = useShaderCanvas({
    fragmentShader: FRAGMENT_SHADER,
    speed,
    interactive,
    onDraw: ({ gl, uniform }) => {
      gl.uniform3fv(uniform('uColor1'), hexToLinearRgb(first));
      gl.uniform3fv(uniform('uColor2'), hexToLinearRgb(second));
      gl.uniform1f(uniform('uSize'), Math.max(0.1, size));
      gl.uniform1f(uniform('uInteractive'), interactive ? 1 : 0);
      gl.uniform3fv(uniform('uBg'), hexToLinearRgb(scheme === 'light' ? '#f8f8fa' : '#010102'));
      gl.uniform1f(uniform('uScheme'), scheme === 'light' ? 1 : 0);
    },
  });

  return (
    <div
      className={cn('elyri-halo', className)}
      data-scheme={scheme}
      style={{ '--elyri-halo-color': first } as CSSProperties}
    >
      <canvas ref={canvasRef} className="elyri-halo__canvas" aria-hidden="true" />
      {children != null && <div className="elyri-halo__content">{children}</div>}
    </div>
  );
}
