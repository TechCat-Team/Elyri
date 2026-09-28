import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const BrushedMetalDemo = lazy(() => import('./BrushedMetalDemo'));

const DEFAULTS = {
  color: '#c3c7cf',
  angle: 0,
  speed: 1,
};

const copy = {
  zh: {
    description:
      'WebGL 实时渲染的拉丝金属板：细密的定向划纹，点光源被各向异性反射拉成垂直于拉丝方向的光柱，随指针在板面上滑动。',
    textLabel: '文本',
    colorLabel: '金属色',
    angleLabel: '拉丝角度',
    speedLabel: '速度',
    interactiveLabel: '光源跟随指针',
    descChildren: '叠加在背景之上的内容',
    descColor: '金属颜色（hex）',
    descAngle: '拉丝方向角度（度），0 为水平',
    descSpeed: '动画速度倍率',
    descInteractive: '光源是否跟随指针',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'WebGL brushed metal plate: fine directional grain, with anisotropic reflection stretching the light into a beam across the brushing that glides with the pointer.',
    textLabel: 'Text',
    colorLabel: 'Metal',
    angleLabel: 'Angle',
    speedLabel: 'Speed',
    interactiveLabel: 'Follow pointer',
    descChildren: 'Content layered above the background',
    descColor: 'Metal color (hex)',
    descAngle: 'Brushing direction in degrees, 0 is horizontal',
    descSpeed: 'Animation speed multiplier',
    descInteractive: 'Whether the light follows the pointer',
    descClassName: 'Extra class name',
  },
};

export const brushedMetalDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];
  const unlessDefault = <T,>(value: T, fallback: T) => (value === fallback ? undefined : value);

  return {
    slug: 'brushed-metal',
    title: 'Brushed Metal',
    category: 'Backgrounds',
    description: t.description,
    isNew: true,
    dependencies: ['WebGL'],
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: 'Components that come alive' },
      { type: 'color', name: 'color', label: t.colorLabel, default: DEFAULTS.color },
      { type: 'number', name: 'angle', label: t.angleLabel, default: DEFAULTS.angle, min: -90, max: 90, step: 1 },
      { type: 'number', name: 'speed', label: t.speedLabel, default: DEFAULTS.speed, min: 0, max: 3, step: 0.1 },
      { type: 'boolean', name: 'interactive', label: t.interactiveLabel, default: true },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: 'color', type: 'string', default: `'${DEFAULTS.color}'`, description: t.descColor },
      { name: 'angle', type: 'number', default: String(DEFAULTS.angle), description: t.descAngle },
      { name: 'speed', type: 'number', default: String(DEFAULTS.speed), description: t.descSpeed },
      { name: 'interactive', type: 'boolean', default: 'true', description: t.descInteractive },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <BrushedMetalDemo
        text={v.text as string}
        color={v.color as string}
        angle={v.angle as number}
        speed={v.speed as number}
        interactive={v.interactive as boolean}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'BrushedMetal',
        propsType: 'BrushedMetalProps',
        name: 'Hero',
        props: {
          color: unlessDefault(v.color, DEFAULTS.color),
          angle: unlessDefault(v.angle, DEFAULTS.angle),
          speed: unlessDefault(v.speed, DEFAULTS.speed),
          interactive: v.interactive ? undefined : false,
        },
        children: `<h1>${v.text as string}</h1>`,
      }),
  };
};
