import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const HaloDemo = lazy(() => import('./HaloDemo'));

const DEFAULTS = {
  color1: '#8fb4ff',
  color2: '#e7c6ff',
  size: 1,
  speed: 1,
};

const copy = {
  zh: {
    description: 'WebGL 实时渲染的极简光环：画面中央一圈发丝般的细光，两束高光沿圆周缓缓流动，其余区域留白。',
    textLabel: '文本',
    color1Label: '主色',
    color2Label: '渐变色',
    sizeLabel: '尺寸',
    speedLabel: '速度',
    interactiveLabel: '跟随指针',
    descChildren: '叠加在背景之上的内容',
    descColors: '沿圆周流转的两种渐变色（hex）',
    descSize: '光环半径倍率',
    descSpeed: '动画速度倍率',
    descInteractive: '光环中心是否轻微偏向指针',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'A minimal WebGL halo: a single hairline ring of light at the center, with two highlights drifting around it and generous empty space.',
    textLabel: 'Text',
    color1Label: 'Primary',
    color2Label: 'Gradient',
    sizeLabel: 'Size',
    speedLabel: 'Speed',
    interactiveLabel: 'Follow pointer',
    descChildren: 'Content layered above the background',
    descColors: 'Two gradient colors flowing around the ring (hex)',
    descSize: 'Ring radius multiplier',
    descSpeed: 'Animation speed multiplier',
    descInteractive: 'Whether the ring center leans slightly toward the pointer',
    descClassName: 'Extra class name',
  },
};

export const haloDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];
  const unlessDefault = <T,>(value: T, fallback: T) => (value === fallback ? undefined : value);

  return {
    slug: 'halo',
    title: 'Halo',
    category: 'Backgrounds',
    description: t.description,
    hero: true,
    dependencies: ['WebGL'],
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: 'Components that come alive' },
      { type: 'color', name: 'color1', label: t.color1Label, default: DEFAULTS.color1 },
      { type: 'color', name: 'color2', label: t.color2Label, default: DEFAULTS.color2 },
      { type: 'number', name: 'size', label: t.sizeLabel, default: DEFAULTS.size, min: 0.5, max: 1.6, step: 0.05 },
      { type: 'number', name: 'speed', label: t.speedLabel, default: DEFAULTS.speed, min: 0, max: 3, step: 0.1 },
      { type: 'boolean', name: 'interactive', label: t.interactiveLabel, default: true },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      {
        name: 'colors',
        type: '[string, string]',
        default: `['${DEFAULTS.color1}', '${DEFAULTS.color2}']`,
        description: t.descColors,
      },
      { name: 'size', type: 'number', default: String(DEFAULTS.size), description: t.descSize },
      { name: 'speed', type: 'number', default: String(DEFAULTS.speed), description: t.descSpeed },
      { name: 'interactive', type: 'boolean', default: 'true', description: t.descInteractive },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <HaloDemo
        text={v.text as string}
        colors={[v.color1, v.color2] as [string, string]}
        size={v.size as number}
        speed={v.speed as number}
        interactive={v.interactive as boolean}
      />
    ),
    usage: (v, codeLang) => {
      const colors = [v.color1, v.color2] as string[];
      const isDefaultColors = colors.join() === [DEFAULTS.color1, DEFAULTS.color2].join();
      return usageExample(codeLang, {
        component: 'Halo',
        propsType: 'HaloProps',
        name: 'Hero',
        props: {
          colors: isDefaultColors ? undefined : colors,
          size: unlessDefault(v.size, DEFAULTS.size),
          speed: unlessDefault(v.speed, DEFAULTS.speed),
          interactive: v.interactive ? undefined : false,
        },
        children: `<h1>${v.text as string}</h1>`,
      });
    },
  };
};
