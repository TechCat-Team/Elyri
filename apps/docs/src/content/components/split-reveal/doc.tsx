import { lazy } from 'react';

import type { SplitRevealBy } from '@elyri/motion';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const SplitRevealDemo = lazy(() => import('./SplitRevealDemo'));

const DEFAULTS = {
  text: 'Hello Elyri',
  by: 'char' as SplitRevealBy,
  delay: 0,
  stagger: 40,
  duration: 600,
  distance: 24,
  once: true,
};

const copy = {
  zh: {
    description: '文本按字符或单词错峰浮现，进入视口时触发，自动尊重系统的减弱动态效果偏好。',
    textLabel: '文本',
    byLabel: '拆分单位',
    delayLabel: '起始延迟 (ms)',
    staggerLabel: '依次间隔 (ms)',
    durationLabel: '时长 (ms)',
    distanceLabel: '位移 (px)',
    onceLabel: '仅触发一次',
    descChildren: '需要浮现的文本',
    descBy: '按字符还是按单词拆分',
    descDelay: '起始延迟（毫秒）',
    descStagger: '相邻单元之间的播放间隔（毫秒）',
    descDuration: '单个单元的动画时长（毫秒）',
    descDistance: '位移距离（像素）',
    descOnce: '是否只在首次进入视口时触发',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'Reveals text character by character or word by word with a stagger, triggered on viewport entry and respecting reduced-motion preferences.',
    textLabel: 'Text',
    byLabel: 'Split by',
    delayLabel: 'Start delay (ms)',
    staggerLabel: 'Stagger (ms)',
    durationLabel: 'Duration (ms)',
    distanceLabel: 'Distance (px)',
    onceLabel: 'Play once',
    descChildren: 'Text to reveal',
    descBy: 'Split the text into characters or words',
    descDelay: 'Start delay in milliseconds',
    descStagger: 'Delay between adjacent units in milliseconds',
    descDuration: 'Animation duration per unit in milliseconds',
    descDistance: 'Travel distance in pixels',
    descOnce: 'Only trigger the first time it enters the viewport',
    descClassName: 'Extra class name',
  },
};

export const splitRevealDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'split-reveal',
    title: 'SplitReveal',
    category: 'Text',
    description: t.description,
    dependencies: ['IntersectionObserver'],
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: DEFAULTS.text },
      { type: 'select', name: 'by', label: t.byLabel, default: DEFAULTS.by, options: ['char', 'word'] },
      { type: 'number', name: 'delay', label: t.delayLabel, default: DEFAULTS.delay, min: 0, max: 1000, step: 50 },
      { type: 'number', name: 'stagger', label: t.staggerLabel, default: DEFAULTS.stagger, min: 0, max: 200, step: 10 },
      {
        type: 'number',
        name: 'duration',
        label: t.durationLabel,
        default: DEFAULTS.duration,
        min: 100,
        max: 2000,
        step: 50,
      },
      { type: 'number', name: 'distance', label: t.distanceLabel, default: DEFAULTS.distance, min: 0, max: 120 },
      { type: 'boolean', name: 'once', label: t.onceLabel, default: DEFAULTS.once },
    ],
    props: [
      { name: 'children', type: 'string', description: t.descChildren },
      { name: 'by', type: "'char' | 'word'", default: "'char'", description: t.descBy },
      { name: 'delay', type: 'number', default: '0', description: t.descDelay },
      { name: 'stagger', type: 'number', default: '40', description: t.descStagger },
      { name: 'duration', type: 'number', default: '600', description: t.descDuration },
      { name: 'distance', type: 'number', default: '24', description: t.descDistance },
      { name: 'once', type: 'boolean', default: 'true', description: t.descOnce },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <SplitRevealDemo
        text={v.text as string}
        by={v.by as SplitRevealBy}
        delay={v.delay as number}
        stagger={v.stagger as number}
        duration={v.duration as number}
        distance={v.distance as number}
        once={v.once as boolean}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'SplitReveal',
        propsType: 'SplitRevealProps',
        name: 'Reveal',
        props: {
          by: v.by === DEFAULTS.by ? undefined : (v.by as string),
          delay: v.delay === DEFAULTS.delay ? undefined : v.delay,
          stagger: v.stagger === DEFAULTS.stagger ? undefined : v.stagger,
          duration: v.duration === DEFAULTS.duration ? undefined : v.duration,
          distance: v.distance === DEFAULTS.distance ? undefined : v.distance,
          once: v.once ? undefined : false,
        },
        children: v.text as string,
      }),
  };
};
