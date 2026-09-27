import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const GradientTextDemo = lazy(() => import('./GradientTextDemo'));

const copy = {
  zh: {
    description: '渐变文字，配色与动画均可通过 props 或 CSS 变量覆盖。',
    textLabel: '文本',
    color1Label: '颜色 1',
    color2Label: '颜色 2',
    color3Label: '颜色 3',
    animatedLabel: '动画',
    descChildren: '文字内容',
    descColors: '渐变色列表',
    descAnimated: '是否播放流动动画',
    descClassName: '自定义类名',
  },
  en: {
    description: 'Gradient text, with the palette and motion both overridable through props or CSS variables.',
    textLabel: 'Text',
    color1Label: 'Color 1',
    color2Label: 'Color 2',
    color3Label: 'Color 3',
    animatedLabel: 'Animate',
    descChildren: 'Text content',
    descColors: 'List of gradient colors',
    descAnimated: 'Whether the flowing animation plays',
    descClassName: 'Extra class name',
  },
};

export const gradientTextDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'gradient-text',
    title: 'GradientText',
    category: 'Text',
    description: t.description,
    isNew: true,
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: 'Elyri' },
      { type: 'color', name: 'color1', label: t.color1Label, default: '#6d5cff' },
      { type: 'color', name: 'color2', label: t.color2Label, default: '#22d3ee' },
      { type: 'color', name: 'color3', label: t.color3Label, default: '#f472b6' },
      { type: 'boolean', name: 'animated', label: t.animatedLabel, default: true },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      {
        name: 'colors',
        type: 'string[]',
        default: "['#6d5cff', '#22d3ee', '#f472b6']",
        description: t.descColors,
      },
      { name: 'animated', type: 'boolean', default: 'true', description: t.descAnimated },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <GradientTextDemo
        text={v.text as string}
        colors={[v.color1, v.color2, v.color3] as string[]}
        animated={v.animated as boolean}
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
        },
        children: v.text as string,
      }),
  };
};
