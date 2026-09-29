import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const MorphGridDemo = lazy(() => import('./MorphGridDemo'));

const DEFAULTS = {
  color: '#141233',
  shapeColor: '#6ee7d8',
  accentColor: '#ff8fb1',
  density: 8,
  warp: 0,
  spread: 0.4,
  accent: 0.03,
  speed: 3,
};

const copy = {
  zh: {
    description:
      'WebGL 形变网格：全屏图形在圆形、方形、十字之间循环丝滑变换，切换从中心向外波状扩散；网格带透镜放大，零星格子被点亮，透镜中心跟随指针。',
    colorLabel: '底色',
    shapeColorLabel: '图形色',
    accentColorLabel: '高亮色',
    densityLabel: '密度',
    warpLabel: '透镜强度',
    spreadLabel: '扩散延迟',
    accentLabel: '高亮比例',
    speedLabel: '速度',
    interactiveLabel: '跟随指针',
    descChildren: '叠加在背景之上的内容',
    descColor: '底色（hex）',
    descShapeColor: '图形颜色（hex）',
    descAccentColor: '随机点亮的高亮色（hex）',
    descDensity: '短边方向上的格子数，越大图形越密',
    descWarp: '透镜放大强度，0 为关闭',
    descSpread: '形变由中心向外扩散的延迟（0-0.6），0 为全屏同时切换',
    descAccent: '被点亮格子的比例（0-1）',
    descSpeed: '动画速度倍率',
    descInteractive: '透镜中心是否跟随指针',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'A WebGL morphing grid: every shape smoothly cycles between circle, square and cross, with each change rippling outward from the center. The grid is lens-warped, a few cells light up, and the lens follows the pointer.',
    colorLabel: 'Background',
    shapeColorLabel: 'Shape',
    accentColorLabel: 'Accent',
    densityLabel: 'Density',
    warpLabel: 'Lens',
    spreadLabel: 'Spread',
    accentLabel: 'Accent ratio',
    speedLabel: 'Speed',
    interactiveLabel: 'Follow pointer',
    descChildren: 'Content layered above the background',
    descColor: 'Background color (hex)',
    descShapeColor: 'Shape color (hex)',
    descAccentColor: 'Color of randomly lit cells (hex)',
    descDensity: 'Number of cells across the short side; higher means denser',
    descWarp: 'Lens magnification strength, 0 disables it',
    descSpread: 'Delay of the morph rippling outward from the center (0-0.6), 0 morphs everything at once',
    descAccent: 'Fraction of cells that light up (0-1)',
    descSpeed: 'Animation speed multiplier',
    descInteractive: 'Whether the lens center follows the pointer',
    descClassName: 'Extra class name',
  },
};

export const morphGridDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];
  const unlessDefault = <T,>(value: T, fallback: T) => (value === fallback ? undefined : value);

  return {
    slug: 'morph-grid',
    title: 'Morph Grid',
    category: 'Backgrounds',
    description: t.description,
    dependencies: ['WebGL'],
    controls: [
      { type: 'color', name: 'color', label: t.colorLabel, default: DEFAULTS.color },
      { type: 'color', name: 'shapeColor', label: t.shapeColorLabel, default: DEFAULTS.shapeColor },
      { type: 'color', name: 'accentColor', label: t.accentColorLabel, default: DEFAULTS.accentColor },
      { type: 'number', name: 'density', label: t.densityLabel, default: DEFAULTS.density, min: 3, max: 20, step: 1 },
      { type: 'number', name: 'warp', label: t.warpLabel, default: DEFAULTS.warp, min: 0, max: 2, step: 0.1 },
      { type: 'number', name: 'spread', label: t.spreadLabel, default: DEFAULTS.spread, min: 0, max: 0.6, step: 0.05 },
      { type: 'number', name: 'accent', label: t.accentLabel, default: DEFAULTS.accent, min: 0, max: 0.3, step: 0.01 },
      { type: 'number', name: 'speed', label: t.speedLabel, default: DEFAULTS.speed, min: 0, max: 3, step: 0.1 },
      { type: 'boolean', name: 'interactive', label: t.interactiveLabel, default: true },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: 'color', type: 'string', default: `'${DEFAULTS.color}'`, description: t.descColor },
      { name: 'shapeColor', type: 'string', default: `'${DEFAULTS.shapeColor}'`, description: t.descShapeColor },
      { name: 'accentColor', type: 'string', default: `'${DEFAULTS.accentColor}'`, description: t.descAccentColor },
      { name: 'density', type: 'number', default: String(DEFAULTS.density), description: t.descDensity },
      { name: 'warp', type: 'number', default: String(DEFAULTS.warp), description: t.descWarp },
      { name: 'spread', type: 'number', default: String(DEFAULTS.spread), description: t.descSpread },
      { name: 'accent', type: 'number', default: String(DEFAULTS.accent), description: t.descAccent },
      { name: 'speed', type: 'number', default: String(DEFAULTS.speed), description: t.descSpeed },
      { name: 'interactive', type: 'boolean', default: 'true', description: t.descInteractive },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <MorphGridDemo
        color={v.color as string}
        shapeColor={v.shapeColor as string}
        accentColor={v.accentColor as string}
        density={v.density as number}
        warp={v.warp as number}
        spread={v.spread as number}
        accent={v.accent as number}
        speed={v.speed as number}
        interactive={v.interactive as boolean}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'MorphGrid',
        propsType: 'MorphGridProps',
        name: 'Hero',
        props: {
          color: unlessDefault(v.color, DEFAULTS.color),
          shapeColor: unlessDefault(v.shapeColor, DEFAULTS.shapeColor),
          accentColor: unlessDefault(v.accentColor, DEFAULTS.accentColor),
          density: unlessDefault(v.density, DEFAULTS.density),
          warp: unlessDefault(v.warp, DEFAULTS.warp),
          spread: unlessDefault(v.spread, DEFAULTS.spread),
          accent: unlessDefault(v.accent, DEFAULTS.accent),
          speed: unlessDefault(v.speed, DEFAULTS.speed),
          interactive: v.interactive ? undefined : false,
        },
      }),
  };
};
