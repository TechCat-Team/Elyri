import type { CSSProperties, ReactNode } from 'react';

import { cn, hexToLinearRgb, useColorScheme, useShaderCanvas } from '../../../core';

import './DotField.css';

export interface DotFieldProps {
  children?: ReactNode;
  className?: string;
  /** 点的底色（hex） */
  color?: string;
  /** 波峰与指针附近的点所用的强调色（hex） */
  highlightColor?: string;
  /** 点阵间距（CSS 像素） */
  gap?: number;
  /** 动画速度倍率 */
  speed?: number;
  /** 指针附近的点是否被放大、推开 */
  interactive?: boolean;
}

// 呼吸点阵：规整网格上的细点，被两层缓慢漂移的噪声调制大小与亮度，
// 像一阵阵微风掠过；指针处形成一片透镜，点被放大、向外轻推并染上强调色。
// 每个像素检查 3×3 邻格，保证被推开的点不会被格子边界裁掉。
const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uDot;
uniform vec3 uHighlight;
uniform vec3 uBg;
uniform float uGap;
uniform float uDpr;

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

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  float gap = uGap * uDpr;
  float radius = 170.0 * uDpr;
  float t = uTime;
  vec2 cell = floor(frag / gap);

  float best = 0.0;
  float bestTint = 0.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 id = cell + vec2(float(i), float(j));
      vec2 center = (id + 0.5) * gap;

      vec2 away = center - uPointer;
      float d = length(away);
      float lens = exp(-d * d / (radius * radius));
      center += away / max(d, 1.0) * lens * gap * 0.32;

      // 两层噪声：大尺度的「风」+ 小尺度的细碎起伏
      float wave = noise(id * 0.075 + vec2(t * 0.11, -t * 0.07)) * 0.65
        + noise(id * 0.21 - vec2(t * 0.05, t * 0.09)) * 0.35;
      wave = smoothstep(0.3, 0.85, wave);

      float r = max(gap * (0.055 + 0.075 * wave + 0.1 * lens), 0.7 * uDpr);
      float cover = 1.0 - smoothstep(r - 0.8, r + 0.8, length(frag - center));
      float alpha = cover * clamp(0.22 + 0.5 * wave + 0.55 * lens, 0.0, 1.0);
      if (alpha > best) {
        best = alpha;
        bestTint = clamp(wave * wave * 0.55 + lens * 0.95, 0.0, 1.0);
      }
    }
  }

  // 四周渐隐，视线聚焦在中央
  vec2 q = (frag - 0.5 * uResolution) / (0.5 * uResolution);
  float mask = mix(0.18, 1.0, 1.0 - smoothstep(0.3, 1.3, length(q)));

  vec3 dotColor = mix(uDot, uHighlight, bestTint);
  vec3 color = mix(uBg, dotColor, best * mask);

  // 指针下方极淡的光晕
  float glow = exp(-dot(frag - uPointer, frag - uPointer) / (radius * radius * 2.5));
  color += uHighlight * glow * 0.035;

  color = pow(color, vec3(1.0 / 2.2));
  color += (hash(frag + fract(t)) - 0.5) / 255.0;

  gl_FragColor = vec4(color, 1.0);
}
`;

export function DotField({
  children,
  className,
  color = '#8a90a6',
  highlightColor = '#7c6cff',
  gap = 22,
  speed = 1,
  interactive = true,
}: DotFieldProps) {
  const scheme = useColorScheme();
  const canvasRef = useShaderCanvas({
    fragmentShader: FRAGMENT_SHADER,
    speed,
    interactive,
    onDraw: ({ gl, uniform, dpr }) => {
      gl.uniform3fv(uniform('uDot'), hexToLinearRgb(color));
      gl.uniform3fv(uniform('uHighlight'), hexToLinearRgb(highlightColor));
      gl.uniform3fv(uniform('uBg'), hexToLinearRgb(scheme === 'light' ? '#fafafb' : '#0a0a0e'));
      gl.uniform1f(uniform('uGap'), Math.max(8, gap));
      gl.uniform1f(uniform('uDpr'), dpr);
    },
  });

  return (
    <div
      className={cn('elyri-dot-field', className)}
      data-scheme={scheme}
      style={{ '--elyri-dot-field-color': color, '--elyri-dot-field-gap': `${Math.max(8, gap)}px` } as CSSProperties}
    >
      <canvas ref={canvasRef} className="elyri-dot-field__canvas" aria-hidden="true" />
      {children != null && <div className="elyri-dot-field__content">{children}</div>}
    </div>
  );
}
