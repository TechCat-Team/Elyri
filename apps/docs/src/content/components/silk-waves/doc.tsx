import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const SilkWavesDemo = lazy(() => import('./SilkWavesDemo'));

const DEFAULTS = {
  color: '#9a6424',
  highlightColor: '#ffe3b0',
  folds: 1,
  speed: 1,
};

const copy = {
  zh: {
    description: 'WebGL 实时渲染的流动丝绸：连续起伏的褶皱、缎面光泽与随指针移动的高光。',
    textLabel: '文本',
    colorLabel: '丝绸色',
    highlightLabel: '光泽色',
    foldsLabel: '褶皱密度',
    speedLabel: '速度',
    interactiveLabel: '跟随指针',
    descChildren: '叠加在背景之上的内容',
    descColor: '丝绸本体色（hex）',
    descHighlight: '光泽高光色（hex）',
    descFolds: '褶皱密度倍率',
    descSpeed: '动画速度倍率',
    descInteractive: '光源是否跟随指针',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'A WebGL flowing silk surface with rolling folds, satin sheen and a highlight that follows the pointer.',
    textLabel: 'Text',
    colorLabel: 'Silk color',
    highlightLabel: 'Sheen',
    foldsLabel: 'Folds',
    speedLabel: 'Speed',
    interactiveLabel: 'Follow pointer',
    descChildren: 'Content layered above the background',
    descColor: 'Silk body color (hex)',
    descHighlight: 'Sheen highlight color (hex)',
    descFolds: 'Fold density multiplier',
    descSpeed: 'Animation speed multiplier',
    descInteractive: 'Whether the light follows the pointer',
    descClassName: 'Extra class name',
  },
};

export const silkWavesDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];
  const unlessDefault = <T,>(value: T, fallback: T) => (value === fallback ? undefined : value);

  return {
    slug: 'silk-waves',
    title: 'SilkWaves',
    category: 'Backgrounds',
    description: t.description,
    isNew: true,
    dependencies: ['WebGL'],
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: 'Components that come alive' },
      { type: 'color', name: 'color', label: t.colorLabel, default: DEFAULTS.color },
      { type: 'color', name: 'highlightColor', label: t.highlightLabel, default: DEFAULTS.highlightColor },
      { type: 'number', name: 'folds', label: t.foldsLabel, default: DEFAULTS.folds, min: 0.4, max: 2.5, step: 0.05 },
      { type: 'number', name: 'speed', label: t.speedLabel, default: DEFAULTS.speed, min: 0, max: 3, step: 0.1 },
      { type: 'boolean', name: 'interactive', label: t.interactiveLabel, default: true },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: 'color', type: 'string', default: `'${DEFAULTS.color}'`, description: t.descColor },
      { name: 'highlightColor', type: 'string', default: `'${DEFAULTS.highlightColor}'`, description: t.descHighlight },
      { name: 'folds', type: 'number', default: String(DEFAULTS.folds), description: t.descFolds },
      { name: 'speed', type: 'number', default: String(DEFAULTS.speed), description: t.descSpeed },
      { name: 'interactive', type: 'boolean', default: 'true', description: t.descInteractive },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <SilkWavesDemo
        text={v.text as string}
        color={v.color as string}
        highlightColor={v.highlightColor as string}
        folds={v.folds as number}
        speed={v.speed as number}
        interactive={v.interactive as boolean}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'SilkWaves',
        propsType: 'SilkWavesProps',
        name: 'Hero',
        props: {
          color: unlessDefault(v.color, DEFAULTS.color),
          highlightColor: unlessDefault(v.highlightColor, DEFAULTS.highlightColor),
          folds: unlessDefault(v.folds, DEFAULTS.folds),
          speed: unlessDefault(v.speed, DEFAULTS.speed),
          interactive: v.interactive ? undefined : false,
        },
        children: `<h1>${v.text as string}</h1>`,
      }),
  };
};
