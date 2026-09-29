import type { CSSProperties, ReactNode } from 'react';

import { cn, hexToLinearRgb, useColorScheme, useShaderCanvas } from '../../../core';

import './Filaments.css';

export interface FilamentsProps {
  children?: ReactNode;
  className?: string;
  /** 光丝主色（hex） */
  color?: string;
  /** 沿光丝渐变的第二种颜色（hex） */
  highlightColor?: string;
  /** 光丝振幅倍率 */
  amplitude?: number;
  /** 动画速度倍率 */
  speed?: number;
  /** 指针处的光丝是否被拨动、弯向指针 */
  interactive?: boolean;
}

// 光丝：七根发丝般的光线沿水平方向交织成一束缓慢起伏的波形，像被轻拨的琴弦；
// 每根的振幅、频率与相位各不相同，光脉冲沿线流过，颜色沿横向在两色之间渐变。
// 用解析曲线求有符号距离并按斜率修正，线宽处处一致；RGB 轻微错位带出色散边。
const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uColor;
uniform vec3 uHighlight;
uniform vec3 uBg;
uniform float uAmplitude;
uniform float uDpr;
uniform float uScheme;

const int COUNT = 7;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 shade(vec3 bg, vec3 light) {
  if (uScheme > 0.5) {
    float amount = max(max(light.r, light.g), light.b);
    vec3 tint = light / max(amount, 1e-4);
    return bg * exp(-amount * 1.4 * (1.0 - tint * 0.82));
  }
  return bg + 1.0 - exp(-light);
}

float glow(float d, float w) {
  return exp(-d * d / (w * w)) + 0.22 * exp(-abs(d) / (w * 5.0)) + 0.035 * exp(-abs(d) / 0.05);
}

float threadY(float x, float fi, float t, vec2 m) {
  float ph = fi * 1.7;
  float env = exp(-x * x * 1.1);
  float pluck = exp(-pow((x - m.x) / 0.35, 2.0));
  float amp = (0.05 + 0.09 * pow(sin(fi * 1.3 + 0.5), 2.0)) * uAmplitude + pluck * 0.05;
  return env * (amp * sin(x * (2.1 + fi * 0.09) + t * (1.0 + 0.12 * fi) + ph) + 0.028 * uAmplitude * sin(x * 4.3 - t * 0.7 + ph * 2.0))
    + m.y * 0.22 * pluck;
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  float minRes = min(uResolution.x, uResolution.y);
  vec2 uv = (frag - 0.5 * uResolution) / minRes;
  vec2 m = (uPointer - 0.5 * uResolution) / minRes;
  float t = uTime * 0.35;
  float hx = 0.5 * uResolution.x / minRes;

  float w = 0.9 * uDpr / minRes;
  float shift = 1.6 * uDpr / minRes;
  float e = 0.002;
  float fade = smoothstep(hx * 1.02, hx * 0.3, abs(uv.x));

  vec3 light = vec3(0.0);
  for (int i = 0; i < COUNT; i++) {
    float fi = float(i);
    float y = threadY(uv.x, fi, t, m);
    float dy = (threadY(uv.x + e, fi, t, m) - y) / e;
    float s = (uv.y - y) / sqrt(1.0 + dy * dy);

    float ph = fi * 1.7;
    float pulse = pow(0.5 + 0.5 * sin(uv.x * 1.6 - t * 1.4 + ph * 2.3), 6.0);
    float energy = (0.22 + 1.1 * pulse) * fade * (0.6 + 0.4 * sin(fi * 2.1 + 1.0) * sin(fi * 2.1 + 1.0));
    vec3 tint = mix(uColor, uHighlight, 0.5 + 0.5 * sin(uv.x * 1.2 + ph + t * 0.3));

    vec3 g = vec3(glow(s - shift, w), glow(s, w), glow(s + shift, w));
    light += tint * g * energy;
  }

  vec3 color = pow(clamp(shade(uBg, light), 0.0, 1.0), vec3(1.0 / 2.2));
  color += (hash(frag + fract(t)) - 0.5) / 255.0;

  gl_FragColor = vec4(color, 1.0);
}
`;

export function Filaments({
  children,
  className,
  color = '#5b8cff',
  highlightColor = '#d46bff',
  amplitude = 1,
  speed = 1,
  interactive = true,
}: FilamentsProps) {
  const scheme = useColorScheme();
  const canvasRef = useShaderCanvas({
    fragmentShader: FRAGMENT_SHADER,
    speed,
    interactive,
    onDraw: ({ gl, uniform, dpr }) => {
      gl.uniform3fv(uniform('uColor'), hexToLinearRgb(color));
      gl.uniform3fv(uniform('uHighlight'), hexToLinearRgb(highlightColor));
      gl.uniform3fv(uniform('uBg'), hexToLinearRgb(scheme === 'light' ? '#f7f7fa' : '#06060a'));
      gl.uniform1f(uniform('uAmplitude'), Math.max(0, amplitude));
      gl.uniform1f(uniform('uDpr'), dpr);
      gl.uniform1f(uniform('uScheme'), scheme === 'light' ? 1 : 0);
    },
  });

  return (
    <div
      className={cn('elyri-filaments', className)}
      data-scheme={scheme}
      style={{ '--elyri-filaments-color': color } as CSSProperties}
    >
      <canvas ref={canvasRef} className="elyri-filaments__canvas" aria-hidden="true" />
      {children != null && <div className="elyri-filaments__content">{children}</div>}
    </div>
  );
}
