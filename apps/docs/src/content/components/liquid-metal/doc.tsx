import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const LiquidMetalDemo = lazy(() => import('./LiquidMetalDemo'));

const DEFAULTS = {
  color: '#c9ced6',
  iridescence: 0.6,
  scale: 1,
  speed: 1,
};

const copy = {
  zh: {
    description:
      'WebGL 实时渲染的液态金属：流动的铬面反射摄影棚光源，边缘泛起薄膜干涉的彩虹色，指针处液面鼓起并跟随一盏点光。',
    textLabel: '文本',
    colorLabel: '金属色',
    iridescenceLabel: '彩虹薄膜',
    scaleLabel: '起伏尺度',
    speedLabel: '速度',
    interactiveLabel: '指针鼓起',
    descChildren: '叠加在背景之上的内容',
    descColor: '金属基色（hex）',
    descIridescence: '彩虹薄膜强度，0 为纯金属',
    descScale: '起伏尺度倍率，越大纹理越密',
    descSpeed: '动画速度倍率',
    descInteractive: '指针处液面是否鼓起',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'WebGL liquid metal: flowing chrome that mirrors studio lights, an iridescent thin-film sheen on its slopes, and a surface that swells under the pointer.',
    textLabel: 'Text',
    colorLabel: 'Metal',
    iridescenceLabel: 'Iridescence',
    scaleLabel: 'Scale',
    speedLabel: 'Speed',
    interactiveLabel: 'Pointer bulge',
    descChildren: 'Content layered above the background',
    descColor: 'Base metal color (hex)',
    descIridescence: 'Thin-film iridescence strength, 0 for pure metal',
    descScale: 'Surface scale multiplier; larger means denser undulation',
    descSpeed: 'Animation speed multiplier',
    descInteractive: 'Whether the surface swells under the pointer',
    descClassName: 'Extra class name',
  },
};

export const liquidMetalDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];
  const unlessDefault = <T,>(value: T, fallback: T) => (value === fallback ? undefined : value);

  return {
    slug: 'liquid-metal',
    title: 'Liquid Metal',
    category: 'Backgrounds',
    description: t.description,
    isNew: true,
    dependencies: ['WebGL'],
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: 'Components that come alive' },
      { type: 'color', name: 'color', label: t.colorLabel, default: DEFAULTS.color },
      {
        type: 'number',
        name: 'iridescence',
        label: t.iridescenceLabel,
        default: DEFAULTS.iridescence,
        min: 0,
        max: 1,
        step: 0.05,
      },
      { type: 'number', name: 'scale', label: t.scaleLabel, default: DEFAULTS.scale, min: 0.4, max: 2.5, step: 0.05 },
      { type: 'number', name: 'speed', label: t.speedLabel, default: DEFAULTS.speed, min: 0, max: 3, step: 0.1 },
      { type: 'boolean', name: 'interactive', label: t.interactiveLabel, default: true },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: 'color', type: 'string', default: `'${DEFAULTS.color}'`, description: t.descColor },
      { name: 'iridescence', type: 'number', default: String(DEFAULTS.iridescence), description: t.descIridescence },
      { name: 'scale', type: 'number', default: String(DEFAULTS.scale), description: t.descScale },
      { name: 'speed', type: 'number', default: String(DEFAULTS.speed), description: t.descSpeed },
      { name: 'interactive', type: 'boolean', default: 'true', description: t.descInteractive },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <LiquidMetalDemo
        text={v.text as string}
        color={v.color as string}
        iridescence={v.iridescence as number}
        scale={v.scale as number}
        speed={v.speed as number}
        interactive={v.interactive as boolean}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'LiquidMetal',
        propsType: 'LiquidMetalProps',
        name: 'Hero',
        props: {
          color: unlessDefault(v.color, DEFAULTS.color),
          iridescence: unlessDefault(v.iridescence, DEFAULTS.iridescence),
          scale: unlessDefault(v.scale, DEFAULTS.scale),
          speed: unlessDefault(v.speed, DEFAULTS.speed),
          interactive: v.interactive ? undefined : false,
        },
        children: `<h1>${v.text as string}</h1>`,
      }),
  };
};
