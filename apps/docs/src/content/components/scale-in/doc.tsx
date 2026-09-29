import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const ScaleInDemo = lazy(() => import('./ScaleInDemo'));

const DEFAULTS = {
  from: 0.9,
  duration: 600,
  stagger: 120,
  once: true,
};

const copy = {
  zh: {
    description: '元素进入视口时缩放并淡入，自动尊重系统的减弱动态效果偏好。',
    fromLabel: '起始缩放',
    durationLabel: '时长 (ms)',
    staggerLabel: '依次延迟 (ms)',
    onceLabel: '仅触发一次',
    descChildren: '需要缩放进入的内容',
    descFrom: '起始缩放比例，1 表示与最终尺寸相同',
    descDelay: '延迟（毫秒）',
    descDuration: '动画时长（毫秒）',
    descOnce: '是否只在首次进入视口时触发',
    descClassName: '自定义类名',
    items: ['第一个卡片', '第二个卡片', '第三个卡片'],
  },
  en: {
    description: 'Scales and fades content in when it enters the viewport, respecting reduced-motion preferences.',
    fromLabel: 'From scale',
    durationLabel: 'Duration (ms)',
    staggerLabel: 'Stagger (ms)',
    onceLabel: 'Play once',
    descChildren: 'Content to scale in',
    descFrom: 'Starting scale, where 1 matches the final size',
    descDelay: 'Delay in milliseconds',
    descDuration: 'Animation duration in milliseconds',
    descOnce: 'Only trigger the first time it enters the viewport',
    descClassName: 'Extra class name',
    items: ['First card', 'Second card', 'Third card'],
  },
};

export const scaleInDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'scale-in',
    title: 'ScaleIn',
    category: 'Animations',
    description: t.description,
    dependencies: ['IntersectionObserver'],
    controls: [
      { type: 'number', name: 'from', label: t.fromLabel, default: DEFAULTS.from, min: 0.2, max: 1, step: 0.05 },
      {
        type: 'number',
        name: 'duration',
        label: t.durationLabel,
        default: DEFAULTS.duration,
        min: 100,
        max: 2000,
        step: 50,
      },
      { type: 'number', name: 'stagger', label: t.staggerLabel, default: DEFAULTS.stagger, min: 0, max: 600, step: 20 },
      { type: 'boolean', name: 'once', label: t.onceLabel, default: DEFAULTS.once },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: 'from', type: 'number', default: String(DEFAULTS.from), description: t.descFrom },
      { name: 'delay', type: 'number', default: '0', description: t.descDelay },
      { name: 'duration', type: 'number', default: String(DEFAULTS.duration), description: t.descDuration },
      { name: 'once', type: 'boolean', default: 'true', description: t.descOnce },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <ScaleInDemo
        from={v.from as number}
        duration={v.duration as number}
        stagger={v.stagger as number}
        once={v.once as boolean}
        items={t.items}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'ScaleIn',
        propsType: 'ScaleInProps',
        name: 'Reveal',
        props: {
          from: v.from === DEFAULTS.from ? undefined : v.from,
          duration: v.duration === DEFAULTS.duration ? undefined : v.duration,
          delay: v.stagger || undefined,
          once: v.once ? undefined : false,
        },
        children: '<div>Hello</div>',
      }),
  };
};
