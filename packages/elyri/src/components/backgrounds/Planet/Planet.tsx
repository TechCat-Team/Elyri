import type { CSSProperties, ReactNode } from 'react';

import { cn, hexToLinearRgb, useShaderCanvas } from '../../../core';

import './Planet.css';

export type PlanetKind = 'mars' | 'jupiter' | 'earth';

export interface PlanetProps {
  children?: ReactNode;
  className?: string;
  planet?: PlanetKind;
  color?: string;
  terrainColor?: string;
  atmosphereColor?: string;
  atmosphere?: number;
  craters?: number;
  cityLights?: boolean;
  stars?: number;
  horizon?: number;
  speed?: number;
  sun?: boolean;
  sunPosition?: { x: number; y: number };
  interactive?: boolean;
}

const PLANET_PRESETS: Record<
  PlanetKind,
  { color: string; terrainColor: string; atmosphereColor: string; atmosphere: number }
> = {
  mars: { color: '#c1532b', terrainColor: '#4e1e12', atmosphereColor: '#f2a57c', atmosphere: 0.6 },
  jupiter: { color: '#ecdcc0', terrainColor: '#a86a3a', atmosphereColor: '#d9cdb8', atmosphere: 0.3 },
  earth: { color: '#3f5a2a', terrainColor: '#0a2744', atmosphereColor: '#6fa8ff', atmosphere: 0.55 },
};

const COMMON = `
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
uniform float uStars;
uniform float uHorizon;
uniform float uSun;
uniform vec2 uSunPos;
uniform float uSunFixed;

const float ALT = 0.15;
const float FL = 1.25;
const float H = 0.0045;
const float RT = 1.0 + 10.0 * H;
const float SUN_I = 5.0;
const float SUN_R = 0.012;

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

float lod(float freqTimesFootprint) {
  return 1.0 - smoothstep(0.25, 0.6, freqTimesFootprint);
}

float fbm3(vec3 p, float fp, int octaves) {
  float s = 0.0;
  float a = 0.5;
  float f = 1.0;
  for (int i = 0; i < 8; i++) {
    float w = lod(f * fp);
    if (i >= octaves || w <= 0.0) break;
    s += a * w * (noise3(p * f + float(i) * 7.13) - 0.5);
    a *= 0.55;
    f *= 2.02;
  }
  return s;
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
  vec2 q = a * vec2(2.2, 3.4);
  float neb = noise2(q) * 0.55 + noise2(q * 2.1 + 4.0) * 0.3 + noise2(q * 4.3 + 9.0) * 0.15;
  float band = exp(-pow((a.y + 0.35 * a.x + 0.05) * 2.6, 2.0));
  col += mix(vec3(0.05, 0.04, 0.12), vec3(0.1, 0.05, 0.07), neb) * smoothstep(0.35, 0.85, neb) * band * 0.12 * uStars;
  return col;
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}
`;

const RELIEF = `
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
`;

const MARS_SURFACE = `
uniform float uCraters;

const float BUMP = 0.06;

float craterProfile(float x) {
  return 0.8 * (smoothstep(0.0, 1.0, x) - 1.0) + 0.3 * exp(-10.0 * (x - 1.0) * (x - 1.0));
}

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

vec3 shadeSurface(vec3 n, float ndv, float pix, vec3 sun, vec3 beta, float X) {
  float fp = pix / max(sqrt(ndv), 0.12);

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

  float big = fbm3(q * 1.7 + 4.0, fp * 1.7, 8);
  float mid = fbm3(q * 9.0 + 1.0, fp * 9.0, 8);
  float fine = fbm3(q * 70.0 + 3.0, fp * 70.0, 8);
  vec3 albedo = mix(uSurface, uTerrain, smoothstep(-0.12, 0.22, big + 0.35 * mid + 0.15 * fine));
  albedo *= 0.8 + 0.7 * (mid + 0.5) * 0.6 + 2.0 * ter.x + 0.5 * fine;
  albedo *= 1.0 + 0.3 * crater;
  albedo = max(albedo, 0.0);

  float ngl = dot(n, sun);
  float mu0 = max(dot(nb, sun), 0.0);
  float lsl = mu0 / (mu0 + ndv + 1e-3);
  float brdf = mix(mu0, lsl, 0.35) * smoothstep(-0.03, 0.08, ngl);
  vec3 sunT = exp(-beta * H * chapman(X, 0.0, ngl));
  vec3 sky = uAtmosphere * uDensity * 0.05 * smoothstep(-0.3, 0.4, ngl);
  return albedo * (SUN_I * 0.9 * sunT * brdf + sky + 0.004);
}
`;

const JUPITER_SURFACE = `
const vec3 AXIS = vec3(0.0, 0.2955, -0.9553);
const vec3 EAST0 = vec3(1.0, 0.0, 0.0);
const vec3 MERIDIAN0 = vec3(0.0, 0.9553, 0.2955);
const float FLOW_T = 24.0;

vec3 spinAxis(vec3 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return p * c + cross(AXIS, p) * s + AXIS * dot(AXIS, p) * (1.0 - c);
}

vec3 fromLatLon(float lat, float lon) {
  return cos(lat) * (cos(lon) * MERIDIAN0 + sin(lon) * EAST0) + sin(lat) * AXIS;
}

vec2 harmonic(float lat, float k, float a, float ph, float fpLat) {
  float w = a * lod(k * fpLat / (2.0 * PI));
  return w * vec2(sin(k * lat + ph), k * cos(k * lat + ph));
}

vec2 bandField(float lat, float fpLat) {
  return harmonic(lat, 61.0, 1.0, 0.9, fpLat)
    + harmonic(lat, 107.0, 0.55, 2.4, fpLat)
    + harmonic(lat, 211.0, 0.3, 4.1, fpLat)
    + harmonic(lat, 409.0, 0.16, 1.7, fpLat);
}

float jet(float lat) {
  return 0.00011 * (61.0 * cos(61.0 * lat + 0.9) + 0.55 * 107.0 * cos(107.0 * lat + 2.4));
}

vec2 cloudPhase(vec3 p, float lat, float t, float seed, float fp) {
  vec3 q = spinAxis(p, -jet(lat) * t);
  q += AXIS * dot(q, AXIS) * 2.0;
  q += seed * vec3(1.7, 9.2, 4.3);
  float wx = fbm3(q * 7.0, fp * 14.0, 5);
  float wy = fbm3(q * 7.0 + 5.2, fp * 14.0, 5);
  float detail = fbm3(q * 30.0 + vec3(wx, wy, wx - wy) * 9.0, fp * 60.0, 7);
  return vec2(wx, detail);
}

vec2 vortexFrame(vec3 p, float lat0, float lon0, vec2 radii) {
  vec3 c = fromLatLon(lat0, lon0);
  vec3 east = normalize(cross(AXIS, c));
  vec3 north = cross(c, east);
  vec3 d = p - c;
  return vec2(dot(d, east), dot(d, north)) / radii;
}

vec2 vortex(vec2 v, float spin, float seed, float fp) {
  float r = length(v);
  float ang = spin * uTime + 2.4 * (1.0 - smoothstep(0.0, 1.1, r));
  float c = cos(ang);
  float s = sin(ang);
  vec2 w = mat2(c, -s, s, c) * v;
  float tex = fbm3(vec3(w * 2.4, r * 6.0 + seed), fp * 6.0, 6);
  float mask = 1.0 - smoothstep(0.6, 1.0, r + tex * 0.5);
  return vec2(mask, tex);
}

float vortexPush(vec2 v, float radiusY) {
  float r = length(v);
  return v.y / max(r, 1e-3) * radiusY * 0.7 * (1.0 - smoothstep(0.9, 2.6, r)) * smoothstep(0.0, 0.9, r);
}

vec3 shadeSurface(vec3 n, float ndv, float pix, vec3 sun, vec3 beta, float X) {
  float fp = pix / max(sqrt(ndv), 0.12);
  float fpLat = pix / max(ndv, 0.03);

  float lat = asin(clamp(dot(n, AXIS), -1.0, 1.0));

  float cyc = uTime / FLOW_T;
  float phA = fract(cyc);
  float phB = fract(cyc + 0.5);
  float wA = 1.0 - abs(2.0 * phA - 1.0);
  vec2 A = cloudPhase(n, lat, phA * FLOW_T, mod(floor(cyc), 61.0), fp);
  vec2 B = cloudPhase(n, lat, phB * FLOW_T, mod(floor(cyc + 0.5), 61.0) + 0.5, fp);
  vec2 cl = (A * wA + B * (1.0 - wA)) / sqrt(wA * wA + (1.0 - wA) * (1.0 - wA));

  const vec2 GRS_R = vec2(0.05, 0.028);
  vec2 grs = vortexFrame(n, 0.6, -0.1 + 0.03 * sin(uTime * 0.021), GRS_R);
  float push = vortexPush(grs, GRS_R.y);
  const vec2 OVAL_R = vec2(0.013, 0.0085);
  vec2 ovals[5];
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float lon = fi * 0.085 - 0.3 + 0.02 * sin(uTime * 0.017 + fi * 1.9);
    ovals[i] = vortexFrame(n, 0.545 + 0.003 * sin(fi * 2.3), lon, OVAL_R);
    push += vortexPush(ovals[i], OVAL_R.y);
  }

  float latB = lat + cl.x * 0.02 + push;
  vec2 band = bandField(latB, fpLat);
  float soft = 0.25 + abs(band.y) * fpLat;
  float belt = smoothstep(-soft, soft, band.x - 0.1);
  float edge = 1.0 - abs(2.0 * belt - 1.0);

  float hue = 0.5 + 0.5 * sin(latB * 17.0 + 1.7);
  vec3 beltCol = mix(uTerrain, uTerrain * vec3(1.25, 0.9, 0.62), hue);
  vec3 zoneCol = mix(uSurface, uSurface * vec3(1.0, 0.9, 0.72), 1.0 - hue);
  vec3 albedo = mix(zoneCol, beltCol, belt);
  albedo *= 1.0 + cl.y * (1.6 + 2.4 * edge) + 0.1 * band.x;
  float festoon = smoothstep(0.05, 0.2, cl.y) * edge;
  albedo = mix(albedo, albedo * vec3(0.5, 0.62, 0.78), festoon * 0.55);

  float rg = length(grs);
  vec2 gv = vortex(grs, 0.18, 3.0, fp / GRS_R.y);
  float collar = exp(-pow((rg - 1.1) / 0.22, 2.0));
  albedo = mix(albedo, zoneCol * (1.1 + cl.y), collar * 0.75);
  vec3 red = uTerrain * vec3(1.7, 0.66, 0.4);
  red *= (0.7 + 0.4 * smoothstep(0.0, 0.85, rg)) * (1.0 + 1.8 * gv.y);
  albedo = mix(albedo, red, gv.x);

  for (int i = 0; i < 5; i++) {
    float r = length(ovals[i]);
    if (r < 1.6) {
      vec2 o = vortex(ovals[i], -0.4, float(i) * 3.1, fp / OVAL_R.y);
      albedo *= 1.0 - 0.35 * exp(-pow((r - 1.0) / 0.18, 2.0));
      albedo = mix(albedo, uSurface * (1.08 + 1.4 * o.y) * (0.9 + 0.15 * smoothstep(0.0, 0.7, r)), o.x * 0.92);
    }
  }
  albedo = max(albedo, 0.0);

  float ngl = dot(n, sun);
  float mu0 = max(ngl, 0.0);
  float brdf = mu0 * smoothstep(-0.02, 0.1, ngl) + 0.015 * smoothstep(-0.12, 0.04, ngl);
  vec3 sunT = exp(-beta * H * chapman(X, 0.0, ngl));
  vec3 sky = uAtmosphere * uDensity * 0.05 * smoothstep(-0.3, 0.4, ngl);
  return albedo * (SUN_I * 0.9 * sunT * brdf + sky + 0.004);
}
`;

const EARTH_SURFACE = `
uniform float uCityLights;

const float CLOUD_H = 0.0016;
const vec3 CITY_WARM = vec3(1.0, 0.5, 0.16);
const vec3 CITY_COOL = vec3(1.0, 0.86, 0.66);

mat3 spinX(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c);
}

vec3 cloudWarp(vec3 p, float fp) {
  vec3 s = p * 1.8 + vec3(0.0, 0.0, uTime * 0.0035);
  return vec3(fbm3(s + 1.3, fp * 1.8, 4), fbm3(s + 7.1, fp * 1.8, 4), fbm3(s + 4.4, fp * 1.8, 4));
}

float cloudCover(vec3 p, vec3 w, float fp) {
  float t = uTime * 0.006;
  float big = fbm3(p * 3.2 + w * 2.4 + vec3(t, 0.0, -t), fp * 3.2, 6);
  float puff = fbm3(p * 21.0 + w * 5.0 - vec3(0.0, t, t) * 3.0, fp * 21.0, 6);
  float c = big + 0.4 * puff * smoothstep(-0.15, 0.1, big);
  return smoothstep(0.03, 0.26, c + 0.02);
}

// 每个格子至多一座聚落，位置在格内完全随机；查 2x2x2 邻格避免被格子边界截断
float settlements(vec3 q, float scale, float fp, float P, float seed) {
  vec3 g = q * scale + seed * 17.0;
  vec3 base = floor(g - 0.5);
  float f2 = fp * scale * fp * scale * 0.25;
  float sum = 0.0;
  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    vec3 cell = base + vec3(mod(fi, 2.0), mod(floor(fi * 0.5), 2.0), floor(fi * 0.25));
    vec3 r = hash33(cell + seed);
    float w = smoothstep(r.x, r.x + 0.15, P);
    if (w <= 0.0) continue;
    vec3 d = g - cell - hash33(cell * 1.7 + seed + 5.0);
    d -= dot(d, q) * q;
    float s2 = mix(0.03, 0.14, r.y * r.y);
    s2 *= s2;
    float t2 = s2 + f2;
    sum += w * exp(-dot(d, d) / t2) * s2 / t2 * (0.5 + 0.5 * r.z);
  }
  return sum;
}

vec3 cityLights(vec3 q, float fp, float P) {
  float metro = settlements(q, 40.0, fp, P * 0.75, 1.0);
  float town = settlements(q, 170.0, fp, P * 0.45 + min(metro, 1.0) * 0.4, 2.0);
  float t = min(metro, 1.0);
  // 街区颗粒：市中心连成一片，越往郊区越破碎
  float grain = 0.6 * noise3(q * 1800.0) + 0.4 * noise3(q * 700.0 + 3.1);
  float lo = 0.72 - 0.55 * t;
  float mask = mix(0.2 + 0.6 * t, smoothstep(lo, lo + 0.2, grain), lod(fp * 1800.0));
  vec3 tint = mix(CITY_WARM, CITY_COOL, t * t * 0.8);
  return tint * metro * mask * 1.1 + CITY_WARM * min(town, 1.5) * 0.35;
}

vec3 shadeSurface(vec3 n, float ndv, float pix, vec3 sun, vec3 beta, float X) {
  float fp = pix / max(sqrt(ndv), 0.12);

  mat3 spin = spinX(-uTime * 0.008);
  vec3 q = spin * n;

  vec3 cw = vec3(fbm3(q * 1.2 + 3.7, fp * 1.2, 4), fbm3(q * 1.2 + 9.1, fp * 1.2, 4), fbm3(q * 1.2 + 5.3, fp * 1.2, 4));
  float cont = fbm3(q * 1.9 + cw * 1.4 + 0.7, fp * 1.9, 6);
  vec4 ter = terrain(q * 7.0 + 2.0, fp * 7.0);
  float e = cont + 0.3 * ter.x - 0.035;
  float aa = fp * 4.0 + 5e-4;
  float land = smoothstep(-aa, aa, e);
  float alt = max(e, 0.0);
  float mtn = smoothstep(0.02, 0.14, alt + 0.15 * ter.x);

  vec3 grad = ter.yzw * 7.0 * 0.022 * (0.35 + 2.0 * mtn) * land;
  grad = grad * spin;
  grad -= dot(grad, n) * n;
  vec3 nb = normalize(n - grad);

  float mid = fbm3(q * 14.0 + 1.0, fp * 14.0, 6);
  float dry = 0.0;
  float snow = 0.0;
  vec3 ground = uTerrain;
  if (land > 0.0) {
    float fine = fbm3(q * 60.0 + 3.0, fp * 60.0, 5);
    float moist = fbm3(q * 2.6 + 8.0, fp * 2.6, 6) + 0.15 * exp(-alt * 25.0);
    dry = 1.0 - smoothstep(-0.12, 0.02, moist + 0.25 * mid);
    float wet = smoothstep(-0.02, 0.12, moist + 0.2 * mid);
    vec3 grass = uSurface * vec3(1.9, 1.55, 1.0) + vec3(0.02, 0.012, 0.0);
    vec3 la = mix(grass, uSurface, wet);
    la = mix(la, vec3(0.36, 0.25, 0.13) * (0.85 + 0.4 * mid), dry);
    la = mix(la, vec3(0.1, 0.085, 0.07), mtn * 0.8);
    snow = smoothstep(0.17, 0.22, alt + 0.06 * fine + 0.04 * mid + 0.1 * abs(q.x));
    la = mix(la, vec3(0.8), snow);
    la *= max(0.85 + 0.5 * fine + 0.25 * mid, 0.2);
    ground = la;
  }
  float depth = max(-e, 0.0);
  vec3 ocean = mix(uTerrain, uTerrain * vec3(0.6, 2.4, 2.0) + vec3(0.0, 0.02, 0.02), exp(-depth * 60.0));
  ocean *= 0.9 + 0.4 * mid;
  vec3 albedo = mix(ocean, ground, land);

  float ngl = dot(n, sun);
  float mu0 = max(dot(nb, sun), 0.0);
  float lsl = mu0 / (mu0 + ndv + 1e-3);
  float day = smoothstep(-0.03, 0.08, ngl);
  float brdf = mix(mu0, lsl, 0.25) * day;
  vec3 sunT = exp(-beta * H * chapman(X, 0.0, ngl));
  vec3 sky = uAtmosphere * uDensity * 0.05 * smoothstep(-0.3, 0.4, ngl);

  mat3 cspin = spinX(-uTime * 0.0095);
  vec3 c = cspin * n;
  vec3 w = cloudWarp(c, fp);
  float cov = cloudCover(c, w, fp);
  vec3 sunTan = sun - ngl * n;
  sunTan = cspin * (sunTan * inversesqrt(max(dot(sunTan, sunTan), 1e-6)));
  float shade = 1.0;
  float relief = 1.0;
  if (ngl > -0.06) {
    float reach = CLOUD_H * sqrt(max(1.0 - ngl * ngl, 0.0)) / max(ngl, 0.05);
    shade = 1.0 - 0.75 * cloudCover(c + sunTan * reach, w, fp);
    relief = clamp(1.0 - 2.2 * (cloudCover(c + sunTan * 0.006, w, fp) - cov), 0.3, 1.25);
  }

  vec3 color = albedo * (SUN_I * 0.9 * sunT * brdf * shade + sky + 0.004);

  if (land < 1.0) {
    vec3 v = normalize(vec3(0.0, 1.0 + ALT, 0.0) - n);
    float wind = fbm3(q * vec3(10.0, 10.0, 34.0) + 4.2, fp * 34.0, 5);
    float alpha = mix(0.1, 0.3, smoothstep(-0.18, 0.18, wind));
    float a2 = alpha * alpha;
    vec3 hv = normalize(sun + v);
    float nh = max(dot(n, hv), 0.0);
    float nl = max(ngl, 0.0);
    float nv = max(dot(n, v), 1e-3);
    float dd = nh * nh * (a2 - 1.0) + 1.0;
    float k = alpha * 0.5;
    float G = nl / (nl * (1.0 - k) + k) * nv / (nv * (1.0 - k) + k);
    float F = 0.02 + 0.98 * pow(1.0 - max(dot(v, hv), 0.0), 5.0);
    float spec = a2 / (PI * dd * dd) * G * F / (4.0 * nv) * day;
    float Fv = 0.02 + 0.98 * pow(1.0 - nv, 5.0);
    vec3 skyRefl = uAtmosphere * uDensity * 0.35 * smoothstep(-0.2, 0.35, ngl) * Fv;
    color += (SUN_I * 0.9 * sunT * spec * shade + skyRefl) * (1.0 - land);
  }

  float night = (1.0 - smoothstep(-0.08, -0.01, ngl)) * uCityLights;
  vec3 lights = vec3(0.0);
  if (night > 0.0 && land > 0.0) {
    float pop = fbm3(q * 4.3 + 13.0, fp * 4.3, 5) + 0.35 * fbm3(q * 17.0 + 2.0, fp * 17.0, 4);
    float P = smoothstep(-0.02, 0.2, pop + 0.12 * exp(-alt * 22.0) - 0.25 * dry - 0.3 * mtn - 0.5 * snow);
    lights = cityLights(q, fp, P) * land * night;
    color += lights;
  }

  float ngc = ngl + 0.055;
  vec3 sunTc = exp(-beta * H * chapman(X, CLOUD_H / H, ngl));
  float cBrdf = mix(max(ngc, 0.0), ngc / (abs(ngc) + ndv + 1e-3), 0.3) * smoothstep(0.0, 0.1, ngc) * relief;
  vec3 cloud = vec3(0.78) * (SUN_I * 0.9 * sunTc * max(cBrdf, 0.0) + sky * 2.0 + 0.004);
  cloud += lights * 0.12;
  return mix(color, cloud, cov);
}
`;

const MAIN = `
void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = (frag - 0.5 * uResolution) / uResolution.y;
  vec2 ptr = uPointer / uResolution;
  float pixAngle = 1.0 / (uResolution.y * FL);

  float D = 1.0 + ALT;
  float dip = acos(1.0 / D);
  float yaw = (ptr.x - 0.5) * 0.04;
  float pitch = dip + atan((0.5 - uHorizon) / FL) + (ptr.y - 0.5) * 0.015;
  vec3 ro = vec3(0.0, D, 0.0);
  vec3 fw = vec3(sin(yaw) * cos(pitch), -sin(pitch), -cos(yaw) * cos(pitch));
  vec3 right = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, fw);
  vec3 rd = normalize(uv.x * right + uv.y * up + FL * fw);

  vec2 sunRef = mix(ptr, uSunPos, uSunFixed);
  float az = -0.85 + (sunRef.x - 0.5) * 1.2;
  float el = -0.24 - (sunRef.y - 0.5) * 0.3;
  vec3 sun = normalize(vec3(sin(az) * cos(el), sin(el), -cos(az) * cos(el)));

  vec3 beta = uAtmosphere * 7.0 * uDensity + 1e-4;
  float X = 1.0 / H;

  float b = dot(ro, rd);
  float tc = -b;
  float impact = sqrt(max(dot(ro, ro) - b * b, 0.0));
  float coverage = clamp(0.5 - (impact - 1.0) / (tc * pixAngle), 0.0, 1.0);
  float disc = b * b - dot(ro, ro) + 1.0;
  float tPlanet = disc > 0.0 ? -b - sqrt(disc) : tc;

  float mu = dot(rd, sun);
  float sunAng = sqrt(max(2.0 * (1.0 - mu), 0.0));
  vec3 space = stars(rd, pixAngle);
  space += vec3(1.0, 0.96, 0.9) * 60.0 * smoothstep(SUN_R, SUN_R * 0.75, sunAng) * uSun;

  vec3 background = space;
  if (coverage > 0.0) {
    vec3 n = normalize(ro + rd * tPlanet);
    float ndv = max(dot(n, -rd), 0.0);
    vec3 surface = shadeSurface(n, ndv, tPlanet * pixAngle, sun, beta, X);
    background = mix(space, surface, coverage);
  }

  vec3 inscatter = vec3(0.0);
  vec3 trans = vec3(1.0);
  float bA = b * b - dot(ro, ro) + RT * RT;
  if (bA > 0.0) {
    float t0 = max(-b - sqrt(bA), 0.0);
    float t1 = mix(-b + sqrt(bA), tPlanet, coverage);
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
    inscatter = SUN_I * 7.0 * beta * scat * mix(phaseR, phaseM, 0.4 - 0.25 * coverage);
  }

  vec3 color = inscatter + trans * background;

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
  color += vec3(1.0, 0.93, 0.85) * sunTrans * sunVis * (glow + streak) * uSun;

  color *= 1.0 - 0.35 * dot(uv * vec2(0.6, 1.0), uv * vec2(0.6, 1.0));
  color = pow(aces(color * 0.9), vec3(1.0 / 2.2));
  color += (hash12(frag + fract(uTime)) - 0.5) / 255.0;

  gl_FragColor = vec4(color, 1.0);
}
`;

const SHADERS: Record<PlanetKind, string> = {
  mars: COMMON + RELIEF + MARS_SURFACE + MAIN,
  jupiter: COMMON + JUPITER_SURFACE + MAIN,
  earth: COMMON + RELIEF + EARTH_SURFACE + MAIN,
};

export function Planet({
  children,
  className,
  planet = 'mars',
  color,
  terrainColor,
  atmosphereColor,
  atmosphere,
  craters = 0.6,
  cityLights = true,
  stars = 0.6,
  horizon = 0.62,
  speed = 1,
  sun = false,
  sunPosition,
  interactive = true,
}: PlanetProps) {
  const preset = PLANET_PRESETS[planet] ?? PLANET_PRESETS.mars;
  const surfaceColor = color ?? preset.color;
  const darkColor = terrainColor ?? preset.terrainColor;
  const airColor = atmosphereColor ?? preset.atmosphereColor;
  const density = atmosphere ?? preset.atmosphere;

  const canvasRef = useShaderCanvas({
    fragmentShader: SHADERS[planet] ?? SHADERS.mars,
    speed,
    interactive,
    onDraw: ({ gl, uniform }) => {
      const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
      gl.uniform3fv(uniform('uSurface'), hexToLinearRgb(surfaceColor));
      gl.uniform3fv(uniform('uTerrain'), hexToLinearRgb(darkColor));
      gl.uniform3fv(uniform('uAtmosphere'), hexToLinearRgb(airColor));
      gl.uniform1f(uniform('uDensity'), clamp01(density));
      gl.uniform1f(uniform('uCraters'), clamp01(craters));
      gl.uniform1f(uniform('uCityLights'), cityLights ? 1 : 0);
      gl.uniform1f(uniform('uStars'), clamp01(stars));
      gl.uniform1f(uniform('uHorizon'), Math.min(0.95, Math.max(0.05, horizon)));
      gl.uniform1f(uniform('uSun'), sun ? 1 : 0);
      gl.uniform2f(uniform('uSunPos'), clamp01(sunPosition?.x ?? 0.5), clamp01(sunPosition?.y ?? 0.5));
      gl.uniform1f(uniform('uSunFixed'), sunPosition ? 1 : 0);
    },
  });

  return (
    <div
      className={cn('elyri-planet', className)}
      data-planet={planet}
      style={
        {
          '--elyri-planet-color': surfaceColor,
          '--elyri-planet-atmosphere': airColor,
          '--elyri-planet-horizon': `${horizon * 100}%`,
        } as CSSProperties
      }
    >
      <canvas ref={canvasRef} className="elyri-planet__canvas" aria-hidden="true" />
      {children != null && <div className="elyri-planet__content">{children}</div>}
    </div>
  );
}
