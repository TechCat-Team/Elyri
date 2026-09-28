import type { CSSProperties, ReactNode } from 'react';

import { cn, hexToLinearRgb, useShaderCanvas } from '../../../core';

import './MorphGrid.css';

export interface MorphGridProps {
  children?: ReactNode;
  className?: string;
  /** 底色（hex） */
  color?: string;
  /** 图形颜色（hex） */
  shapeColor?: string;
  /** 随机点亮的高亮色（hex） */
  accentColor?: string;
  /** 短边方向上的格子数，越大图形越密 */
  density?: number;
  /** 透镜放大强度，0 为关闭 */
  warp?: number;
  /** 形变由中心向外扩散的延迟（0-0.6），0 为全屏同时切换 */
  spread?: number;
  /** 被点亮格子的比例（0-1） */
  accent?: number;
  /** 动画速度倍率 */
  speed?: number;
  /** 透镜中心是否跟随指针 */
  interactive?: boolean;
}

// 形变网格：全屏图形在 圆形 → 方形 → 十字 → 圆形 之间循环，每种形态停留片刻后丝滑过渡。
// 过渡对相邻两种形态的 SDF 插值，并同时旋转 90°（三种形态都是四重对称，首尾无跳变）；
// 切换以波的形式从透镜中心向外扩散。少量格子随机点亮为高亮色并淡入淡出。
const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uColor;
uniform vec3 uShape;
uniform vec3 uAccent;
uniform float uDensity;
uniform float uWarp;
uniform float uSpread;
uniform float uAccentRatio;
uniform float uFollow;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

// 0 圆形，1 圆角方形，2 十字；尺寸按视觉面积大致对齐，过渡时不忽大忽小
float shapeOf(float i, vec2 f) {
  if (i < 0.5) return length(f) - 0.27;
  if (i < 1.5) return sdBox(f, vec2(0.2)) - 0.05;
  return min(sdBox(f, vec2(0.3, 0.1)), sdBox(f, vec2(0.1, 0.3))) - 0.03;
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  float minRes = min(uResolution.x, uResolution.y);
  float t = uTime;

  // 透镜中心只部分跟随指针，避免被拖到边缘
  vec2 base = (frag - 0.5 * uResolution) / minRes;
  vec2 focus = (uPointer - 0.5 * uResolution) / minRes * 0.7 * uFollow;
  vec2 p = base - focus;

  // 透镜：中心放大、四周相对压缩
  float lens = 1.0 - uWarp * 0.4 * exp(-dot(p, p) * 2.5);
  vec2 g = (focus + p * lens) * uDensity;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float dc = length((id + 0.5) / uDensity - focus);

  // 形态循环：每段先停留 60%，后 40% 过渡到下一形态；越远离中心越晚切换。
  // 起点整体前移 uSpread，使 t = 0 时全屏都处于圆形停留段；uSpread 不超过停留段长度，
  // 所以每轮都有全屏同为一种形态的时刻
  float k = mod(t * 0.3 + uSpread * (1.0 - dc), 3.0);
  float stage = floor(k);
  float e = smoothstep(0.6, 1.0, fract(k));
  f = rot(e * 1.5707963) * f;
  float d = mix(shapeOf(stage, f), shapeOf(mod(stage + 1.0, 3.0), f), e);

  float aa = 1.5 * uDensity * lens / minRes;
  float fill = 1.0 - smoothstep(-aa, aa, d);

  // 每格独立的节拍：每个周期随机决定是否点亮，并淡入淡出
  float phase = t * 0.35 + hash(id + 7.3) * 10.0;
  float slot = floor(phase);
  float pick = step(hash(id + slot * vec2(1.7, 9.2)), uAccentRatio);
  float lit = pick * smoothstep(0.0, 0.15, fract(phase)) * smoothstep(1.0, 0.85, fract(phase));

  vec3 color = mix(uColor, mix(uShape, uAccent, lit), fill);
  vec2 vc = frag / uResolution - 0.5;
  color *= 1.0 - dot(vc, vc) * 0.45;

  gl_FragColor = vec4(pow(color, vec3(1.0 / 2.2)), 1.0);
}
`;

export function MorphGrid({
  children,
  className,
  color = '#141233',
  shapeColor = '#6ee7d8',
  accentColor = '#ff8fb1',
  density = 8,
  warp = 0,
  spread = 0.4,
  accent = 0.03,
  speed = 1,
  interactive = true,
}: MorphGridProps) {
  const canvasRef = useShaderCanvas({
    fragmentShader: FRAGMENT_SHADER,
    speed,
    interactive,
    // 减弱动态效果时停在全屏圆形
    stillTime: 0,
    onDraw: ({ gl, uniform }) => {
      gl.uniform3fv(uniform('uColor'), hexToLinearRgb(color));
      gl.uniform3fv(uniform('uShape'), hexToLinearRgb(shapeColor));
      gl.uniform3fv(uniform('uAccent'), hexToLinearRgb(accentColor));
      gl.uniform1f(uniform('uDensity'), Math.max(2, density));
      gl.uniform1f(uniform('uWarp'), Math.max(0, warp));
      gl.uniform1f(uniform('uSpread'), Math.min(0.6, Math.max(0, spread)));
      gl.uniform1f(uniform('uAccentRatio'), Math.min(1, Math.max(0, accent)));
      gl.uniform1f(uniform('uFollow'), interactive ? 1 : 0);
    },
  });

  return (
    <div className={cn('elyri-morph-grid', className)} style={{ '--elyri-morph-grid-color': color } as CSSProperties}>
      <canvas ref={canvasRef} className="elyri-morph-grid__canvas" aria-hidden="true" />
      {children != null && <div className="elyri-morph-grid__content">{children}</div>}
    </div>
  );
}
