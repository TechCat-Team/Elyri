import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const DotFieldDemo = lazy(() => import('./DotFieldDemo'));

const DEFAULTS = {
  color: '#8a90a6',
  highlightColor: '#7c6cff',
  gap: 22,
  speed: 1,
};

const copy = {
  zh: {
    description: 'WebGL 实时渲染的呼吸点阵：细点随缓慢的噪声波起伏明灭，指针处的点被放大、推开并染上强调色。',
    textLabel: '文本',
    colorLabel: '点颜色',
    highlightLabel: '强调色',
    gapLabel: '间距',
    speedLabel: '速度',
    interactiveLabel: '跟随指针',
    descChildren: '叠加在背景之上的内容',
    descColor: '点的底色（hex）',
    descHighlight: '波峰与指针附近的点所用的强调色（hex）',
    descGap: '点阵间距（CSS 像素）',
    descSpeed: '动画速度倍率',
    descInteractive: '指针附近的点是否被放大、推开',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'A WebGL breathing dot grid: fine dots swell and glow with slow noise waves, while dots near the pointer magnify, part and take the accent color.',
    textLabel: 'Text',
    colorLabel: 'Dot color',
    highlightLabel: 'Accent',
    gapLabel: 'Gap',
    speedLabel: 'Speed',
    interactiveLabel: 'Follow pointer',
    descChildren: 'Content layered above the background',
    descColor: 'Base dot color (hex)',
    descHighlight: 'Accent color for wave crests and dots near the pointer (hex)',
    descGap: 'Grid spacing in CSS pixels',
    descSpeed: 'Animation speed multiplier',
    descInteractive: 'Whether dots near the pointer magnify and part',
    descClassName: 'Extra class name',
  },
};

export const dotFieldDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];
  const unlessDefault = <T,>(value: T, fallback: T) => (value === fallback ? undefined : value);

  return {
    slug: 'dot-field',
    title: 'DotField',
    category: 'Backgrounds',
    description: t.description,
    isNew: true,
    dependencies: ['WebGL'],
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: 'Components that come alive' },
      { type: 'color', name: 'color', label: t.colorLabel, default: DEFAULTS.color },
      { type: 'color', name: 'highlightColor', label: t.highlightLabel, default: DEFAULTS.highlightColor },
      { type: 'number', name: 'gap', label: t.gapLabel, default: DEFAULTS.gap, min: 12, max: 48, step: 1 },
      { type: 'number', name: 'speed', label: t.speedLabel, default: DEFAULTS.speed, min: 0, max: 3, step: 0.1 },
      { type: 'boolean', name: 'interactive', label: t.interactiveLabel, default: true },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: 'color', type: 'string', default: `'${DEFAULTS.color}'`, description: t.descColor },
      { name: 'highlightColor', type: 'string', default: `'${DEFAULTS.highlightColor}'`, description: t.descHighlight },
      { name: 'gap', type: 'number', default: String(DEFAULTS.gap), description: t.descGap },
      { name: 'speed', type: 'number', default: String(DEFAULTS.speed), description: t.descSpeed },
      { name: 'interactive', type: 'boolean', default: 'true', description: t.descInteractive },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <DotFieldDemo
        text={v.text as string}
        color={v.color as string}
        highlightColor={v.highlightColor as string}
        gap={v.gap as number}
        speed={v.speed as number}
        interactive={v.interactive as boolean}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'DotField',
        propsType: 'DotFieldProps',
        name: 'Hero',
        props: {
          color: unlessDefault(v.color, DEFAULTS.color),
          highlightColor: unlessDefault(v.highlightColor, DEFAULTS.highlightColor),
          gap: unlessDefault(v.gap, DEFAULTS.gap),
          speed: unlessDefault(v.speed, DEFAULTS.speed),
          interactive: v.interactive ? undefined : false,
        },
        children: `<h1>${v.text as string}</h1>`,
      }),
  };
};
