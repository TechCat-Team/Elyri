import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const AuroraDemo = lazy(() => import('./AuroraDemo'));

const DEFAULTS = {
  color1: '#3cffb0',
  color2: '#2a8cff',
  color3: '#c04dff',
  speed: 1,
  intensity: 1,
};

const copy = {
  zh: {
    description: 'WebGL 实时渲染的极光夜空：多层流动的光帘、竖向光束与闪烁星空，指针附近的极光会被点亮。',
    textLabel: '文本',
    color1Label: '帘底色',
    color2Label: '中段色',
    color3Label: '帘顶色',
    speedLabel: '速度',
    intensityLabel: '亮度',
    starsLabel: '星空',
    interactiveLabel: '指针增亮',
    descChildren: '叠加在背景之上的内容',
    descColors: '三段渐变色：帘底、中段、帘顶（hex）',
    descSpeed: '动画速度倍率',
    descIntensity: '极光亮度倍率',
    descStars: '是否显示星空',
    descInteractive: '指针附近的极光是否增亮',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'A WebGL aurora night sky with layered flowing curtains, vertical light rays and twinkling stars. Curtains brighten near the pointer.',
    textLabel: 'Text',
    color1Label: 'Bottom',
    color2Label: 'Middle',
    color3Label: 'Top',
    speedLabel: 'Speed',
    intensityLabel: 'Intensity',
    starsLabel: 'Stars',
    interactiveLabel: 'Pointer glow',
    descChildren: 'Content layered above the background',
    descColors: 'Three gradient stops: bottom, middle, top (hex)',
    descSpeed: 'Animation speed multiplier',
    descIntensity: 'Aurora brightness multiplier',
    descStars: 'Whether to show the starfield',
    descInteractive: 'Whether the aurora brightens near the pointer',
    descClassName: 'Extra class name',
  },
};

export const auroraDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];
  const unlessDefault = <T,>(value: T, fallback: T) => (value === fallback ? undefined : value);

  return {
    slug: 'aurora',
    title: 'Aurora',
    category: 'Backgrounds',
    description: t.description,
    dependencies: ['WebGL'],
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: 'Components that come alive' },
      { type: 'color', name: 'color1', label: t.color1Label, default: DEFAULTS.color1 },
      { type: 'color', name: 'color2', label: t.color2Label, default: DEFAULTS.color2 },
      { type: 'color', name: 'color3', label: t.color3Label, default: DEFAULTS.color3 },
      { type: 'number', name: 'speed', label: t.speedLabel, default: DEFAULTS.speed, min: 0, max: 3, step: 0.1 },
      {
        type: 'number',
        name: 'intensity',
        label: t.intensityLabel,
        default: DEFAULTS.intensity,
        min: 0,
        max: 2,
        step: 0.05,
      },
      { type: 'boolean', name: 'stars', label: t.starsLabel, default: true },
      { type: 'boolean', name: 'interactive', label: t.interactiveLabel, default: true },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      {
        name: 'colors',
        type: '[string, string, string]',
        default: `['${DEFAULTS.color1}', '${DEFAULTS.color2}', '${DEFAULTS.color3}']`,
        description: t.descColors,
      },
      { name: 'speed', type: 'number', default: String(DEFAULTS.speed), description: t.descSpeed },
      { name: 'intensity', type: 'number', default: String(DEFAULTS.intensity), description: t.descIntensity },
      { name: 'stars', type: 'boolean', default: 'true', description: t.descStars },
      { name: 'interactive', type: 'boolean', default: 'true', description: t.descInteractive },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <AuroraDemo
        text={v.text as string}
        colors={[v.color1, v.color2, v.color3] as [string, string, string]}
        speed={v.speed as number}
        intensity={v.intensity as number}
        stars={v.stars as boolean}
        interactive={v.interactive as boolean}
      />
    ),
    usage: (v, codeLang) => {
      const colors = [v.color1, v.color2, v.color3] as string[];
      const isDefaultColors = colors.join() === [DEFAULTS.color1, DEFAULTS.color2, DEFAULTS.color3].join();
      return usageExample(codeLang, {
        component: 'Aurora',
        propsType: 'AuroraProps',
        name: 'Hero',
        props: {
          colors: isDefaultColors ? undefined : colors,
          speed: unlessDefault(v.speed, DEFAULTS.speed),
          intensity: unlessDefault(v.intensity, DEFAULTS.intensity),
          stars: v.stars ? undefined : false,
          interactive: v.interactive ? undefined : false,
        },
        children: `<h1>${v.text as string}</h1>`,
      });
    },
  };
};
