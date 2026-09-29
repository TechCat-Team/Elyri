import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const DragonScalesDemo = lazy(() => import('./DragonScalesDemo'));

const DEFAULTS = {
  color: '#7b3fe4',
  highlightColor: '#e7a6ff',
  scaleSize: 110,
  speed: 1,
  flare: 0,
};

const copy = {
  zh: {
    description: 'WebGL 实时渲染的侧向龙鳞背景：黑曜石釉面、沿轮廓流动的弧形反光与双线鳞缘，光源跟随指针移动。',
    textLabel: '文本',
    colorLabel: '鳞片色',
    highlightLabel: '高光色',
    scaleSizeLabel: '鳞片大小 (px)',
    speedLabel: '速度',
    flareLabel: '鳞片开合',
    interactiveLabel: '跟随指针',
    descChildren: '叠加在背景之上的内容',
    descColor: '鳞片本体色（hex）',
    descHighlight: '反光条与鳞缘高光色（hex）',
    descScaleSize: '单片鳞宽度（像素）',
    descSpeed: '动画速度倍率',
    descFlare: '鳞片开合幅度，0-1，0 为关闭；开启后一道波沿身体推进，鳞片依次翘起再合拢',
    descInteractive: '光源是否跟随指针',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'A WebGL side-view dragon-scale background with an obsidian glaze, flowing contour reflections and double-lined rims. The light follows the pointer.',
    textLabel: 'Text',
    colorLabel: 'Scale color',
    highlightLabel: 'Highlight',
    scaleSizeLabel: 'Scale size (px)',
    speedLabel: 'Speed',
    flareLabel: 'Scale flare',
    interactiveLabel: 'Follow pointer',
    descChildren: 'Content layered above the background',
    descColor: 'Scale body color (hex)',
    descHighlight: 'Reflection and rim color (hex)',
    descScaleSize: 'Width of a single scale in pixels',
    descSpeed: 'Animation speed multiplier',
    descFlare:
      'Scale flare amount, 0-1 (0 disables). A wave travels along the body, lifting and settling scales in turn',
    descInteractive: 'Whether the light follows the pointer',
    descClassName: 'Extra class name',
  },
};

export const dragonScalesDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];
  const unlessDefault = <T,>(value: T, fallback: T) => (value === fallback ? undefined : value);

  return {
    slug: 'dragon-scales',
    title: 'DragonScales',
    category: 'Backgrounds',
    description: t.description,
    hero: true,
    dependencies: ['WebGL'],
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: 'Components that come alive' },
      { type: 'color', name: 'color', label: t.colorLabel, default: DEFAULTS.color },
      { type: 'color', name: 'highlightColor', label: t.highlightLabel, default: DEFAULTS.highlightColor },
      { type: 'number', name: 'scaleSize', label: t.scaleSizeLabel, default: DEFAULTS.scaleSize, min: 32, max: 160 },
      { type: 'number', name: 'speed', label: t.speedLabel, default: DEFAULTS.speed, min: 0, max: 3, step: 0.1 },
      { type: 'number', name: 'flare', label: t.flareLabel, default: DEFAULTS.flare, min: 0, max: 1, step: 0.05 },
      { type: 'boolean', name: 'interactive', label: t.interactiveLabel, default: true },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: 'color', type: 'string', default: `'${DEFAULTS.color}'`, description: t.descColor },
      { name: 'highlightColor', type: 'string', default: `'${DEFAULTS.highlightColor}'`, description: t.descHighlight },
      { name: 'scaleSize', type: 'number', default: String(DEFAULTS.scaleSize), description: t.descScaleSize },
      { name: 'speed', type: 'number', default: String(DEFAULTS.speed), description: t.descSpeed },
      { name: 'flare', type: 'number', default: String(DEFAULTS.flare), description: t.descFlare },
      { name: 'interactive', type: 'boolean', default: 'true', description: t.descInteractive },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <DragonScalesDemo
        text={v.text as string}
        color={v.color as string}
        highlightColor={v.highlightColor as string}
        scaleSize={v.scaleSize as number}
        speed={v.speed as number}
        flare={v.flare as number}
        interactive={v.interactive as boolean}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'DragonScales',
        propsType: 'DragonScalesProps',
        name: 'Hero',
        props: {
          color: unlessDefault(v.color, DEFAULTS.color),
          highlightColor: unlessDefault(v.highlightColor, DEFAULTS.highlightColor),
          scaleSize: unlessDefault(v.scaleSize, DEFAULTS.scaleSize),
          speed: unlessDefault(v.speed, DEFAULTS.speed),
          flare: unlessDefault(v.flare, DEFAULTS.flare),
          interactive: v.interactive ? undefined : false,
        },
        children: `<h1>${v.text as string}</h1>`,
      }),
  };
};
