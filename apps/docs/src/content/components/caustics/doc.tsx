import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const CausticsDemo = lazy(() => import('./CausticsDemo'));

const DEFAULTS = {
  color: '#0a6fa8',
  highlightColor: '#c8fbff',
  density: 1,
  speed: 1,
};

const copy = {
  zh: {
    description: 'WebGL 实时渲染的水下焦散：流动的光网带轻微色散，顶部斜射光束，指针处荡开水波并聚光。',
    textLabel: '文本',
    colorLabel: '水体色',
    highlightLabel: '光纹色',
    densityLabel: '光纹密度',
    speedLabel: '速度',
    interactiveLabel: '指针水波',
    descChildren: '叠加在背景之上的内容',
    descColor: '水体颜色（hex）',
    descHighlight: '焦散光色（hex）',
    descDensity: '光纹密度倍率',
    descSpeed: '动画速度倍率',
    descInteractive: '指针处是否荡开水波并聚光',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'WebGL underwater caustics: a flowing light web with subtle dispersion, slanted god rays, and ripples that spread from the pointer.',
    textLabel: 'Text',
    colorLabel: 'Water',
    highlightLabel: 'Light',
    densityLabel: 'Density',
    speedLabel: 'Speed',
    interactiveLabel: 'Pointer ripples',
    descChildren: 'Content layered above the background',
    descColor: 'Water color (hex)',
    descHighlight: 'Caustic light color (hex)',
    descDensity: 'Light pattern density multiplier',
    descSpeed: 'Animation speed multiplier',
    descInteractive: 'Whether ripples spread and light focuses at the pointer',
    descClassName: 'Extra class name',
  },
};

export const causticsDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];
  const unlessDefault = <T,>(value: T, fallback: T) => (value === fallback ? undefined : value);

  return {
    slug: 'caustics',
    title: 'Caustics',
    category: 'Backgrounds',
    description: t.description,
    hero: true,
    dependencies: ['WebGL'],
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: 'Components that come alive' },
      { type: 'color', name: 'color', label: t.colorLabel, default: DEFAULTS.color },
      { type: 'color', name: 'highlightColor', label: t.highlightLabel, default: DEFAULTS.highlightColor },
      {
        type: 'number',
        name: 'density',
        label: t.densityLabel,
        default: DEFAULTS.density,
        min: 0.4,
        max: 2.5,
        step: 0.05,
      },
      { type: 'number', name: 'speed', label: t.speedLabel, default: DEFAULTS.speed, min: 0, max: 3, step: 0.1 },
      { type: 'boolean', name: 'interactive', label: t.interactiveLabel, default: true },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: 'color', type: 'string', default: `'${DEFAULTS.color}'`, description: t.descColor },
      { name: 'highlightColor', type: 'string', default: `'${DEFAULTS.highlightColor}'`, description: t.descHighlight },
      { name: 'density', type: 'number', default: String(DEFAULTS.density), description: t.descDensity },
      { name: 'speed', type: 'number', default: String(DEFAULTS.speed), description: t.descSpeed },
      { name: 'interactive', type: 'boolean', default: 'true', description: t.descInteractive },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <CausticsDemo
        text={v.text as string}
        color={v.color as string}
        highlightColor={v.highlightColor as string}
        density={v.density as number}
        speed={v.speed as number}
        interactive={v.interactive as boolean}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'Caustics',
        propsType: 'CausticsProps',
        name: 'Hero',
        props: {
          color: unlessDefault(v.color, DEFAULTS.color),
          highlightColor: unlessDefault(v.highlightColor, DEFAULTS.highlightColor),
          density: unlessDefault(v.density, DEFAULTS.density),
          speed: unlessDefault(v.speed, DEFAULTS.speed),
          interactive: v.interactive ? undefined : false,
        },
        children: `<h1>${v.text as string}</h1>`,
      }),
  };
};
