import type { CSSProperties, ReactNode } from 'react';

import { cn, hexToLinearRgb, useColorScheme, useShaderCanvas } from '../../../core';

import './SilkWaves.css';

export interface SilkWavesProps {
  children?: ReactNode;
  className?: string;
  /** 丝绸本体色（hex） */
  color?: string;
  /** 光泽高光色（hex） */
  highlightColor?: string;
  /** 褶皱密度倍率 */
  folds?: number;
  /** 动画速度倍率 */
  speed?: number;
  /** 光源是否跟随指针 */
  interactive?: boolean;
}

// 丝绸：多组正弦波经过域扭曲叠成连续起伏的高度场，
// 用柔和漫反射 + 锐利高光 + 线形灯带反射模拟缎面光泽，褶皱谷底做遮蔽。
const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uBase;
uniform vec3 uHighlight;
uniform float uFolds;
uniform float uScheme;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float silk(vec2 p, float t) {
  vec2 q = p;
  q.x += 0.55 * sin(q.y * 1.3 + t * 0.3);
  q.y += 0.45 * sin(q.x * 1.1 - t * 0.25);
  q.x += 0.2 * sin(q.y * 2.3 - t * 0.2);
  return sin(q.x * 1.6 + q.y * 0.9 + t * 0.2) * 0.5
    + sin(q.x * 0.7 - q.y * 1.9 - t * 0.15) * 0.35
    + sin((q.x + q.y) * 2.7 + t * 0.35) * 0.12;
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  float minRes = min(uResolution.x, uResolution.y);
  vec2 p = frag / minRes * 2.6 * uFolds;
  float t = uTime;

  float e = 0.01;
  float h = silk(p, t);
  vec2 grad = vec2(silk(p + vec2(e, 0.0), t) - silk(p - vec2(e, 0.0), t), silk(p + vec2(0.0, e), t) - silk(p - vec2(0.0, e), t)) / (2.0 * e);
  vec3 n = normalize(vec3(-grad * 0.55, 1.0));

  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 toLight = vec3(uPointer - frag, minRes * 0.7);
  float dist = length(toLight);
  vec3 L = toLight / dist;
  vec3 H = normalize(L + V);
  float atten = 1.0 / (1.0 + 1.2 * pow(dist / minRes, 2.0));
  float NdotL = max(dot(n, L), 0.0);
  float NdotH = max(dot(n, H), 0.0);
  float NdotV = max(n.z, 0.0);
  float fres = pow(1.0 - NdotV, 3.0);

  // 褶皱谷底更暗
  float cavity = mix(0.35, 1.0, smoothstep(-1.0, 0.8, h));

  vec3 color = uBase * (0.015 + 0.45 * NdotL * NdotL * atten) * cavity;
  color += mix(uBase, uHighlight, 0.5) * pow(NdotH, 14.0) * 0.45 * atten * cavity;
  color += uHighlight * pow(NdotH, 90.0) * 1.1 * atten;

  // 线形灯带在褶皱上形成的缎面亮线
  vec3 Rf = reflect(-V, n);
  vec2 toL = (uPointer - frag) / minRes;
  float a = -0.5 + 0.3 * sin(t * 0.13);
  vec2 dir = vec2(cos(a), sin(a));
  float s = dot(Rf.xy, dir) - dot(toL, dir) * 1.1;
  color += uHighlight * (exp(-s * s / 0.004) * 0.9 + exp(-s * s / 0.08) * 0.12) * (0.4 + atten) * cavity;
  color += mix(uBase, uHighlight, 0.3) * fres * 0.25 * cavity;

  vec2 vc = frag / uResolution - 0.5;
  float vig = dot(vc, vc);

  if (uScheme > 0.5) {
    // 浅色：先色调映射，再做亮暗镜像，保留色相 —— 深底亮纹翻转为浅底深纹
    vec3 c = pow(aces(color * 1.1), vec3(1.0 / 2.2));
    float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
    color = clamp(c + (1.0 - 2.0 * lum), 0.0, 1.0) * (1.0 - vig * 0.35);
  } else {
    color *= 1.0 - vig * 1.2;
    color = pow(aces(color * 1.1), vec3(1.0 / 2.2));
  }

  color += (hash(frag + fract(t)) - 0.5) / 255.0;

  gl_FragColor = vec4(color, 1.0);
}
`;

export function SilkWaves({
  children,
  className,
  color = '#9a6424',
  highlightColor = '#ffe3b0',
  folds = 1,
  speed = 1,
  interactive = true,
}: SilkWavesProps) {
  const scheme = useColorScheme();
  const canvasRef = useShaderCanvas({
    fragmentShader: FRAGMENT_SHADER,
    speed,
    interactive,
    onDraw: ({ gl, uniform }) => {
      gl.uniform3fv(uniform('uBase'), hexToLinearRgb(color));
      gl.uniform3fv(uniform('uHighlight'), hexToLinearRgb(highlightColor));
      gl.uniform1f(uniform('uFolds'), Math.max(0.2, folds));
      gl.uniform1f(uniform('uScheme'), scheme === 'light' ? 1 : 0);
    },
  });

  return (
    <div
      className={cn('elyri-silk-waves', className)}
      data-scheme={scheme}
      style={{ '--elyri-silk-waves-color': color } as CSSProperties}
    >
      <canvas ref={canvasRef} className="elyri-silk-waves__canvas" aria-hidden="true" />
      {children != null && <div className="elyri-silk-waves__content">{children}</div>}
    </div>
  );
}
