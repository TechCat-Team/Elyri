import { lazy } from 'react';

import type { FadeInDirection } from 'elyri';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const FadeInDemo = lazy(() => import('./FadeInDemo'));

const copy = {
  zh: {
    description: '元素进入视口时淡入位移，自动尊重系统的减弱动态效果偏好。',
    directionLabel: '方向',
    durationLabel: '时长 (ms)',
    distanceLabel: '位移 (px)',
    staggerLabel: '依次延迟 (ms)',
    onceLabel: '仅触发一次',
    descChildren: '需要淡入的内容',
    descDirection: '进入方向',
    descDelay: '延迟（毫秒）',
    descDuration: '动画时长（毫秒）',
    descDistance: '位移距离（像素）',
    descOnce: '是否只在首次进入视口时触发',
    descClassName: '自定义类名',
    items: ['第一个卡片', '第二个卡片', '第三个卡片'],
  },
  en: {
    description: 'Fades and slides content in when it enters the viewport, respecting reduced-motion preferences.',
    directionLabel: 'Direction',
    durationLabel: 'Duration (ms)',
    distanceLabel: 'Distance (px)',
    staggerLabel: 'Stagger (ms)',
    onceLabel: 'Play once',
    descChildren: 'Content to fade in',
    descDirection: 'Direction the element enters from',
    descDelay: 'Delay in milliseconds',
    descDuration: 'Animation duration in milliseconds',
    descDistance: 'Travel distance in pixels',
    descOnce: 'Only trigger the first time it enters the viewport',
    descClassName: 'Extra class name',
    items: ['First card', 'Second card', 'Third card'],
  },
};

export const fadeInDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'fade-in',
    title: 'FadeIn',
    category: 'Animations',
    description: t.description,
    dependencies: ['IntersectionObserver'],
    controls: [
      {
        type: 'select',
        name: 'direction',
        label: t.directionLabel,
        default: 'up',
        options: ['up', 'down', 'left', 'right', 'none'],
      },
      { type: 'number', name: 'duration', label: t.durationLabel, default: 600, min: 100, max: 2000, step: 50 },
      { type: 'number', name: 'distance', label: t.distanceLabel, default: 24, min: 0, max: 120 },
      { type: 'number', name: 'stagger', label: t.staggerLabel, default: 120, min: 0, max: 600, step: 20 },
      { type: 'boolean', name: 'once', label: t.onceLabel, default: true },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      {
        name: 'direction',
        type: "'up' | 'down' | 'left' | 'right' | 'none'",
        default: "'up'",
        description: t.descDirection,
      },
      { name: 'delay', type: 'number', default: '0', description: t.descDelay },
      { name: 'duration', type: 'number', default: '600', description: t.descDuration },
      { name: 'distance', type: 'number', default: '24', description: t.descDistance },
      { name: 'once', type: 'boolean', default: 'true', description: t.descOnce },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <FadeInDemo
        direction={v.direction as FadeInDirection}
        duration={v.duration as number}
        distance={v.distance as number}
        stagger={v.stagger as number}
        once={v.once as boolean}
        items={t.items}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'FadeIn',
        propsType: 'FadeInProps',
        name: 'Reveal',
        props: {
          direction: v.direction === 'up' ? undefined : (v.direction as string),
          duration: v.duration === 600 ? undefined : v.duration,
          distance: v.distance === 24 ? undefined : v.distance,
          delay: v.stagger || undefined,
          once: v.once ? undefined : false,
        },
        children: '<div>Hello</div>',
      }),
  };
};
