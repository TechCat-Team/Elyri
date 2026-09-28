import type { CSSProperties, ReactNode } from 'react';

import { cn, hexToLinearRgb, useShaderCanvas } from '../../../core';

import './BrushedMetal.css';

export interface BrushedMetalProps {
  children?: ReactNode;
  className?: string;
  /** 金属颜色（hex） */
  color?: string;
  /** 拉丝方向角度（度），0 为水平 */
  angle?: number;
  /** 动画速度倍率 */
  speed?: number;
  /** 光源是否跟随指针 */
  interactive?: boolean;
}

// 拉丝金属：平整金属板上沿拉丝方向极度拉长的多层噪声构成细密划纹；
// 用 Ward 各向异性反射——沿拉丝方向粗糙度极低、垂直方向很高，
// 使点光源的高光被拉成一道垂直于拉丝方向的宽光柱，并被划纹切分出细碎明暗。
const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uBase;
uniform vec2 uDir;
uniform float uDpr;

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

// q.x 沿拉丝方向、q.y 垂直于拉丝方向，单位为 CSS 像素
float brush(vec2 q) {
  return noise(vec2(q.x * 0.004, q.y * 0.9)) * 0.45
    + noise(vec2(q.x * 0.008 + 13.0, q.y * 0.33)) * 0.35
    + noise(vec2(q.x * 0.002 + 41.0, q.y * 2.1)) * 0.2;
}

// Ward 各向异性高光，T 为拉丝方向
float ward(vec3 L, vec3 T, vec3 B) {
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float hT = dot(H, T) / 0.07;
  float hB = dot(H, B) / 0.45;
  return exp(-(hT * hT + hB * hB) / (H.z * H.z)) * max(L.z, 0.0);
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  float minRes = min(uResolution.x, uResolution.y);
  vec2 uv = frag / minRes;
  float aspect = uResolution.x / minRes;
  float t = uTime;

  vec3 T = vec3(uDir, 0.0);
  vec3 B = vec3(-uDir.y, uDir.x, 0.0);
  vec2 css = frag / uDpr;
  vec2 q = vec2(dot(css, uDir), dot(css, B.xy));

  float s = brush(q);
  // 偶发的深划痕与不均匀的拉丝力度
  float scratch = pow(noise(vec2(q.x * 0.003 + 7.0, q.y * 1.3)), 8.0);
  float patchy = noise(uv * 1.6 + 5.0);

  // 主光跟随指针；辅光在右上方缓慢漂移，保证画面始终有第二道光柱
  vec2 toPtr = uPointer / minRes - uv;
  float key = ward(normalize(vec3(toPtr, 0.6)), T, B) * 2.2 / (1.0 + 1.5 * dot(toPtr, toPtr));
  vec2 toFill = vec2(aspect * (0.78 + 0.08 * sin(t * 0.1)), -0.15) - uv;
  float fill = ward(normalize(vec3(toFill, 0.8)), T, B) * 0.7;
  float spec = key + fill;

  // 环境反射：被拉丝方向模糊的柔和上亮下暗
  float env = mix(0.16, 0.05, smoothstep(-0.1, 1.1, frag.y / uResolution.y));

  vec3 color = uBase * env * (0.85 + 0.3 * s) * (0.9 + 0.2 * patchy);
  color += uBase * spec * (0.55 + 0.9 * s) * (0.85 + 0.3 * patchy);
  color += uBase * scratch * (0.25 * spec + 0.03);

  vec2 vc = frag / uResolution - 0.5;
  color *= 1.0 - dot(vc, vc) * 0.5;
  color = pow(aces(color * 1.1), vec3(1.0 / 2.2));
  color += (hash(frag + fract(t)) - 0.5) / 255.0;

  gl_FragColor = vec4(color, 1.0);
}
`;

export function BrushedMetal({
  children,
  className,
  color = '#c3c7cf',
  angle = 0,
  speed = 1,
  interactive = true,
}: BrushedMetalProps) {
  const canvasRef = useShaderCanvas({
    fragmentShader: FRAGMENT_SHADER,
    speed,
    interactive,
    onDraw: ({ gl, uniform, dpr }) => {
      const radians = (angle * Math.PI) / 180;
      gl.uniform3fv(uniform('uBase'), hexToLinearRgb(color));
      gl.uniform2f(uniform('uDir'), Math.cos(radians), Math.sin(radians));
      gl.uniform1f(uniform('uDpr'), dpr);
    },
  });

  return (
    <div
      className={cn('elyri-brushed-metal', className)}
      style={{ '--elyri-brushed-metal-color': color } as CSSProperties}
    >
      <canvas ref={canvasRef} className="elyri-brushed-metal__canvas" aria-hidden="true" />
      {children != null && <div className="elyri-brushed-metal__content">{children}</div>}
    </div>
  );
}
