import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const PlanetDemo = lazy(() => import('./PlanetDemo'));

const DEFAULTS = {
  color: '#c1532b',
  terrainColor: '#4e1e12',
  atmosphereColor: '#f2a57c',
  atmosphere: 0.6,
  craters: 0.6,
  stars: 0.6,
  horizon: 0.62,
  speed: 1,
};

const copy = {
  zh: {
    description:
      'WebGL 实时渲染的轨道视角星球，默认是火星：程序化生成的地形与陨石坑缓缓流过，大气单次散射勾勒出发光的边缘，掠射处透出互补色；太阳随指针沿地平线游移。',
    textLabel: '文本',
    colorLabel: '地表色',
    terrainLabel: '暗色地貌',
    atmosphereColorLabel: '大气色',
    atmosphereLabel: '大气浓度',
    cratersLabel: '陨石坑',
    starsLabel: '星空密度',
    horizonLabel: '地平线位置',
    speedLabel: '速度',
    sunLabel: '显示太阳',
    sunFixedLabel: '固定太阳位置',
    sunXLabel: '太阳 X',
    sunYLabel: '太阳 Y',
    interactiveLabel: '太阳跟随指针',
    descChildren: '叠加在背景之上的内容',
    descColor: '地表主色（hex）',
    descTerrain: '暗色地貌的颜色（hex）',
    descAtmosphereColor: '大气散射色（hex），掠射处会透出它的互补色',
    descAtmosphere: '大气浓度，0 为无大气',
    descCraters: '陨石坑数量与深度，0 为无陨石坑',
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
      'A WebGL planet seen from orbit, Mars by default: procedural terrain and craters drift past, single-scattering atmosphere lights up the limb with its complementary tint at grazing angles, and the sun follows the pointer along the horizon.',
    textLabel: 'Text',
    colorLabel: 'Surface',
    terrainLabel: 'Dark terrain',
    atmosphereColorLabel: 'Atmosphere',
    atmosphereLabel: 'Atmosphere density',
    cratersLabel: 'Craters',
    starsLabel: 'Stars',
    horizonLabel: 'Horizon',
    speedLabel: 'Speed',
    sunLabel: 'Sun',
    sunFixedLabel: 'Pin sun',
    sunXLabel: 'Sun X',
    sunYLabel: 'Sun Y',
    interactiveLabel: 'Sun follows pointer',
    descChildren: 'Content layered above the background',
    descColor: 'Main surface color (hex)',
    descTerrain: 'Dark terrain color (hex)',
    descAtmosphereColor: 'Atmosphere scattering color (hex); grazing views reveal its complement',
    descAtmosphere: 'Atmosphere density, 0 disables it',
    descCraters: 'Crater count and depth, 0 disables them',
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

  return {
    slug: 'planet',
    title: 'Planet',
    category: 'Backgrounds',
    description: t.description,
    isNew: true,
    dependencies: ['WebGL'],
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: 'Components that come alive' },
      { type: 'color', name: 'color', label: t.colorLabel, default: DEFAULTS.color },
      { type: 'color', name: 'terrainColor', label: t.terrainLabel, default: DEFAULTS.terrainColor },
      { type: 'color', name: 'atmosphereColor', label: t.atmosphereColorLabel, default: DEFAULTS.atmosphereColor },
      {
        type: 'number',
        name: 'atmosphere',
        label: t.atmosphereLabel,
        default: DEFAULTS.atmosphere,
        min: 0,
        max: 1,
        step: 0.05,
      },
      { type: 'number', name: 'craters', label: t.cratersLabel, default: DEFAULTS.craters, min: 0, max: 1, step: 0.05 },
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
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: 'color', type: 'string', default: `'${DEFAULTS.color}'`, description: t.descColor },
      { name: 'terrainColor', type: 'string', default: `'${DEFAULTS.terrainColor}'`, description: t.descTerrain },
      {
        name: 'atmosphereColor',
        type: 'string',
        default: `'${DEFAULTS.atmosphereColor}'`,
        description: t.descAtmosphereColor,
      },
      { name: 'atmosphere', type: 'number', default: String(DEFAULTS.atmosphere), description: t.descAtmosphere },
      { name: 'craters', type: 'number', default: String(DEFAULTS.craters), description: t.descCraters },
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
        color={v.color as string}
        terrainColor={v.terrainColor as string}
        atmosphereColor={v.atmosphereColor as string}
        atmosphere={v.atmosphere as number}
        craters={v.craters as number}
        stars={v.stars as number}
        horizon={v.horizon as number}
        speed={v.speed as number}
        sun={v.sun as boolean}
        sunPosition={v.sunFixed ? { x: v.sunX as number, y: v.sunY as number } : undefined}
        interactive={v.interactive as boolean}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'Planet',
        propsType: 'PlanetProps',
        name: 'Hero',
        props: {
          color: unlessDefault(v.color, DEFAULTS.color),
          terrainColor: unlessDefault(v.terrainColor, DEFAULTS.terrainColor),
          atmosphereColor: unlessDefault(v.atmosphereColor, DEFAULTS.atmosphereColor),
          atmosphere: unlessDefault(v.atmosphere, DEFAULTS.atmosphere),
          craters: unlessDefault(v.craters, DEFAULTS.craters),
          stars: unlessDefault(v.stars, DEFAULTS.stars),
          horizon: unlessDefault(v.horizon, DEFAULTS.horizon),
          speed: unlessDefault(v.speed, DEFAULTS.speed),
          sun: v.sun ? true : undefined,
          sunPosition: v.sunFixed ? { x: v.sunX as number, y: v.sunY as number } : undefined,
          interactive: v.interactive ? undefined : false,
        },
        children: `<h1>${v.text as string}</h1>`,
      }),
  };
};
