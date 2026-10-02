import type { CSSProperties, ReactNode } from 'react';

import { cn, hexToLinearRgb, useColorScheme, useShaderCanvas } from '../../../core';

import './MeshGradient.css';

export interface MeshGradientProps {
  children?: ReactNode;
  className?: string;
  /** 自定义内联样式，可用于控制尺寸 */
  style?: CSSProperties;
  /** 四个色团的颜色（hex） */
  colors?: [string, string, string, string];
  /** 胶片颗粒强度，0 为关闭 */
  grain?: number;
  /** 动画速度倍率 */
  speed?: number;
  /** 指针处的色彩漩涡是否跟随指针 */
  interactive?: boolean;
}

const DEFAULT_COLORS: [string, string, string, string] = ['#6e6af0', '#f472b6', '#fbbf77', '#38bdf8'];

// 流光渐变：四个色团沿互不相关的缓慢轨迹漂移，定位坐标先经过两级
// 分形噪声域扭曲（q → r），色团边界被拉成缓缓流淌、相互卷入的彩色丝带；
// 颜色在 Oklab 空间混合（过渡不发灰）。沿流场等值线叠一层缎面光泽，
// 暗部轻微压低，形成丝绸般的起伏与流光。指针处色彩被轻轻卷成漩涡。
const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uBase;
uniform float uGrain;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 toOklab(vec3 c) {
  float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
  float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
  float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
  l = pow(max(l, 0.0), 1.0 / 3.0);
  m = pow(max(m, 0.0), 1.0 / 3.0);
  s = pow(max(s, 0.0), 1.0 / 3.0);
  return vec3(
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
  );
}

vec3 fromOklab(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
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
  mat2 rot = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p + vec2(11.3, 7.9);
    a *= 0.5;
  }
  return v;
}

float blob(vec2 uv, vec2 center) {
  vec2 d = uv - center;
  return exp(-dot(d, d) * 3.2);
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  float minRes = min(uResolution.x, uResolution.y);
  vec2 half_ = 0.5 * uResolution / minRes;
  vec2 uv = (frag - 0.5 * uResolution) / minRes;
  vec2 pointer = (uPointer - 0.5 * uResolution) / minRes;
  float t = uTime * 0.1;

  // 指针漩涡：绕指针旋转采样坐标，越靠近转得越多，色彩被卷进去
  vec2 dm = uv - pointer;
  float swirl = exp(-dot(dm, dm) / 0.07);
  float angle = swirl * 1.1;
  uv = pointer + mat2(cos(angle), sin(angle), -sin(angle), cos(angle)) * dm * (1.0 - swirl * 0.12);

  // 两级域扭曲的流场：q 缓慢漂移，r 在 q 的基础上再扭一次，得到液体般的卷流
  vec2 p = uv * 1.5;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t * 0.8));
  vec2 r = vec2(fbm(p + 2.6 * q + vec2(1.7, 9.2) + t * 1.2), fbm(p + 2.6 * q + vec2(8.3, 2.8) - t));
  vec2 w = uv + (r - 0.5) * 0.9 + (q - 0.5) * 0.3;

  float tb = uTime * 0.12;
  vec2 p0 = half_ * vec2(-0.55 + 0.35 * sin(tb * 0.63), -0.45 + 0.35 * cos(tb * 0.51));
  vec2 p1 = half_ * vec2(0.55 + 0.30 * cos(tb * 0.57 + 1.0), -0.35 + 0.40 * sin(tb * 0.71 + 2.0));
  vec2 p2 = half_ * vec2(0.45 + 0.35 * sin(tb * 0.49 + 3.0), 0.50 + 0.30 * cos(tb * 0.61 + 1.5));
  vec2 p3 = half_ * vec2(-0.50 + 0.35 * cos(tb * 0.67 + 4.0), 0.45 + 0.35 * sin(tb * 0.53 + 0.5));

  float w0 = blob(w, p0);
  float w1 = blob(w, p1);
  float w2 = blob(w, p2);
  float w3 = blob(w, p3);
  float wb = 0.05;

  vec3 lab = (toOklab(uColor0) * w0 + toOklab(uColor1) * w1 + toOklab(uColor2) * w2 + toOklab(uColor3) * w3 + toOklab(uBase) * wb)
    / (w0 + w1 + w2 + w3 + wb);

  // 缎面流光：沿流场等值线的柔和亮带随时间滑过，谷底微暗，带出丝绸般的层次
  float band = sin((r.x * 1.4 - r.y + q.x * 0.6) * 11.0 + t * 3.0);
  float gloss = smoothstep(0.15, 1.0, band);
  lab.x += gloss * gloss * 0.06 - (1.0 - smoothstep(-1.0, 0.1, band)) * 0.025;
  lab.x += swirl * 0.025;
  // 高光处略降饱和，像光打在织物表面
  lab.yz *= 1.0 - gloss * gloss * 0.12;

  vec3 color = pow(clamp(fromOklab(lab), 0.0, 1.0), vec3(1.0 / 2.2));

  // 胶片颗粒 + 抖动，消除大面积渐变的色带
  float n = hash(frag + fract(uTime * 7.31) * 113.0) - 0.5;
  color += n * (uGrain * 0.07 + 1.0 / 255.0);

  gl_FragColor = vec4(color, 1.0);
}
`;

export function MeshGradient({
  children,
  className,
  style,
  colors = DEFAULT_COLORS,
  grain = 0.35,
  speed = 1,
  interactive = true,
}: MeshGradientProps) {
  const scheme = useColorScheme();
  const [c0 = DEFAULT_COLORS[0], c1 = DEFAULT_COLORS[1], c2 = DEFAULT_COLORS[2], c3 = DEFAULT_COLORS[3]] = colors;
  const canvasRef = useShaderCanvas({
    fragmentShader: FRAGMENT_SHADER,
    speed,
    interactive,
    onDraw: ({ gl, uniform }) => {
      gl.uniform3fv(uniform('uColor0'), hexToLinearRgb(c0));
      gl.uniform3fv(uniform('uColor1'), hexToLinearRgb(c1));
      gl.uniform3fv(uniform('uColor2'), hexToLinearRgb(c2));
      gl.uniform3fv(uniform('uColor3'), hexToLinearRgb(c3));
      gl.uniform3fv(uniform('uBase'), hexToLinearRgb(scheme === 'light' ? '#f7f7fa' : '#0b0b12'));
      gl.uniform1f(uniform('uGrain'), Math.max(0, grain));
    },
  });

  return (
    <div
      className={cn('elyri-mesh-gradient', className)}
      data-scheme={scheme}
      style={
        {
          '--elyri-mesh-gradient-c0': c0,
          '--elyri-mesh-gradient-c1': c1,
          '--elyri-mesh-gradient-c2': c2,
          '--elyri-mesh-gradient-c3': c3,
          ...style,
        } as CSSProperties
      }
    >
      <canvas ref={canvasRef} className="elyri-mesh-gradient__canvas" aria-hidden="true" />
      {children != null && <div className="elyri-mesh-gradient__content">{children}</div>}
    </div>
  );
}
