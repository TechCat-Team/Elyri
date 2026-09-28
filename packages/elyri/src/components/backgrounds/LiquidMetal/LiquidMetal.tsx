import type { CSSProperties, ReactNode } from 'react';

import { cn, hexToLinearRgb, useShaderCanvas } from '../../../core';

import './LiquidMetal.css';

export interface LiquidMetalProps {
  children?: ReactNode;
  className?: string;
  /** 金属基色（hex） */
  color?: string;
  /** 彩虹薄膜强度，0 为纯金属 */
  iridescence?: number;
  /** 起伏尺度倍率，越大纹理越密 */
  scale?: number;
  /** 动画速度倍率 */
  speed?: number;
  /** 指针处液面是否鼓起 */
  interactive?: boolean;
}

// 液态金属：一次轻度 domain warp 的 fbm 作为高度场、整体缓慢漂移，差分求法线后反射一个程序化的
// 摄影棚环境（顶部柔光箱 + 地平线亮线 + 侧灯条），得到铬面般的锐利高光；
// 再按菲涅尔角叠加薄膜干涉的彩虹色，指针处液面鼓起并跟随一盏点光。
const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uBase;
uniform float uIridescence;
uniform float uScale;
uniform float uPress;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

const mat2 ROT = mat2(0.8, -0.6, 0.6, 0.8);

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = ROT * p * 2.03 + 11.7;
    a *= 0.42;
  }
  return v;
}

float surface(vec2 uv, float t) {
  // 整体朝一个方向缓慢漂移，扭曲场只做轻微、同向的演化，避免"沸腾"感
  vec2 p = uv * 1.3 * uScale + vec2(t * 0.035, t * 0.02);
  vec2 q = vec2(fbm(p + vec2(0.0, t * 0.04)), fbm(p + vec2(5.2, 1.3) + t * 0.03));
  return fbm(p + 1.1 * q);
}

// 指针处柔和鼓起
float bulge(vec2 uv, vec2 ptr) {
  vec2 d = uv - ptr;
  return uPress * 0.22 * exp(-dot(d, d) * 18.0);
}

// 程序化摄影棚环境，只输出亮度，颜色由金属基色决定
float studio(vec3 r) {
  float e = -r.y * 0.85 + r.x * 0.3;
  float sky = smoothstep(-0.9, 0.9, e);
  float c = mix(0.012, 0.2, sky * sky);
  c += smoothstep(0.2, 0.4, e) * smoothstep(0.85, 0.6, e) * 1.7;
  c += exp(-abs(e + 0.2) * 14.0) * 0.6;
  float side = r.x * 0.9 + r.y * 0.25;
  c += smoothstep(0.45, 0.7, side) * smoothstep(1.0, 0.78, side) * 0.5;
  return c;
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  float minRes = min(uResolution.x, uResolution.y);
  vec2 uv = frag / minRes;
  vec2 ptr = uPointer / minRes;
  float t = uTime;

  float eps = 0.002;
  vec2 ex = vec2(eps, 0.0);
  vec2 ey = vec2(0.0, eps);
  float s = surface(uv, t);
  float b = bulge(uv, ptr);
  // 噪声坡度随 uScale 线性变化，除回去让任意尺度下反射对比度一致
  vec2 grad = vec2(s - surface(uv + ex, t), s - surface(uv + ey, t)) / (eps * uScale)
    + vec2(b - bulge(uv + ex, ptr), b - bulge(uv + ey, ptr)) / eps;
  vec3 n = normalize(vec3(grad * 0.34, 1.0));
  float h = s + b;

  // 正交俯视，视线沿 -z
  vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);
  float fres = smoothstep(0.0, 0.4, 1.0 - n.z);

  // 薄膜干涉：厚度随高度与倾角变化
  float phase = h * 2.4 + fres * 1.3 + t * 0.03;
  vec3 film = 0.5 + 0.5 * cos(6.28318 * (phase + vec3(0.0, 0.33, 0.67)));
  film *= film;
  vec3 tint = mix(uBase, film * 1.3, uIridescence * (0.2 + 0.8 * fres));

  vec3 color = studio(r) * tint;

  // 跟随指针的点光高光
  vec3 L = normalize(vec3(ptr - uv, 0.45));
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(n, H), 0.0), 60.0);
  color += spec * mix(vec3(1.0), tint, 0.35) * 1.2;

  // 低处更暗，模拟凹陷的遮蔽
  color *= mix(0.4, 1.0, smoothstep(0.15, 0.8, h));

  vec2 vc = frag / uResolution - 0.5;
  color *= 1.0 - dot(vc, vc) * 1.2;
  color = pow(aces(color * 1.15), vec3(1.0 / 2.2));
  color += (hash(frag + fract(t)) - 0.5) / 255.0;

  gl_FragColor = vec4(color, 1.0);
}
`;

export function LiquidMetal({
  children,
  className,
  color = '#c9ced6',
  iridescence = 0.6,
  scale = 1,
  speed = 1,
  interactive = true,
}: LiquidMetalProps) {
  const canvasRef = useShaderCanvas({
    fragmentShader: FRAGMENT_SHADER,
    speed,
    interactive,
    onDraw: ({ gl, uniform }) => {
      gl.uniform3fv(uniform('uBase'), hexToLinearRgb(color));
      gl.uniform1f(uniform('uIridescence'), Math.min(1, Math.max(0, iridescence)));
      gl.uniform1f(uniform('uScale'), Math.max(0.2, scale));
      gl.uniform1f(uniform('uPress'), interactive ? 1 : 0);
    },
  });

  return (
    <div
      className={cn('elyri-liquid-metal', className)}
      style={{ '--elyri-liquid-metal-color': color } as CSSProperties}
    >
      <canvas ref={canvasRef} className="elyri-liquid-metal__canvas" aria-hidden="true" />
      {children != null && <div className="elyri-liquid-metal__content">{children}</div>}
    </div>
  );
}
