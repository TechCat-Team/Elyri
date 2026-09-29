import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const ContoursDemo = lazy(() => import('./ContoursDemo'));

const DEFAULTS = {
  color: '#8a90a6',
  highlightColor: '#f08a4b',
  density: 1,
  speed: 1,
};

const copy = {
  zh: {
    description: 'WebGL 实时渲染的等高线：缓慢演化的地形被切成等宽细线，每五条一条计曲线，指针处隆起一座小山。',
    textLabel: '文本',
    colorLabel: '线条色',
    highlightLabel: '强调色',
    densityLabel: '密度',
    speedLabel: '速度',
    interactiveLabel: '跟随指针',
    descChildren: '叠加在背景之上的内容',
    descColor: '等高线颜色（hex）',
    descHighlight: '指针附近等高线的强调色（hex）',
    descDensity: '等高线密度倍率',
    descSpeed: '动画速度倍率',
    descInteractive: '指针处是否隆起一座小山',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'WebGL topographic contours: a slowly evolving terrain sliced into even hairlines with a bolder index line every fifth, rising into a hill under the pointer.',
    textLabel: 'Text',
    colorLabel: 'Line color',
    highlightLabel: 'Accent',
    densityLabel: 'Density',
    speedLabel: 'Speed',
    interactiveLabel: 'Follow pointer',
    descChildren: 'Content layered above the background',
    descColor: 'Contour line color (hex)',
    descHighlight: 'Accent color for lines near the pointer (hex)',
    descDensity: 'Contour density multiplier',
    descSpeed: 'Animation speed multiplier',
    descInteractive: 'Whether a hill rises under the pointer',
    descClassName: 'Extra class name',
  },
};

export const contoursDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];
  const unlessDefault = <T,>(value: T, fallback: T) => (value === fallback ? undefined : value);

  return {
    slug: 'contours',
    title: 'Contours',
    category: 'Backgrounds',
    description: t.description,
    hero: true,
    isNew: true,
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
      <ContoursDemo
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
        component: 'Contours',
        propsType: 'ContoursProps',
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
