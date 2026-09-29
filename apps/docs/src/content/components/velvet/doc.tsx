import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const VelvetDemo = lazy(() => import('./VelvetDemo'));

const DEFAULTS = {
  color: '#6a1230',
  sheenColor: '#ffb3c8',
  folds: 1,
  fuzz: 0.4,
  vignette: 0.5,
  speed: 1,
};

const copy = {
  zh: {
    description:
      'WebGL 实时渲染的丝绒：斜向垂坠的褶皱缓慢摆动，侧面泛起绒毛特有的柔光，指针划过压倒绒毛留下渐渐回弹的痕迹。',
    textLabel: '文本',
    colorLabel: '丝绒色',
    sheenLabel: '绒光色',
    foldsLabel: '褶皱密度',
    fuzzLabel: '绒毛质感',
    vignetteLabel: '暗角',
    speedLabel: '速度',
    interactiveLabel: '指针压痕',
    descChildren: '叠加在背景之上的内容',
    descColor: '丝绒本体色（hex）',
    descSheen: '绒面光晕色（hex）',
    descFolds: '褶皱密度倍率',
    descFuzz: '绒毛质感强度，0 为光洁、1 为明显的毛绒颗粒',
    descVignette: '四周暗角强度，0 为无暗角',
    descSpeed: '动画速度倍率',
    descInteractive: '光源是否跟随指针，指针划过是否留下渐消的压痕',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'WebGL velvet: diagonal drapes that sway slowly, a soft pile sheen along the folds, and pointer strokes that flatten the nap and fade back.',
    textLabel: 'Text',
    colorLabel: 'Velvet',
    sheenLabel: 'Sheen',
    foldsLabel: 'Folds',
    fuzzLabel: 'Fuzz',
    vignetteLabel: 'Vignette',
    speedLabel: 'Speed',
    interactiveLabel: 'Pointer trails',
    descChildren: 'Content layered above the background',
    descColor: 'Velvet body color (hex)',
    descSheen: 'Pile sheen color (hex)',
    descFolds: 'Fold density multiplier',
    descFuzz: 'Pile texture strength, 0 is smooth and 1 is visibly fuzzy',
    descVignette: 'Edge darkening strength, 0 disables it',
    descSpeed: 'Animation speed multiplier',
    descInteractive: 'Whether the light follows the pointer and strokes leave fading trails',
    descClassName: 'Extra class name',
  },
};

export const velvetDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];
  const unlessDefault = <T,>(value: T, fallback: T) => (value === fallback ? undefined : value);

  return {
    slug: 'velvet',
    title: 'Velvet',
    category: 'Backgrounds',
    description: t.description,
    dependencies: ['WebGL'],
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: 'Components that come alive' },
      { type: 'color', name: 'color', label: t.colorLabel, default: DEFAULTS.color },
      { type: 'color', name: 'sheenColor', label: t.sheenLabel, default: DEFAULTS.sheenColor },
      { type: 'number', name: 'folds', label: t.foldsLabel, default: DEFAULTS.folds, min: 0.4, max: 2.5, step: 0.05 },
      { type: 'number', name: 'fuzz', label: t.fuzzLabel, default: DEFAULTS.fuzz, min: 0, max: 1, step: 0.05 },
      {
        type: 'number',
        name: 'vignette',
        label: t.vignetteLabel,
        default: DEFAULTS.vignette,
        min: 0,
        max: 1,
        step: 0.05,
      },
      { type: 'number', name: 'speed', label: t.speedLabel, default: DEFAULTS.speed, min: 0, max: 3, step: 0.1 },
      { type: 'boolean', name: 'interactive', label: t.interactiveLabel, default: true },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: 'color', type: 'string', default: `'${DEFAULTS.color}'`, description: t.descColor },
      { name: 'sheenColor', type: 'string', default: `'${DEFAULTS.sheenColor}'`, description: t.descSheen },
      { name: 'folds', type: 'number', default: String(DEFAULTS.folds), description: t.descFolds },
      { name: 'fuzz', type: 'number', default: String(DEFAULTS.fuzz), description: t.descFuzz },
      { name: 'vignette', type: 'number', default: String(DEFAULTS.vignette), description: t.descVignette },
      { name: 'speed', type: 'number', default: String(DEFAULTS.speed), description: t.descSpeed },
      { name: 'interactive', type: 'boolean', default: 'true', description: t.descInteractive },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <VelvetDemo
        text={v.text as string}
        color={v.color as string}
        sheenColor={v.sheenColor as string}
        folds={v.folds as number}
        fuzz={v.fuzz as number}
        vignette={v.vignette as number}
        speed={v.speed as number}
        interactive={v.interactive as boolean}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'Velvet',
        propsType: 'VelvetProps',
        name: 'Hero',
        props: {
          color: unlessDefault(v.color, DEFAULTS.color),
          sheenColor: unlessDefault(v.sheenColor, DEFAULTS.sheenColor),
          folds: unlessDefault(v.folds, DEFAULTS.folds),
          fuzz: unlessDefault(v.fuzz, DEFAULTS.fuzz),
          vignette: unlessDefault(v.vignette, DEFAULTS.vignette),
          speed: unlessDefault(v.speed, DEFAULTS.speed),
          interactive: v.interactive ? undefined : false,
        },
        children: `<h1>${v.text as string}</h1>`,
      }),
  };
};
