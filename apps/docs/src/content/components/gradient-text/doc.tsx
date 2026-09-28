import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const GradientTextDemo = lazy(() => import('./GradientTextDemo'));

const DEFAULTS = {
  text: 'Elyri',
  color1: '#6d5cff',
  color2: '#22d3ee',
  color3: '#f472b6',
  speed: 0.5,
};

const copy = {
  zh: {
    description: '渐变文字，配色与动画均可通过 props 或 CSS 变量覆盖。',
    textLabel: '文本',
    color1Label: '颜色 1',
    color2Label: '颜色 2',
    color3Label: '颜色 3',
    animatedLabel: '动画',
    speedLabel: '速度',
    descChildren: '文字内容',
    descColors: '渐变色列表',
    descAnimated: '是否播放流动动画',
    descSpeed: '动画速度倍率',
    descClassName: '自定义类名',
  },
  en: {
    description: 'Gradient text, with the palette and motion both overridable through props or CSS variables.',
    textLabel: 'Text',
    color1Label: 'Color 1',
    color2Label: 'Color 2',
    color3Label: 'Color 3',
    animatedLabel: 'Animate',
    speedLabel: 'Speed',
    descChildren: 'Text content',
    descColors: 'List of gradient colors',
    descAnimated: 'Whether the flowing animation plays',
    descSpeed: 'Animation speed multiplier',
    descClassName: 'Extra class name',
  },
};

export const gradientTextDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];
  const unlessDefault = <T,>(value: T, fallback: T) => (value === fallback ? undefined : value);

  return {
    slug: 'gradient-text',
    title: 'GradientText',
    category: 'Text',
    description: t.description,
    isNew: true,
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: DEFAULTS.text },
      { type: 'color', name: 'color1', label: t.color1Label, default: DEFAULTS.color1 },
      { type: 'color', name: 'color2', label: t.color2Label, default: DEFAULTS.color2 },
      { type: 'color', name: 'color3', label: t.color3Label, default: DEFAULTS.color3 },
      { type: 'boolean', name: 'animated', label: t.animatedLabel, default: true },
      { type: 'number', name: 'speed', label: t.speedLabel, default: DEFAULTS.speed, min: 0.2, max: 3, step: 0.1 },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      {
        name: 'colors',
        type: 'string[]',
        default: `['${DEFAULTS.color1}', '${DEFAULTS.color2}', '${DEFAULTS.color3}']`,
        description: t.descColors,
      },
      { name: 'animated', type: 'boolean', default: 'true', description: t.descAnimated },
      { name: 'speed', type: 'number', default: String(DEFAULTS.speed), description: t.descSpeed },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <GradientTextDemo
        text={v.text as string}
        colors={[v.color1, v.color2, v.color3] as string[]}
        animated={v.animated as boolean}
        speed={v.speed as number}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'GradientText',
        propsType: 'GradientTextProps',
        name: 'Title',
        props: {
          colors: [v.color1, v.color2, v.color3] as string[],
          animated: v.animated ? undefined : false,
          speed: unlessDefault(v.speed as number, DEFAULTS.speed),
        },
        children: v.text as string,
      }),
  };
};
