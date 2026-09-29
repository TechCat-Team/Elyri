import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const MeshGradientDemo = lazy(() => import('./MeshGradientDemo'));

const DEFAULTS = {
  color1: '#6e6af0',
  color2: '#f472b6',
  color3: '#fbbf77',
  color4: '#38bdf8',
  grain: 0.35,
  speed: 1,
};

const copy = {
  zh: {
    description:
      'WebGL 实时渲染的流光渐变：四个色团经两级域扭曲拉成缓缓流淌的彩色丝带，在 Oklab 空间柔和融合，缎面光泽随流场滑过，叠一层细腻胶片颗粒。',
    textLabel: '文本',
    color1Label: '色团 1',
    color2Label: '色团 2',
    color3Label: '色团 3',
    color4Label: '色团 4',
    grainLabel: '颗粒',
    speedLabel: '速度',
    interactiveLabel: '跟随指针',
    descChildren: '叠加在背景之上的内容',
    descColors: '四个色团的颜色（hex）',
    descGrain: '胶片颗粒强度，0 为关闭',
    descSpeed: '动画速度倍率',
    descInteractive: '指针处的色彩漩涡是否跟随指针',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'A WebGL flowing gradient: four color blobs are domain-warped into slowly streaming ribbons, blended in Oklab, with a satin sheen gliding along the flow and fine film grain.',
    textLabel: 'Text',
    color1Label: 'Blob 1',
    color2Label: 'Blob 2',
    color3Label: 'Blob 3',
    color4Label: 'Blob 4',
    grainLabel: 'Grain',
    speedLabel: 'Speed',
    interactiveLabel: 'Follow pointer',
    descChildren: 'Content layered above the background',
    descColors: 'Colors of the four blobs (hex)',
    descGrain: 'Film grain strength, 0 disables it',
    descSpeed: 'Animation speed multiplier',
    descInteractive: 'Whether the color swirl follows the pointer',
    descClassName: 'Extra class name',
  },
};

type Colors = [string, string, string, string];

export const meshGradientDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];
  const unlessDefault = <T,>(value: T, fallback: T) => (value === fallback ? undefined : value);
  const defaultColors = [DEFAULTS.color1, DEFAULTS.color2, DEFAULTS.color3, DEFAULTS.color4];

  return {
    slug: 'mesh-gradient',
    title: 'MeshGradient',
    category: 'Backgrounds',
    description: t.description,
    hero: true,
    isNew: true,
    dependencies: ['WebGL'],
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: 'Components that come alive' },
      { type: 'color', name: 'color1', label: t.color1Label, default: DEFAULTS.color1 },
      { type: 'color', name: 'color2', label: t.color2Label, default: DEFAULTS.color2 },
      { type: 'color', name: 'color3', label: t.color3Label, default: DEFAULTS.color3 },
      { type: 'color', name: 'color4', label: t.color4Label, default: DEFAULTS.color4 },
      { type: 'number', name: 'grain', label: t.grainLabel, default: DEFAULTS.grain, min: 0, max: 1, step: 0.05 },
      { type: 'number', name: 'speed', label: t.speedLabel, default: DEFAULTS.speed, min: 0, max: 3, step: 0.1 },
      { type: 'boolean', name: 'interactive', label: t.interactiveLabel, default: true },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      {
        name: 'colors',
        type: '[string, string, string, string]',
        default: `[${defaultColors.map((c) => `'${c}'`).join(', ')}]`,
        description: t.descColors,
      },
      { name: 'grain', type: 'number', default: String(DEFAULTS.grain), description: t.descGrain },
      { name: 'speed', type: 'number', default: String(DEFAULTS.speed), description: t.descSpeed },
      { name: 'interactive', type: 'boolean', default: 'true', description: t.descInteractive },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <MeshGradientDemo
        text={v.text as string}
        colors={[v.color1, v.color2, v.color3, v.color4] as Colors}
        grain={v.grain as number}
        speed={v.speed as number}
        interactive={v.interactive as boolean}
      />
    ),
    usage: (v, codeLang) => {
      const colors = [v.color1, v.color2, v.color3, v.color4] as Colors;
      const isDefaultColors = colors.every((c, i) => c === defaultColors[i]);
      return usageExample(codeLang, {
        component: 'MeshGradient',
        propsType: 'MeshGradientProps',
        name: 'Hero',
        props: {
          colors: isDefaultColors ? undefined : colors,
          grain: unlessDefault(v.grain, DEFAULTS.grain),
          speed: unlessDefault(v.speed, DEFAULTS.speed),
          interactive: v.interactive ? undefined : false,
        },
        children: `<h1>${v.text as string}</h1>`,
      });
    },
  };
};
