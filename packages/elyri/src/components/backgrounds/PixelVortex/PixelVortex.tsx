import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { cn, hexToLinearRgb, useColorScheme, useShaderCanvas } from '../../../core';

import './PixelVortex.css';

export interface PixelVortexProps {
  children?: ReactNode;
  className?: string;
  /**
   * 在 LED 屏上播放的视频地址。跨域视频需服务端允许 CORS；服务端还需支持 Range 请求，
   * 否则大视频会整段下载而无法边下边播。未提供或加载失败时显示火焰流动效果。
   */
  videoSrc?: string;
  /** 火焰主色（hex） */
  color?: string;
  /** 最亮处的高光色（hex） */
  highlightColor?: string;
  /** 单颗灯珠尺寸（CSS 像素） */
  cellSize?: number;
  /** 是否显示拼接屏接缝（每 16×10 颗灯珠一块） */
  seams?: boolean;
  /** 接缝宽度（CSS 像素） */
  seamWidth?: number;
  /** 动画速度倍率 */
  speed?: number;
  /** 光晕中心是否跟随指针 */
  interactive?: boolean;
}

// LED 屏：按灯珠网格对画面降采样，每颗灯珠带亮度抖动与色阶量化，再叠加灯珠间隙与可选的拼接缝。
// 画面来源为视频（cover 方式铺满），没有视频时为缓慢流动的火焰，亮区跟随指针；浅色主题下底板为浅色。
const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uColor;
uniform vec3 uHighlight;
uniform float uCell;
uniform float uFollow;
uniform sampler2D uVideo;
uniform float uHasVideo;
uniform vec2 uVideoSize;
uniform float uScheme;
uniform float uSeam;

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

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

// 火焰热度场：域扭曲的噪声缓慢上升，靠近焦点处更亮
float heat(vec2 p, vec2 focus, float t) {
  vec2 q = vec2(
    fbm(p * 1.4 + vec2(0.0, t * 0.18)),
    fbm(p * 1.4 + vec2(5.2, 1.3) - t * 0.12)
  );
  float n = fbm(p * 2.0 + q * 1.7 + vec2(0.0, t * 0.3));
  vec2 d = p - focus;
  float glow = exp(-dot(d, d) * 1.6);
  return n * n * 1.8 * (0.3 + 0.9 * glow);
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  float cell = max(uCell, 2.0);
  float minRes = min(uResolution.x, uResolution.y);
  float t = uTime;

  // 以灯珠中心采样，整颗灯珠同色
  vec2 id = floor(frag / cell);
  vec2 center = (id + 0.5) * cell;
  vec2 vc = frag / uResolution - 0.5;
  float grain = (0.86 + 0.2 * hash(id)) * (0.95 + 0.1 * hash(id + floor(t * 10.0) * vec2(7.13, 3.71)));
  vec3 color;

  if (uHasVideo > 0.5) {
    // cover 铺满：按宽高比裁切视频
    vec2 uv = center / uResolution - 0.5;
    float screenAspect = uResolution.x / uResolution.y;
    float videoAspect = uVideoSize.x / max(uVideoSize.y, 1.0);
    if (screenAspect > videoAspect) uv.y *= videoAspect / screenAspect;
    else uv.x *= screenAspect / videoAspect;
    color = texture2D(uVideo, uv + 0.5).rgb * grain * 1.1;
    // 深色压暗四角，浅色提亮四角
    color = mix(color * (1.0 - dot(vc, vc) * 0.6), mix(color, vec3(1.0), dot(vc, vc) * 0.8), uScheme);
  } else {
    vec2 p = (center - 0.5 * uResolution) / minRes;
    vec2 focus = mix(vec2(0.0, 0.1), (uPointer - 0.5 * uResolution) / minRes, 0.5 * uFollow);
    float h = heat(p, focus, t) * grain;
    color = uColor * h * 1.3 + uHighlight * pow(max(h - 0.55, 0.0), 2.0) * 2.2;
    color += uColor * 0.012;
    color *= 1.0 - dot(vc, vc) * 0.9;
    color = pow(aces(color), vec3(1.0 / 2.2));
    if (uScheme > 0.5) {
      // 浅色：亮暗镜像并保留色相 —— 深底亮焰翻转为浅底深焰
      float lum = dot(color, vec3(0.2126, 0.7152, 0.0722));
      color = clamp(color + (1.0 - 2.0 * lum), 0.0, 1.0);
    }
  }

  // 色阶量化，模拟 LED 驱动的有限灰度
  color = floor(color * 14.0 + hash(id + 3.1)) / 14.0;

  // 灯珠形状：方形发光点；间隙深色时保留少许漏光，浅色时为浅灰底板
  vec2 f = fract(frag / cell) - 0.5;
  float d = max(abs(f.x), abs(f.y));
  vec3 gap = mix(color * 0.2, mix(color, vec3(0.96), 0.7), uScheme);
  color = mix(gap, color, smoothstep(0.5, 0.28, d));

  // 拼接屏接缝：每 16×10 颗灯珠一块，接缝 + 缝下方的阴影
  if (uSeam > 0.0) {
    vec2 pp = mod(frag, vec2(16.0, 10.0) * cell);
    float seam = max(1.0 - smoothstep(uSeam - 1.0, uSeam + 1.0, pp.x), 1.0 - smoothstep(uSeam - 1.0, uSeam + 1.0, pp.y));
    float shade = max(1.0 - smoothstep(uSeam, uSeam + cell * 1.5, pp.x), 1.0 - smoothstep(uSeam, uSeam + cell * 1.5, pp.y));
    color *= 1.0 - mix(0.45, 0.15, uScheme) * shade;
    vec3 seamColor = mix(vec3(0.018, 0.016, 0.015), vec3(0.86, 0.855, 0.85), uScheme) + color * 0.06;
    color = mix(color, seamColor, seam);
  }

  gl_FragColor = vec4(color, 1.0);
}
`;

export function PixelVortex({
  children,
  className,
  videoSrc,
  color = '#ff4d12',
  highlightColor = '#ffd9b0',
  cellSize = 4,
  seams = false,
  seamWidth = 5,
  speed = 1,
  interactive = true,
}: PixelVortexProps) {
  const scheme = useColorScheme();
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  // 一旦出过帧就锁定为「有视频」：大视频中途缓冲时保留上一帧，不回退到火焰
  const [videoReady, setVideoReady] = useState(false);
  const textureRef = useRef<{ gl: WebGLRenderingContext; texture: WebGLTexture | null } | null>(null);

  // 视频不挂到 DOM 中，仅作为纹理来源；可以播放后才切换到视频画面。
  // 大视频依赖服务端支持 Range 请求做流式播放：边下边播，只缓冲播放位置附近的数据。
  useEffect(() => {
    if (!videoSrc) return;
    const el = document.createElement('video');
    el.crossOrigin = 'anonymous';
    el.muted = true;
    el.loop = true;
    el.playsInline = true;
    el.preload = 'auto';

    let disposed = false;
    const tryPlay = () => {
      // 页面不可见时暂停，避免大视频在后台持续缓冲
      if (disposed || document.hidden) return;
      el.play().catch(() => {});
    };
    const handleReady = () => {
      if (disposed) return;
      setVideo(el);
      setVideoReady(true);
    };
    const handleError = () => {
      if (disposed) return;
      setVideoReady(false);
      setVideo(null);
    };
    // 大视频会周期性卡顿而暂停，恢复可播/可见时继续自动播放
    const handlePause = () => tryPlay();
    const handleVisibility = () => {
      if (document.hidden) el.pause();
      else tryPlay();
    };

    el.addEventListener('loadeddata', handleReady);
    el.addEventListener('canplay', handleReady);
    el.addEventListener('error', handleError);
    el.addEventListener('pause', handlePause);
    document.addEventListener('visibilitychange', handleVisibility);
    el.src = videoSrc;
    tryPlay();

    return () => {
      disposed = true;
      el.removeEventListener('loadeddata', handleReady);
      el.removeEventListener('canplay', handleReady);
      el.removeEventListener('error', handleError);
      el.removeEventListener('pause', handlePause);
      document.removeEventListener('visibilitychange', handleVisibility);
      el.pause();
      el.removeAttribute('src');
      el.load();
      setVideoReady(false);
      setVideo(null);
    };
  }, [videoSrc]);

  const canvasRef = useShaderCanvas({
    fragmentShader: FRAGMENT_SHADER,
    speed,
    interactive,
    onDraw: ({ gl, uniform, dpr }) => {
      gl.uniform3fv(uniform('uColor'), hexToLinearRgb(color));
      gl.uniform3fv(uniform('uHighlight'), hexToLinearRgb(highlightColor));
      gl.uniform1f(uniform('uCell'), Math.max(2, cellSize) * dpr);
      gl.uniform1f(uniform('uFollow'), interactive ? 1 : 0);
      gl.uniform1f(uniform('uScheme'), scheme === 'light' ? 1 : 0);
      gl.uniform1f(uniform('uSeam'), seams ? Math.max(0.5, seamWidth) * dpr : 0);

      // 用锁定状态判断是否已切到视频；缓冲中 readyState 会掉，但画面保留上一帧
      const hasVideo = video != null && videoReady;
      gl.uniform1f(uniform('uHasVideo'), hasVideo ? 1 : 0);
      if (!hasVideo || !video) return;

      if (textureRef.current?.gl !== gl) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        textureRef.current = { gl, texture };
      }
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textureRef.current.texture);
      // 只在拿到当前帧时上传；缓冲中沿用上一帧纹理
      if (video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
      }
      gl.uniform1i(uniform('uVideo'), 0);
      gl.uniform2f(uniform('uVideoSize'), video.videoWidth, video.videoHeight);
    },
  });

  return (
    <div
      className={cn('elyri-pixel-vortex', className)}
      data-scheme={scheme}
      style={{ '--elyri-pixel-vortex-color': color } as CSSProperties}
    >
      <canvas ref={canvasRef} className="elyri-pixel-vortex__canvas" aria-hidden="true" />
      {children != null && <div className="elyri-pixel-vortex__content">{children}</div>}
    </div>
  );
}
