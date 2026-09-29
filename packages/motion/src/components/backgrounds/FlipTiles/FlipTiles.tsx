import type { CSSProperties, ReactNode } from 'react';

import { cn, hexToLinearRgb, useColorScheme, useShaderCanvas } from '../../../core';

import './FlipTiles.css';

export type FlipTilesPattern = 'wave' | 'ripple' | 'drift';

export interface FlipTilesProps {
  children?: ReactNode;
  className?: string;
  /** 立方体侧面的强调色（hex），翻滚时翻上来的就是这一面 */
  color?: string;
  /** 金属倒角与反光条的高光色（hex） */
  highlightColor?: string;
  /** 立方体间距（px），即单个立方体加缝隙的宽度 */
  tileSize?: number;
  /** 动画速度倍率 */
  speed?: number;
  /** 翻滚编排：成列扫过、中心涟漪或有机漂移 */
  pattern?: FlipTilesPattern;
  /** 指针处立方体升起（微凸）是否跟随指针 */
  interactive?: boolean;
}

const PATTERNS: FlipTilesPattern[] = ['wave', 'ripple', 'drift'];

// 立方体阵列：略带俯角的透视相机下，一片实心立方体整齐排布在深槽地面上。
// 顶面与底面是黑曜石镜面（浅色主题为瓷白），四个侧面是强调色金属，每条棱都有一道高光倒角。
// 编排波经过时立方体绕水平轴滚动 90° 把强调色侧面翻到顶上，停留片刻再滚一次回到黑曜石面；
// 滚动走带轻微回弹的弹簧曲线，滚动途中立方体略微收缩、跃起以免碰到邻居，露出的槽底透出辉光。
// 每个像素对周围 3×3 个立方体做射线求交，并向主光源投射阴影射线；远处渐隐进雾里。
const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform float uScale;
uniform vec3 uColor;
uniform vec3 uHighlight;
uniform vec3 uFront;
uniform vec3 uFloor;
uniform float uPattern;
uniform float uScheme;
uniform float uSamples;

const float PI = 3.14159265;
const float HALF = 0.45;
const float BEVEL = 0.055;
const float FLOOR_Z = -0.45;
const float TILT = 0.42;
const vec3 KEY = vec3(-0.5, -0.42, 0.757);

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

// 绕单位轴 k 旋转 a 弧度（Rodrigues）
mat3 rotAxis(vec3 k, float a) {
  float s = sin(a);
  float c = cos(a);
  float oc = 1.0 - c;
  return mat3(
    oc * k.x * k.x + c, oc * k.x * k.y + k.z * s, oc * k.z * k.x - k.y * s,
    oc * k.x * k.y - k.z * s, oc * k.y * k.y + c, oc * k.y * k.z + k.x * s,
    oc * k.z * k.x + k.y * s, oc * k.y * k.z - k.x * s, oc * k.z * k.z + c
  );
}

mat3 transposeM(mat3 m) {
  return mat3(
    m[0][0], m[1][0], m[2][0],
    m[0][1], m[1][1], m[2][1],
    m[0][2], m[1][2], m[2][2]
  );
}

// 0→1 的欠阻尼弹簧：起步零速度，约 7% 的回弹后稳定
float spring(float x) {
  x = clamp(x, 0.0, 1.0);
  float k = exp(-6.0 * x) * (cos(7.0 * x) + 6.0 / 7.0 * sin(7.0 * x));
  return 1.0 - k * (1.0 - smoothstep(0.8, 1.0, x));
}

// 单个立方体的姿态：滚动轴与角度、滚动时的收缩与跃起、指针处的升起
void cubeAt(vec2 c, vec2 pw, out mat3 inv, out vec4 geo, out float open) {
  float h = hash(c);
  float h2 = hash(c + 17.31);
  vec3 axis;
  float f;
  if (uPattern < 0.5) {
    float a = 0.35 + 0.3 * sin(uTime * 0.045);
    axis = vec3(0.0, 1.0, 0.0);
    f = uTime * 0.15 - dot(c, vec2(cos(a), sin(a))) * 0.1 + h * 0.035;
  } else if (uPattern < 1.5) {
    axis = abs(c.x) >= abs(c.y) ? vec3(0.0, c.x < 0.0 ? -1.0 : 1.0, 0.0) : vec3(c.y < 0.0 ? 1.0 : -1.0, 0.0, 0.0);
    f = uTime * 0.14 - length(c) * 0.12 + h * 0.03;
  } else {
    axis = h2 < 0.5 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    f = uTime * 0.07 + noise(c * 0.16 + vec2(uTime * 0.015, -uTime * 0.01)) * 2.2 + h * 0.05;
  }
  // 每个周期滚两次：先把强调色侧面翻上来，停留片刻，再滚回黑曜石面
  float fl = floor(f);
  float fr = f - fl;
  float roll = spring(fr / 0.2) + spring((fr - 0.26) / 0.2);
  float ang = PI * 0.5 * (2.0 * mod(fl, 2.0) + roll);
  open = abs(sin(2.0 * ang));

  // 转到 45° 时对角线最长，按投影宽度收缩，保证与邻居始终不相交
  float reach = HALF * (abs(cos(ang)) + abs(sin(ang)));
  float s = min(1.0, 0.49 / reach);
  vec2 toP = c - pw;
  float lift = 0.3 * exp(-dot(toP, toP) / 5.0);

  inv = rotAxis(axis, -ang);
  geo = vec4(c, lift + (1.0 - s) * 0.7, HALF * s);
}

// 射线与以原点为中心的立方体求交，返回最近交点距离（未命中为 -1）与局部法线
float boxHit(vec3 ro, vec3 rd, float rad, out vec3 n) {
  rd = mix(rd, vec3(1e-6), step(abs(rd), vec3(1e-6)));
  vec3 m = 1.0 / rd;
  vec3 k = abs(m) * rad;
  vec3 t1 = -m * ro - k;
  vec3 t2 = -m * ro + k;
  float tN = max(max(t1.x, t1.y), t1.z);
  float tF = min(min(t2.x, t2.y), t2.z);
  n = vec3(0.0);
  if (tN > tF || tF < 0.0) return -1.0;
  n = -sign(rd) * step(t1.yzx, t1.xyz) * step(t1.zxy, t1.xyz);
  return tN;
}

// 环境光：只保留一层极弱的均匀补光，不再有扫过画面的灯带反光
vec3 envLight(vec3 R) {
  return vec3(0.008 + 0.02 * smoothstep(-0.1, 0.4, R.z));
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

vec2 sampleOffset(int s) {
  if (uSamples < 1.5) return vec2(0.0);
  if (uSamples < 2.5) return s == 0 ? vec2(-0.25) : vec2(0.25);
  if (s == 0) return vec2(-0.125, -0.375);
  if (s == 1) return vec2(0.375, -0.125);
  if (s == 2) return vec2(0.125, 0.375);
  return vec2(-0.375, 0.125);
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  vec2 center = 0.5 * uResolution;
  float halfW = 0.5 * max(uResolution.x, uResolution.y) / uScale;

  // 略带俯角的透视相机：屏幕向下对应世界 +y，相机从 +y 一侧斜看，能看到立方体朝向观者的侧面
  float D = halfW * 2.0;
  vec3 ro = vec3(0.0, D * sin(TILT), D * cos(TILT));
  vec3 fw = -normalize(ro);
  vec3 dn = vec3(0.0, cos(TILT), -sin(TILT));

  vec2 puv = (uPointer - center) / uScale;
  vec3 prd = normalize(fw * D + vec3(puv.x, 0.0, 0.0) + dn * puv.y);
  vec2 pw = (ro + prd * ((HALF - ro.z) / prd.z)).xy;

  vec2 cuv = (frag - center) / uScale;
  vec3 crd = normalize(fw * D + vec3(cuv.x, 0.0, 0.0) + dn * cuv.y);
  vec2 base = floor((ro + crd * (-ro.z / crd.z)).xy + 0.5);

  vec3 L = normalize(KEY);
  // 主光源的镜面高光颜色
  vec3 specCol = mix(vec3(1.0), uHighlight, 0.35);
  float amb = mix(0.03, 0.45, uScheme);

  // 周围 3×3 个立方体的姿态只算一次，供所有采样与阴影复用
  mat3 invs[9];
  vec4 geos[9];
  float opens[9];
  float seeds[9];
  vec3 localL[9];
  for (int k = 0; k < 9; k++) {
    int row = k / 3;
    vec2 c = base + vec2(float(k - row * 3) - 1.0, float(row) - 1.0);
    mat3 inv;
    vec4 geo;
    float open;
    cubeAt(c, pw, inv, geo, open);
    invs[k] = inv;
    geos[k] = geo;
    opens[k] = open;
    seeds[k] = hash(c + 5.17);
    // 光源方向是常量，提前转到各立方体局部空间，省去每次采样重复的矩阵乘法
    localL[k] = inv * L;
  }

  vec3 acc = vec3(0.0);
  for (int s = 0; s < 4; s++) {
    if (float(s) >= uSamples) break;
    vec2 uv = (frag + sampleOffset(s) - center) / uScale;
    vec3 rd = normalize(fw * D + vec3(uv.x, 0.0, 0.0) + dn * uv.y);

    float tMin = 1e9;
    int hitK = -1;
    vec3 hitN = vec3(0.0);
    vec3 hitP = vec3(0.0);
    mat3 hitInv = mat3(1.0);
    float hitSize = HALF;
    float hitSeed = 0.0;
    for (int k = 0; k < 9; k++) {
      vec3 lro = invs[k] * (ro - geos[k].xyz);
      vec3 lrd = invs[k] * rd;
      vec3 n;
      float t = boxHit(lro, lrd, geos[k].w, n);
      if (t > 0.0 && t < tMin) {
        tMin = t;
        hitK = k;
        hitN = n;
        hitP = lro + lrd * t;
        hitInv = invs[k];
        hitSize = geos[k].w;
        hitSeed = seeds[k];
      }
    }

    bool hit = hitK >= 0;
    float tFloor = (FLOOR_Z - ro.z) / rd.z;
    float tHit = hit ? tMin : tFloor;
    vec3 wp = ro + rd * tHit;

    // 立方体法线：棱边一圈向外倾斜，形成圆润的倒角；每块顶面极轻微错开，像手工铺贴
    vec3 n = vec3(0.0, 0.0, 1.0);
    float bevel = 0.0;
    if (hit) {
      vec3 b = (1.0 - smoothstep(0.0, BEVEL, hitSize - abs(hitP))) * (1.0 - abs(hitN));
      bevel = max(max(b.x, b.y), b.z);
      vec3 jitter = (vec3(hitSeed, fract(hitSeed * 7.13), fract(hitSeed * 3.71)) - 0.5) * 0.04 * (1.0 - abs(hitN));
      n = normalize(transposeM(hitInv) * normalize(hitN + sign(hitP) * b * 1.2 + jitter));
    }

    // 主光源的投影：向光源方向检测其余立方体，命中即提前退出
    float shadow = 1.0;
    vec3 sp = wp + n * 0.003;
    for (int k = 0; k < 9; k++) {
      if (k == hitK) continue;
      vec3 tmp;
      float ts = boxHit(invs[k] * (sp - geos[k].xyz), localL[k], geos[k].w, tmp);
      if (ts > 0.0) {
        shadow = 0.0;
        break;
      }
    }

    vec3 V = -rd;
    float diffK = max(dot(n, L), 0.0) * shadow;
    float NdHk = max(dot(n, normalize(L + V)), 0.0);

    vec3 color;
    if (hit) {
      float fres = pow(1.0 - max(dot(n, V), 0.0), 5.0);
      vec3 env = envLight(reflect(rd, n));

      vec3 edge = uHighlight * (0.03 + 0.4 * diffK)
        + mix(uHighlight, vec3(1.0), 0.3 + 0.7 * fres) * env * 1.4
        + specCol * pow(NdHk, 48.0) * shadow * 0.8;

      vec3 face;
      if (abs(hitN.z) > 0.5) {
        face = uFront * (amb + 0.55 * diffK)
          + env * (0.12 + 0.88 * fres) * mix(1.0, 0.45, uScheme)
          + specCol * pow(NdHk, 900.0) * shadow * 0.4;
      } else {
        face = uColor * (amb * 0.6 + 0.02 + 0.7 * diffK)
          + mix(uColor, vec3(1.0), fres) * env * 0.8
          + mix(uColor, specCol, 0.5) * (pow(NdHk, 40.0) * shadow * 0.5);
      }
      color = mix(face, edge, bevel * 0.5);
    } else {
      // 槽底：紧贴立方体处压暗，滚动中的立方体下方透出强调色辉光
      float ao = 1.0;
      float glow = 0.0;
      for (int k = 0; k < 9; k++) {
        vec2 dv = wp.xy - geos[k].xy;
        float d2 = dot(dv, dv);
        // 超过此距离 ao 已饱和、辉光已衰减到看不见，跳过以省算力
        if (d2 > 1.5) continue;
        vec2 q = abs(dv) - geos[k].w;
        ao *= mix(0.2, 1.0, smoothstep(0.0, 0.3, length(max(q, 0.0))));
        glow += opens[k] * exp(-d2 / 0.18);
      }
      color = uFloor * (amb + 0.45 * diffK) * ao
        + uColor * (glow * 0.5 * (0.4 + 0.6 * ao));
    }

    // 远处渐隐进雾里，拉开纵深
    float fog = smoothstep(D * 0.95, D * 1.5, tHit);
    color = mix(color, uFloor * mix(0.4, 0.9, uScheme), fog * 0.8);

    acc += aces(color * mix(1.3, 1.05, uScheme));
  }
  vec3 color = acc / uSamples;

  vec2 vc = frag / uResolution - 0.5;
  color *= 1.0 - dot(vc, vc) * mix(1.1, 0.3, uScheme);
  color = pow(color, vec3(1.0 / 2.2));
  color += (hash(frag + fract(uTime)) - 0.5) / 255.0;

  gl_FragColor = vec4(color, 1.0);
}
`;

export function FlipTiles({
  children,
  className,
  color = '#4f6bff',
  highlightColor = '#b8c4ff',
  tileSize = 72,
  speed = 1,
  pattern = 'wave',
  interactive = true,
}: FlipTilesProps) {
  const scheme = useColorScheme();
  const canvasRef = useShaderCanvas({
    fragmentShader: FRAGMENT_SHADER,
    speed,
    interactive,
    // 每像素要跑 9 次立方体求交与阴影射线，属于重填充率着色器：内部按 1.5× 渲染，
    // 视觉上几乎无损，但相比 2× 能省下约 44% 的像素量
    maxDpr: 1.5,
    onDraw: ({ gl, uniform, dpr }) => {
      const light = scheme === 'light';
      gl.uniform1f(uniform('uScale'), Math.max(24, tileSize) * dpr);
      gl.uniform3fv(uniform('uColor'), hexToLinearRgb(color));
      gl.uniform3fv(uniform('uHighlight'), hexToLinearRgb(highlightColor));
      gl.uniform3fv(uniform('uFront'), hexToLinearRgb(light ? '#ececf1' : '#0c0c12'));
      gl.uniform3fv(uniform('uFloor'), hexToLinearRgb(light ? '#c6c6d0' : '#040406'));
      gl.uniform1f(uniform('uPattern'), Math.max(0, PATTERNS.indexOf(pattern)));
      gl.uniform1f(uniform('uScheme'), light ? 1 : 0);
      // 采样偏移只在单个像素内抖动，两次采样已足够压住立方体棱边的锯齿
      gl.uniform1f(uniform('uSamples'), 2);
    },
  });

  return (
    <div
      className={cn('elyri-flip-tiles', className)}
      data-scheme={scheme}
      style={{ '--elyri-flip-tiles-color': color } as CSSProperties}
    >
      <canvas ref={canvasRef} className="elyri-flip-tiles__canvas" aria-hidden="true" />
      {children != null && <div className="elyri-flip-tiles__content">{children}</div>}
    </div>
  );
}
