import type { CSSProperties, ReactNode } from 'react';

import { cn, hexToLinearRgb, useShaderCanvas } from '../../../core';

import './Planet.css';

export interface PlanetProps {
  children?: ReactNode;
  className?: string;
  /** 地表主色（hex） */
  color?: string;
  /** 暗色地貌的颜色（hex） */
  terrainColor?: string;
  /** 大气散射色（hex），掠射处会透出它的互补色 */
  atmosphereColor?: string;
  /** 大气浓度，0 为无大气 */
  atmosphere?: number;
  /** 陨石坑数量与深度，0 为无陨石坑 */
  craters?: number;
  /** 星空密度，0 为无星星 */
  stars?: number;
  /** 地平线弧顶距容器顶部的比例 */
  horizon?: number;
  /** 动画速度倍率 */
  speed?: number;
  /** 太阳是否跟随指针移动 */
  interactive?: boolean;
}

// 轨道视角的星球：相机悬停在半径为 1 的星球上方，光线求交得到地表，
// 地表由带导数的 3D 噪声叠加多层陨石坑生成起伏与反照率，按像素足迹逐级淡出高频避免闪烁；
// 大气按指数密度做单次散射积分（太阳方向光学厚度用 Chapman 近似），散射系数取自大气色，
// 因此薄处呈大气色、掠射的厚处呈互补色；太阳随指针沿地平线游移，出现在画内时带光晕。
const FRAGMENT_SHADER = `
precision highp float;

#define PI 3.14159265
#define HALF 8

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uSurface;
uniform vec3 uTerrain;
uniform vec3 uAtmosphere;
uniform float uDensity;
uniform float uCraters;
uniform float uStars;
uniform float uHorizon;

const float ALT = 0.15;
const float FL = 1.25;
const float H = 0.0045;
const float RT = 1.0 + 10.0 * H;
const float SUN_I = 5.0;
const float SUN_R = 0.012;
const float BUMP = 0.06;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

vec3 hash33(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
    mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float noise3(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash13(i), hash13(i + vec3(1, 0, 0)), u.x), mix(hash13(i + vec3(0, 1, 0)), hash13(i + vec3(1, 1, 0)), u.x), u.y),
    mix(mix(hash13(i + vec3(0, 0, 1)), hash13(i + vec3(1, 0, 1)), u.x), mix(hash13(i + vec3(0, 1, 1)), hash13(i + vec3(1, 1, 1)), u.x), u.y),
    u.z
  );
}

// 值噪声及其解析梯度：x 为 0-1 的值，yzw 为梯度
vec4 noised(vec3 x) {
  vec3 i = floor(x);
  vec3 w = fract(x);
  vec3 u = w * w * w * (w * (w * 6.0 - 15.0) + 10.0);
  vec3 du = 30.0 * w * w * (w * (w - 2.0) + 1.0);
  float a = hash13(i);
  float b = hash13(i + vec3(1, 0, 0));
  float c = hash13(i + vec3(0, 1, 0));
  float d = hash13(i + vec3(1, 1, 0));
  float e = hash13(i + vec3(0, 0, 1));
  float f = hash13(i + vec3(1, 0, 1));
  float g = hash13(i + vec3(0, 1, 1));
  float h = hash13(i + vec3(1, 1, 1));
  float k1 = b - a;
  float k2 = c - a;
  float k3 = e - a;
  float k4 = a - b - c + d;
  float k5 = a - c - e + g;
  float k6 = a - b - e + f;
  float k7 = -a + b + c - d + e - f - g + h;
  return vec4(
    a + k1 * u.x + k2 * u.y + k3 * u.z + k4 * u.x * u.y + k5 * u.y * u.z + k6 * u.z * u.x + k7 * u.x * u.y * u.z,
    du * vec3(
      k1 + k4 * u.y + k6 * u.z + k7 * u.y * u.z,
      k2 + k5 * u.z + k4 * u.x + k7 * u.z * u.x,
      k3 + k6 * u.x + k5 * u.y + k7 * u.x * u.y
    )
  );
}

// 像素足迹超过噪声周期时淡出该层，远处地表不再闪烁
float lod(float freqTimesFootprint) {
  return 1.0 - smoothstep(0.25, 0.6, freqTimesFootprint);
}

float fbm3(vec3 p, float fp) {
  float s = 0.0;
  float a = 0.5;
  float f = 1.0;
  for (int i = 0; i < 8; i++) {
    float w = lod(f * fp);
    if (w <= 0.0) break;
    s += a * w * (noise3(p * f + float(i) * 7.13) - 0.5);
    a *= 0.55;
    f *= 2.02;
  }
  return s;
}

// 地形高度：带侵蚀感的 fbm（坡度越大后续细节越弱），返回高度与梯度。
// 八度数足够多，让最细一层在近处也只占两三个像素
vec4 terrain(vec3 p, float fp) {
  vec4 s = vec4(0.0);
  vec3 dsum = vec3(0.0);
  float a = 0.5;
  float f = 1.0;
  for (int i = 0; i < 10; i++) {
    float w = lod(f * fp);
    if (w <= 0.0) break;
    vec4 n = noised(p * f + float(i) * vec3(3.1, 7.7, 1.3));
    vec3 g = n.yzw * f;
    dsum += g * a;
    float k = a * w / (1.0 + 0.35 * dot(dsum, dsum));
    s.x += k * (n.x - 0.5);
    s.yzw += k * g;
    a *= 0.5;
    f *= 2.03;
  }
  return s;
}

float craterProfile(float x) {
  return 0.8 * (smoothstep(0.0, 1.0, x) - 1.0) + 0.3 * exp(-10.0 * (x - 1.0) * (x - 1.0));
}

// 一层陨石坑：每个网格至多一个坑且完整落在格内，只需查当前格。
// 累加高度梯度到 grad，返回坑体剖面（坑底为负、坑沿为正）供反照率使用
float craterLayer(vec3 p, float scale, float fp, float seed, inout vec3 grad) {
  vec3 g = p * scale + seed;
  vec3 cell = floor(g);
  vec3 r = hash33(cell + seed);
  if (r.x > 0.75 * uCraters) return 0.0;
  vec3 c = cell + 0.3 + 0.4 * hash33(cell * 1.7 + seed + 11.0);
  float R = mix(0.07, 0.18, r.y * r.y);
  vec3 d = g - c;
  float dist = length(d);
  float x = dist / R;
  if (x > 1.6) return 0.0;
  float w = 1.0 - smoothstep(0.1, 0.4, fp * scale / R);
  float depth = uCraters * mix(0.5, 1.0, r.z) * w;
  float dh = (craterProfile(x + 0.01) - craterProfile(x - 0.01)) / 0.02;
  grad += dh * d / max(dist, 1e-4) * depth * 0.8;
  return craterProfile(x) * w;
}

float chapman(float X, float h, float coschi) {
  float c = sqrt(X + h);
  if (coschi >= 0.0) return c / (c * coschi + 1.0) * exp(-h);
  float x0 = sqrt(1.0 - coschi * coschi) * (X + h);
  return 2.0 * sqrt(x0) * exp(min(X - x0, 40.0)) - c / (1.0 - c * coschi) * exp(-h);
}

vec3 stars(vec3 rd, float pixAngle) {
  vec2 a = vec2(atan(rd.x, -rd.z), asin(clamp(rd.y, -1.0, 1.0)));
  vec3 col = vec3(0.0);
  for (int layer = 0; layer < 2; layer++) {
    float scale = layer == 0 ? 70.0 : 190.0;
    float seed = float(layer) * 17.0;
    vec2 g = a * scale;
    vec2 cell = floor(g);
    if (hash12(cell + seed) > uStars * (layer == 0 ? 0.22 : 0.2)) continue;
    vec2 pos = 0.2 + 0.6 * vec2(hash12(cell + seed + 3.1), hash12(cell + seed + 7.7));
    float px = length(fract(g) - pos) / scale / pixAngle;
    float h = hash12(cell + seed + 5.3);
    float mag = layer == 0 ? 0.05 + 2.0 * pow(h, 8.0) : 0.015 + 0.05 * h;
    float tw = 0.7 + 0.3 * sin(uTime * (0.8 + 2.5 * h) + h * 40.0);
    vec3 tint = mix(vec3(0.62, 0.74, 1.0), vec3(1.0, 0.82, 0.64), hash12(cell + seed + 9.9));
    col += tint * mag * tw * exp(-px * px * 1.4);
  }
  // 极淡的星云尘带，给纯黑的太空一点纵深
  vec2 q = a * vec2(2.2, 3.4);
  float neb = noise2(q) * 0.55 + noise2(q * 2.1 + 4.0) * 0.3 + noise2(q * 4.3 + 9.0) * 0.15;
  float band = exp(-pow((a.y + 0.35 * a.x + 0.05) * 2.6, 2.0));
  col += mix(vec3(0.05, 0.04, 0.12), vec3(0.1, 0.05, 0.07), neb) * smoothstep(0.35, 0.85, neb) * band * 0.12 * uStars;
  return col;
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = (frag - 0.5 * uResolution) / uResolution.y;
  vec2 ptr = uPointer / uResolution;
  float pixAngle = 1.0 / (uResolution.y * FL);

  // 相机：按期望的地平线高度反推俯角，指针带来轻微视差
  float D = 1.0 + ALT;
  float dip = acos(1.0 / D);
  float yaw = (ptr.x - 0.5) * 0.04;
  float pitch = dip + atan((0.5 - uHorizon) / FL) + (ptr.y - 0.5) * 0.015;
  vec3 ro = vec3(0.0, D, 0.0);
  vec3 fw = vec3(sin(yaw) * cos(pitch), -sin(pitch), -cos(yaw) * cos(pitch));
  vec3 right = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, fw);
  vec3 rd = normalize(uv.x * right + uv.y * up + FL * fw);

  // 太阳：默认在左上方画外，随指针沿地平线游移与升降
  float az = -0.85 + (ptr.x - 0.5) * 1.2;
  float el = -0.24 - (ptr.y - 0.5) * 0.3;
  vec3 sun = normalize(vec3(sin(az) * cos(el), sin(el), -cos(az) * cos(el)));

  vec3 beta = uAtmosphere * 7.0 * uDensity + 1e-4;
  float X = 1.0 / H;

  // 与星球求交；边缘按像素距离做解析抗锯齿
  float b = dot(ro, rd);
  float tc = -b;
  float impact = sqrt(max(dot(ro, ro) - b * b, 0.0));
  float coverage = clamp(0.5 - (impact - 1.0) / (tc * pixAngle), 0.0, 1.0);
  float disc = b * b - dot(ro, ro) + 1.0;
  float tPlanet = disc > 0.0 ? -b - sqrt(disc) : tc;

  // 背景：星空 + 太阳圆盘（只在未被星球遮挡的像素）
  float mu = dot(rd, sun);
  float sunAng = sqrt(max(2.0 * (1.0 - mu), 0.0));
  vec3 space = stars(rd, pixAngle);
  space += vec3(1.0, 0.96, 0.9) * 60.0 * smoothstep(SUN_R, SUN_R * 0.75, sunAng);

  vec3 background = space;
  if (coverage > 0.0) {
    vec3 n = normalize(ro + rd * tPlanet);
    float ndv = max(dot(n, -rd), 0.0);
    float fp = tPlanet * pixAngle / max(sqrt(ndv), 0.12);

    // 星球缓慢自转：地表从地平线方向朝观察者流动
    float ang = -uTime * 0.01;
    float cs = cos(ang);
    float sn = sin(ang);
    mat3 spin = mat3(1.0, 0.0, 0.0, 0.0, cs, sn, 0.0, -sn, cs);
    vec3 q = spin * n;

    vec4 ter = terrain(q * 4.0 + 2.0, fp * 4.0);
    vec3 grad = ter.yzw * 4.0 * BUMP;
    float crater = 0.0;
    crater += craterLayer(q, 5.0, fp, 1.3, grad);
    crater += craterLayer(q, 11.0, fp, 7.9, grad);
    crater += craterLayer(q, 23.0, fp, 4.1, grad);
    crater += craterLayer(q, 47.0, fp, 9.6, grad);
    crater += craterLayer(q, 97.0, fp, 5.7, grad);
    crater += craterLayer(q, 199.0, fp, 2.2, grad);
    grad = grad * spin;
    grad -= dot(grad, n) * n;
    vec3 nb = normalize(n - grad);

    // 反照率：大尺度暗区 + 中尺度尘带 + 细碎的岩屑明暗 + 坑底偏暗、坑沿抛射物偏亮
    float big = fbm3(q * 1.7 + 4.0, fp * 1.7);
    float mid = fbm3(q * 9.0 + 1.0, fp * 9.0);
    float fine = fbm3(q * 70.0 + 3.0, fp * 70.0);
    vec3 albedo = mix(uSurface, uTerrain, smoothstep(-0.12, 0.22, big + 0.35 * mid + 0.15 * fine));
    albedo *= 0.8 + 0.7 * (mid + 0.5) * 0.6 + 2.0 * ter.x + 0.5 * fine;
    albedo *= 1.0 + 0.3 * crater;
    albedo = max(albedo, 0.0);

    // 风化层：Lambert 与 Lommel-Seeliger 混合，日面更"平"、更有尘土感
    float ngl = dot(n, sun);
    float mu0 = max(dot(nb, sun), 0.0);
    float lsl = mu0 / (mu0 + ndv + 1e-3);
    float brdf = mix(mu0, lsl, 0.35) * smoothstep(-0.03, 0.08, ngl);
    vec3 sunT = exp(-beta * H * chapman(X, 0.0, ngl));
    vec3 sky = uAtmosphere * uDensity * 0.05 * smoothstep(-0.3, 0.4, ngl);
    vec3 surface = albedo * (SUN_I * 0.9 * sunT * brdf + sky + 0.004);
    background = mix(space, surface, coverage);
  }

  // 大气单次散射：沿视线在大气壳内积分
  vec3 inscatter = vec3(0.0);
  vec3 trans = vec3(1.0);
  float bA = b * b - dot(ro, ro) + RT * RT;
  if (bA > 0.0) {
    float t0 = max(-b - sqrt(bA), 0.0);
    float t1 = mix(-b + sqrt(bA), tPlanet, coverage);
    // 以视线最低点为界分两段，采样点按平方分布向最低点（密度最大处）加密
    float tm = clamp(tc, t0, t1);
    float jitter = fract(52.9829189 * fract(dot(frag, vec2(0.06711056, 0.00583715))));
    float du = 1.0 / float(HALF);
    float od = 0.0;
    vec3 scat = vec3(0.0);
    for (int i = 0; i < 2 * HALF; i++) {
      bool near = i < HALF;
      float u = ((near ? float(HALF - 1 - i) : float(i - HALF)) + jitter) * du;
      float len = near ? tm - t0 : t1 - tm;
      float t = near ? tm - len * u * u : tm + len * u * u;
      vec3 p = ro + rd * t;
      float r = length(p);
      float h = max(r - 1.0, 0.0) / H;
      float dens = exp(-h) * 2.0 * u * len * du;
      float odSun = H * chapman(X, h, dot(p, sun) / r);
      scat += dens * exp(-beta * (od + 0.5 * dens + odSun));
      od += dens;
    }
    trans = exp(-beta * od);
    float g = 0.76;
    float phaseR = 3.0 / (16.0 * PI) * (1.0 + mu * mu);
    float phaseM = (1.0 - g * g) / (4.0 * PI * pow(1.0 + g * g - 2.0 * g * mu, 1.5));
    // 前向散射的尘埃光晕主要留给边缘，地表上方削弱，避免逆光时整片地表被雾化
    inscatter = SUN_I * 7.0 * beta * scat * mix(phaseR, phaseM, 0.4 - 0.25 * coverage);
  }

  vec3 color = inscatter + trans * background;

  // 太阳光晕：随太阳高出星球边缘的程度出现，并被掠射的大气染色
  vec3 toCenter = -normalize(ro);
  float sunCos = dot(sun, toCenter);
  float clearance = acos(clamp(sunCos, -1.0, 1.0)) - asin(1.0 / D);
  float sunImpact = D * sqrt(max(1.0 - sunCos * sunCos, 0.0));
  float hs = max(sunImpact - 1.0, 0.0) / H;
  vec3 sunTrans = sunCos > 0.0 ? exp(-beta * H * 2.0 * sqrt(X + hs) * exp(-hs)) : vec3(1.0);
  float sunVis = smoothstep(-SUN_R, SUN_R * 2.0, clearance);
  vec2 sunUv = vec2(dot(sun, right), dot(sun, up)) / max(dot(sun, fw), 1e-3) * FL;
  vec2 sd = uv - sunUv;
  float glow = 0.9 * exp(-sunAng * 30.0) + 0.1 * exp(-sunAng * 7.0) + 0.015 * exp(-sunAng * 2.0);
  float streak = exp(-abs(sd.y) * 110.0) * exp(-abs(sd.x) * 3.0) * 0.08 * step(0.0, dot(sun, fw));
  color += vec3(1.0, 0.93, 0.85) * sunTrans * sunVis * (glow + streak);

  // 暗角
  color *= 1.0 - 0.35 * dot(uv * vec2(0.6, 1.0), uv * vec2(0.6, 1.0));
  color = pow(aces(color * 0.9), vec3(1.0 / 2.2));
  color += (hash12(frag + fract(uTime)) - 0.5) / 255.0;

  gl_FragColor = vec4(color, 1.0);
}
`;

export function Planet({
  children,
  className,
  color = '#c1532b',
  terrainColor = '#4e1e12',
  atmosphereColor = '#f2a57c',
  atmosphere = 0.6,
  craters = 0.6,
  stars = 0.6,
  horizon = 0.62,
  speed = 1,
  interactive = true,
}: PlanetProps) {
  const canvasRef = useShaderCanvas({
    fragmentShader: FRAGMENT_SHADER,
    speed,
    interactive,
    onDraw: ({ gl, uniform }) => {
      const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
      gl.uniform3fv(uniform('uSurface'), hexToLinearRgb(color));
      gl.uniform3fv(uniform('uTerrain'), hexToLinearRgb(terrainColor));
      gl.uniform3fv(uniform('uAtmosphere'), hexToLinearRgb(atmosphereColor));
      gl.uniform1f(uniform('uDensity'), clamp01(atmosphere));
      gl.uniform1f(uniform('uCraters'), clamp01(craters));
      gl.uniform1f(uniform('uStars'), clamp01(stars));
      gl.uniform1f(uniform('uHorizon'), Math.min(0.95, Math.max(0.05, horizon)));
    },
  });

  return (
    <div
      className={cn('elyri-planet', className)}
      style={
        {
          '--elyri-planet-color': color,
          '--elyri-planet-atmosphere': atmosphereColor,
          '--elyri-planet-horizon': `${horizon * 100}%`,
        } as CSSProperties
      }
    >
      <canvas ref={canvasRef} className="elyri-planet__canvas" aria-hidden="true" />
      {children != null && <div className="elyri-planet__content">{children}</div>}
    </div>
  );
}
