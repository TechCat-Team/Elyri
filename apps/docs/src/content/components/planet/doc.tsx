import { lazy } from 'react';

import type { PlanetKind } from 'elyri';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const PlanetDemo = lazy(() => import('./PlanetDemo'));

const PRESETS: Record<
  PlanetKind,
  { color: string; terrainColor: string; atmosphereColor: string; atmosphere: number }
> = {
  mars: { color: '#c1532b', terrainColor: '#4e1e12', atmosphereColor: '#f2a57c', atmosphere: 0.6 },
  jupiter: { color: '#ecdcc0', terrainColor: '#a86a3a', atmosphereColor: '#d9cdb8', atmosphere: 0.3 },
  earth: { color: '#3f5a2a', terrainColor: '#0a2744', atmosphereColor: '#6fa8ff', atmosphere: 0.55 },
};

const DEFAULTS = {
  planet: 'mars' as PlanetKind,
  craters: 0.6,
  stars: 0.6,
  horizon: 0.62,
  speed: 1,
};

const copy = {
  zh: {
    description:
      'WebGL 实时渲染的轨道视角星球，可在火星、木星与地球间切换：火星上程序化生成的地形与陨石坑缓缓流过；木星的云带随交替急流滑动，大红斑与白卵在湍流中旋转；地球的海陆、云层与投影随自转流动，海面反射出太阳耀斑，夜侧亮起城市灯光。大气单次散射勾勒出发光的边缘，掠射处透出互补色；太阳随指针沿地平线游移。',
    textLabel: '文本',
    planetLabel: '星球',
    colorLabel: '地表色',
    terrainLabel: '暗色地貌',
    atmosphereColorLabel: '大气色',
    atmosphereLabel: '大气浓度',
    cratersLabel: '陨石坑',
    cityLightsLabel: '城市灯光',
    starsLabel: '星空密度',
    horizonLabel: '地平线位置',
    speedLabel: '速度',
    sunLabel: '显示太阳',
    sunFixedLabel: '固定太阳位置',
    sunXLabel: '太阳 X',
    sunYLabel: '太阳 Y',
    interactiveLabel: '太阳跟随指针',
    descChildren: '叠加在背景之上的内容',
    descPlanet: "星球种类，'mars' 为火星、'jupiter' 为木星、'earth' 为地球；切换后地表着色与默认配色随之改变",
    descColor: '地表主色（hex）；木星为亮色区带，地球为植被。默认取所选星球的配色',
    descTerrain: '暗色地貌的颜色（hex）；木星为暗色云带，地球为海洋。默认取所选星球的配色',
    descAtmosphereColor: '大气散射色（hex），掠射处会透出它的互补色。默认取所选星球的配色',
    descAtmosphere: '大气浓度，0 为无大气。默认取所选星球的预设',
    descCraters: '陨石坑数量与深度，0 为无陨石坑；仅火星生效',
    descCityLights: '是否在夜侧显示城市灯光；仅地球生效',
    descStars: '星空密度，0 为无星星',
    descHorizon: '地平线弧顶距容器顶部的比例',
    descSpeed: '动画速度倍率',
    descSun: '是否显示太阳',
    descSunPosition: '太阳固定的归一化位置（0-1，原点左上，x 为方位、y 为高度）；设置后不再跟随指针或游移',
    descInteractive: '太阳是否跟随指针移动',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'A WebGL planet seen from orbit, switchable between Mars, Jupiter and Earth: procedural Martian terrain and craters drift past; Jupiter’s cloud bands slide along alternating jets with the Great Red Spot and white ovals churning in the turbulence; Earth’s continents, oceans and shadow-casting clouds roll by, with sun glint on the sea and city lights across the night side. Single-scattering atmosphere lights up the limb with its complementary tint at grazing angles, and the sun follows the pointer along the horizon.',
    textLabel: 'Text',
    planetLabel: 'Planet',
    colorLabel: 'Surface',
    terrainLabel: 'Dark terrain',
    atmosphereColorLabel: 'Atmosphere',
    atmosphereLabel: 'Atmosphere density',
    cratersLabel: 'Craters',
    cityLightsLabel: 'City lights',
    starsLabel: 'Stars',
    horizonLabel: 'Horizon',
    speedLabel: 'Speed',
    sunLabel: 'Sun',
    sunFixedLabel: 'Pin sun',
    sunXLabel: 'Sun X',
    sunYLabel: 'Sun Y',
    interactiveLabel: 'Sun follows pointer',
    descChildren: 'Content layered above the background',
    descPlanet:
      "Which planet to render, 'mars', 'jupiter' or 'earth'; switches the surface shading and default palette",
    descColor:
      'Main surface color (hex); the light zones on Jupiter, vegetation on Earth. Defaults to the planet palette',
    descTerrain:
      'Dark terrain color (hex); the dark belts on Jupiter, the oceans on Earth. Defaults to the planet palette',
    descAtmosphereColor:
      'Atmosphere scattering color (hex); grazing views reveal its complement. Defaults to the planet palette',
    descAtmosphere: 'Atmosphere density, 0 disables it. Defaults to the planet preset',
    descCraters: 'Crater count and depth, 0 disables them; Mars only',
    descCityLights: 'Whether city lights glow on the night side; Earth only',
    descStars: 'Star density, 0 disables them',
    descHorizon: 'Distance from the top of the container to the horizon crest, as a fraction',
    descSpeed: 'Animation speed multiplier',
    descSun: 'Whether to render the sun',
    descSunPosition:
      'Fixed normalized position of the sun (0-1, origin top-left, x azimuth, y elevation); stops following the pointer',
    descInteractive: 'Whether the sun follows the pointer',
    descClassName: 'Extra class name',
  },
};

export const planetDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];
  const unlessDefault = <T,>(value: T, fallback: T) => (value === fallback ? undefined : value);
  const initial = PRESETS[DEFAULTS.planet];

  return {
    slug: 'planet',
    title: 'Planet',
    category: 'Backgrounds',
    description: t.description,
    isNew: true,
    dependencies: ['WebGL'],
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: 'Components that come alive' },
      {
        type: 'select',
        name: 'planet',
        label: t.planetLabel,
        default: DEFAULTS.planet,
        options: Object.keys(PRESETS),
      },
      { type: 'color', name: 'color', label: t.colorLabel, default: initial.color },
      { type: 'color', name: 'terrainColor', label: t.terrainLabel, default: initial.terrainColor },
      { type: 'color', name: 'atmosphereColor', label: t.atmosphereColorLabel, default: initial.atmosphereColor },
      {
        type: 'number',
        name: 'atmosphere',
        label: t.atmosphereLabel,
        default: initial.atmosphere,
        min: 0,
        max: 1,
        step: 0.05,
      },
      { type: 'number', name: 'craters', label: t.cratersLabel, default: DEFAULTS.craters, min: 0, max: 1, step: 0.05 },
      { type: 'boolean', name: 'cityLights', label: t.cityLightsLabel, default: true },
      { type: 'number', name: 'stars', label: t.starsLabel, default: DEFAULTS.stars, min: 0, max: 1, step: 0.05 },
      {
        type: 'number',
        name: 'horizon',
        label: t.horizonLabel,
        default: DEFAULTS.horizon,
        min: 0.2,
        max: 0.9,
        step: 0.01,
      },
      { type: 'number', name: 'speed', label: t.speedLabel, default: DEFAULTS.speed, min: 0, max: 5, step: 0.1 },
      { type: 'boolean', name: 'sun', label: t.sunLabel, default: false },
      { type: 'boolean', name: 'sunFixed', label: t.sunFixedLabel, default: false },
      { type: 'number', name: 'sunX', label: t.sunXLabel, default: 0.5, min: 0, max: 1, step: 0.01 },
      { type: 'number', name: 'sunY', label: t.sunYLabel, default: 0.5, min: 0, max: 1, step: 0.01 },
      { type: 'boolean', name: 'interactive', label: t.interactiveLabel, default: true },
    ],
    linkedValues: (name, value) => (name === 'planet' ? { ...PRESETS[value as PlanetKind] } : undefined),
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      {
        name: 'planet',
        type: "'mars' | 'jupiter' | 'earth'",
        default: `'${DEFAULTS.planet}'`,
        description: t.descPlanet,
      },
      { name: 'color', type: 'string', description: t.descColor },
      { name: 'terrainColor', type: 'string', description: t.descTerrain },
      { name: 'atmosphereColor', type: 'string', description: t.descAtmosphereColor },
      { name: 'atmosphere', type: 'number', description: t.descAtmosphere },
      { name: 'craters', type: 'number', default: String(DEFAULTS.craters), description: t.descCraters },
      { name: 'cityLights', type: 'boolean', default: 'true', description: t.descCityLights },
      { name: 'stars', type: 'number', default: String(DEFAULTS.stars), description: t.descStars },
      { name: 'horizon', type: 'number', default: String(DEFAULTS.horizon), description: t.descHorizon },
      { name: 'speed', type: 'number', default: String(DEFAULTS.speed), description: t.descSpeed },
      { name: 'sun', type: 'boolean', default: 'false', description: t.descSun },
      { name: 'sunPosition', type: '{ x: number; y: number }', description: t.descSunPosition },
      { name: 'interactive', type: 'boolean', default: 'true', description: t.descInteractive },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <PlanetDemo
        text={v.text as string}
        planet={v.planet as PlanetKind}
        color={v.color as string}
        terrainColor={v.terrainColor as string}
        atmosphereColor={v.atmosphereColor as string}
        atmosphere={v.atmosphere as number}
        craters={v.craters as number}
        cityLights={v.cityLights as boolean}
        stars={v.stars as number}
        horizon={v.horizon as number}
        speed={v.speed as number}
        sun={v.sun as boolean}
        sunPosition={v.sunFixed ? { x: v.sunX as number, y: v.sunY as number } : undefined}
        interactive={v.interactive as boolean}
      />
    ),
    usage: (v, codeLang) => {
      const preset = PRESETS[v.planet as PlanetKind];
      return usageExample(codeLang, {
        component: 'Planet',
        propsType: 'PlanetProps',
        name: 'Hero',
        props: {
          planet: unlessDefault(v.planet, DEFAULTS.planet),
          color: unlessDefault(v.color, preset.color),
          terrainColor: unlessDefault(v.terrainColor, preset.terrainColor),
          atmosphereColor: unlessDefault(v.atmosphereColor, preset.atmosphereColor),
          atmosphere: unlessDefault(v.atmosphere, preset.atmosphere),
          craters: v.planet === 'mars' ? unlessDefault(v.craters, DEFAULTS.craters) : undefined,
          cityLights: v.planet === 'earth' && !v.cityLights ? false : undefined,
          stars: unlessDefault(v.stars, DEFAULTS.stars),
          horizon: unlessDefault(v.horizon, DEFAULTS.horizon),
          speed: unlessDefault(v.speed, DEFAULTS.speed),
          sun: v.sun ? true : undefined,
          sunPosition: v.sunFixed ? { x: v.sunX as number, y: v.sunY as number } : undefined,
          interactive: v.interactive ? undefined : false,
        },
        children: `<h1>${v.text as string}</h1>`,
      });
    },
  };
};
