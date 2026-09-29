import type { CSSProperties, ReactNode } from 'react';

import { cn, hexToLinearRgb, useColorScheme, useShaderCanvas } from '../../../core';

import './Contours.css';

export interface ContoursProps {
  children?: ReactNode;
  className?: string;
  /** 等高线颜色（hex） */
  color?: string;
  /** 指针附近等高线的强调色（hex） */
  highlightColor?: string;
  /** 等高线密度倍率 */
  density?: number;
  /** 动画速度倍率 */
  speed?: number;
  /** 指针处是否隆起一座小山 */
  interactive?: boolean;
}

// 等高线：域扭曲的分形噪声作为缓慢演化的地形，按固定高程间隔取等值线。
// 用有限差分求像素级梯度，把「到最近等值线的高程差」换算成像素距离，
// 从而得到处处等宽、抗锯齿的细线；每五条加粗一条计曲线，线过密处自动淡出防摩尔纹。
const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uLine;
uniform vec3 uHighlight;
uniform vec3 uBg;
uniform float uLevels;
uniform float uDpr;

const float SCALE = 2.4;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = rot * p * 2.03 + 17.1;
    a *= 0.5;
  }
  return v;
}

float terrain(vec2 p, vec2 hill, float t) {
  vec2 warp = vec2(noise(p * 0.55 + vec2(t * 0.08, 3.1)), noise(p * 0.55 + vec2(7.7, -t * 0.07)));
  float h = fbm(p + warp * 1.3 + vec2(t * 0.035, -t * 0.025));
  vec2 d = p - hill;
  return h + 0.2 * exp(-dot(d, d) * 1.6);
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  float minRes = min(uResolution.x, uResolution.y);
  float px = SCALE / minRes;
  vec2 p = frag * px;
  vec2 hill = uPointer * px;
  float t = uTime;

  float h = terrain(p, hill, t);
  float hx = terrain(p + vec2(px, 0.0), hill, t);
  float hy = terrain(p + vec2(0.0, px), hill, t);

  float f = h * uLevels;
  float slope = max(length(vec2(hx - h, hy - h)) * uLevels, 1e-5);
  float fr = fract(f);
  float dist = min(fr, 1.0 - fr) / slope;

  float index = floor(f + 0.5);
  float major = 1.0 - step(0.5, abs(mod(index, 5.0)));
  float halfWidth = mix(0.5, 0.95, major) * uDpr;
  float line = 1.0 - smoothstep(halfWidth - 0.6, halfWidth + 0.6, dist);

  // 线间距小于数像素时淡出，避免陡坡处糊成一片
  line *= smoothstep(2.5 * uDpr, 6.0 * uDpr, 1.0 / slope);

  float radius = 240.0 * uDpr;
  vec2 dp = frag - uPointer;
  float near = exp(-dot(dp, dp) / (radius * radius));

  vec2 q = (frag - 0.5 * uResolution) / (0.5 * uResolution);
  float mask = mix(0.4, 1.0, 1.0 - smoothstep(0.45, 1.4, length(q)));

  float alpha = line * mix(0.32, 0.7, major) * (1.0 + 0.9 * near) * mask;
  vec3 lineColor = mix(uLine, uHighlight, clamp(near * 1.2, 0.0, 1.0));
  vec3 color = mix(uBg, lineColor, clamp(alpha, 0.0, 1.0));

  color = pow(color, vec3(1.0 / 2.2));
  color += (hash(frag + fract(t)) - 0.5) / 255.0;

  gl_FragColor = vec4(color, 1.0);
}
`;

export function Contours({
  children,
  className,
  color = '#8a90a6',
  highlightColor = '#f08a4b',
  density = 1,
  speed = 1,
  interactive = true,
}: ContoursProps) {
  const scheme = useColorScheme();
  const canvasRef = useShaderCanvas({
    fragmentShader: FRAGMENT_SHADER,
    speed,
    interactive,
    onDraw: ({ gl, uniform, dpr }) => {
      gl.uniform3fv(uniform('uLine'), hexToLinearRgb(color));
      gl.uniform3fv(uniform('uHighlight'), hexToLinearRgb(highlightColor));
      gl.uniform3fv(uniform('uBg'), hexToLinearRgb(scheme === 'light' ? '#f9f9f7' : '#0a0b0f'));
      gl.uniform1f(uniform('uLevels'), 18 * Math.max(0.2, density));
      gl.uniform1f(uniform('uDpr'), dpr);
    },
  });

  return (
    <div
      className={cn('elyri-contours', className)}
      data-scheme={scheme}
      style={{ '--elyri-contours-color': color } as CSSProperties}
    >
      <canvas ref={canvasRef} className="elyri-contours__canvas" aria-hidden="true" />
      {children != null && <div className="elyri-contours__content">{children}</div>}
    </div>
  );
}
