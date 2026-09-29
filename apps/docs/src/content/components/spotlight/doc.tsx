import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const SpotlightDemo = lazy(() => import('./SpotlightDemo'));

const DEFAULTS = {
  color: '#7c8cff',
  size: 240,
  glow: true,
  borderGlow: true,
  radius: 16,
};

const copy = {
  zh: {
    description:
      '卡片内跟随指针的径向聚光，可叠加指针附近的边框光晕；内部元素加 elyri-spotlight__item 类即可点亮自身边框，常用于功能卡片与定价区块。',
    colorLabel: '光斑颜色',
    sizeLabel: '光斑半径 (px)',
    glowLabel: '内部光晕',
    borderGlowLabel: '边框光晕',
    radiusLabel: '圆角 (px)',
    descChildren: '卡片内容',
    descColor: '光斑与边框光晕的颜色',
    descSize: '光斑半径（像素）',
    descGlow: '是否显示卡片内部跟随指针的径向光晕',
    descBorderGlow: '是否显示指针附近的边框光晕',
    descRadius: '卡片圆角（像素）',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'A radial spotlight that follows the pointer inside a card, with an optional glow along the border; add the elyri-spotlight__item class to any inner element to light up its own border. Great for feature grids and pricing cards.',
    colorLabel: 'Color',
    sizeLabel: 'Size (px)',
    glowLabel: 'Inner glow',
    borderGlowLabel: 'Border glow',
    radiusLabel: 'Radius (px)',
    descChildren: 'Card content',
    descColor: 'Color of the spotlight and the border glow',
    descSize: 'Spotlight radius in pixels',
    descGlow: 'Whether to show the radial glow that follows the pointer inside the card',
    descBorderGlow: 'Whether to light up the border near the pointer',
    descRadius: 'Card corner radius in pixels',
    descClassName: 'Extra class name',
  },
};

export const spotlightDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'spotlight',
    title: 'Spotlight',
    category: 'Animations',
    description: t.description,
    dependencies: ['PointerEvent'],
    controls: [
      { type: 'color', name: 'color', label: t.colorLabel, default: DEFAULTS.color },
      { type: 'number', name: 'size', label: t.sizeLabel, default: DEFAULTS.size, min: 80, max: 600, step: 20 },
      { type: 'boolean', name: 'glow', label: t.glowLabel, default: DEFAULTS.glow },
      { type: 'boolean', name: 'borderGlow', label: t.borderGlowLabel, default: DEFAULTS.borderGlow },
      { type: 'number', name: 'radius', label: t.radiusLabel, default: DEFAULTS.radius, min: 0, max: 32, step: 2 },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: 'color', type: 'string', default: `'${DEFAULTS.color}'`, description: t.descColor },
      { name: 'size', type: 'number', default: String(DEFAULTS.size), description: t.descSize },
      { name: 'glow', type: 'boolean', default: 'true', description: t.descGlow },
      { name: 'borderGlow', type: 'boolean', default: 'true', description: t.descBorderGlow },
      { name: 'radius', type: 'number', default: String(DEFAULTS.radius), description: t.descRadius },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <SpotlightDemo
        color={v.color as string}
        size={v.size as number}
        glow={v.glow as boolean}
        borderGlow={v.borderGlow as boolean}
        radius={v.radius as number}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'Spotlight',
        propsType: 'SpotlightProps',
        name: 'Card',
        props: {
          color: v.color === DEFAULTS.color ? undefined : (v.color as string),
          size: v.size === DEFAULTS.size ? undefined : v.size,
          glow: v.glow ? undefined : false,
          borderGlow: v.borderGlow ? undefined : false,
          radius: v.radius === DEFAULTS.radius ? undefined : v.radius,
        },
        children: `<div>
      Card content
      <button className="elyri-spotlight__item">Learn More</button>
    </div>`,
      }),
  };
};
