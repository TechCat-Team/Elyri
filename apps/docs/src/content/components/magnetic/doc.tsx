import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const MagneticDemo = lazy(() => import('./MagneticDemo'));

const DEFAULTS = {
  strength: 0.35,
  range: 120,
  resetDuration: 400,
};

const copy = {
  zh: {
    description: '指针靠近时元素被吸附跟随，离开后缓动回正，适合按钮、图标等小元素；减弱动态效果下自动禁用。',
    strengthLabel: '吸附强度',
    rangeLabel: '触发范围 (px)',
    resetDurationLabel: '回正时长 (ms)',
    descChildren: '需要磁吸效果的内容',
    descStrength: '吸附强度（0-1），元素向指针偏移的距离比例',
    descRange: '元素边缘向外扩展的触发范围（像素）',
    descResetDuration: '指针离开触发范围后的回正时长（毫秒）',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'Pulls the element toward the pointer while it hovers nearby and eases back on leave, ideal for buttons and icons; disabled under reduced motion.',
    strengthLabel: 'Strength',
    rangeLabel: 'Range (px)',
    resetDurationLabel: 'Reset duration (ms)',
    descChildren: 'Content to magnetize',
    descStrength: 'Attraction strength between 0 and 1; the fraction of the pointer distance the element travels',
    descRange: 'Distance in pixels beyond the element edges that triggers the attraction',
    descResetDuration: 'Time in milliseconds to ease back after the pointer leaves the range',
    descClassName: 'Extra class name',
  },
};

export const magneticDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'magnetic',
    title: 'Magnetic',
    category: 'Animations',
    description: t.description,
    isNew: true,
    dependencies: ['PointerEvent'],
    controls: [
      {
        type: 'number',
        name: 'strength',
        label: t.strengthLabel,
        default: DEFAULTS.strength,
        min: 0.05,
        max: 1,
        step: 0.05,
      },
      { type: 'number', name: 'range', label: t.rangeLabel, default: DEFAULTS.range, min: 40, max: 300, step: 10 },
      {
        type: 'number',
        name: 'resetDuration',
        label: t.resetDurationLabel,
        default: DEFAULTS.resetDuration,
        min: 100,
        max: 1200,
        step: 50,
      },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: 'strength', type: 'number', default: String(DEFAULTS.strength), description: t.descStrength },
      { name: 'range', type: 'number', default: String(DEFAULTS.range), description: t.descRange },
      {
        name: 'resetDuration',
        type: 'number',
        default: String(DEFAULTS.resetDuration),
        description: t.descResetDuration,
      },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <MagneticDemo
        strength={v.strength as number}
        range={v.range as number}
        resetDuration={v.resetDuration as number}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'Magnetic',
        propsType: 'MagneticProps',
        name: 'MagneticButton',
        props: {
          strength: v.strength === DEFAULTS.strength ? undefined : v.strength,
          range: v.range === DEFAULTS.range ? undefined : v.range,
          resetDuration: v.resetDuration === DEFAULTS.resetDuration ? undefined : v.resetDuration,
        },
        children: '<button>Hover me</button>',
      }),
  };
};
