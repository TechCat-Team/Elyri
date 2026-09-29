import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const RotatingTextDemo = lazy(() => import('./RotatingTextDemo'));

const DEFAULTS = {
  words: 'graceful, lively, delightful',
  interval: 2500,
  duration: 500,
  variant: 'flip',
};

const copy = {
  zh: {
    description:
      '多个词语依次切换，容器宽度随词宽平滑伸缩，适合首页大标题；支持翻转与色块两种效果，减弱动态效果下直接替换不播动画。',
    wordsLabel: '词语（逗号分隔）',
    intervalLabel: '停留时长 (ms)',
    durationLabel: '动画时长 (ms)',
    variantLabel: '效果',
    descWords: '轮播的词语列表，至少一个',
    descInterval: '每个词的停留时长（毫秒）',
    descDuration: '单词进出的动画时长（毫秒）',
    descVariant: '切换效果：flip 为 3D 翻转字符；block 为圆角色块包裹文字，块宽随词伸缩',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'Cycles through words while the container smoothly adapts to each word width, perfect for hero headlines; offers flip and block effects, and swaps instantly under reduced motion.',
    wordsLabel: 'Words (comma separated)',
    intervalLabel: 'Interval (ms)',
    durationLabel: 'Animation duration (ms)',
    variantLabel: 'Variant',
    descWords: 'Words to cycle through; needs at least one',
    descInterval: 'Time each word stays visible in milliseconds',
    descDuration: 'Duration of the enter/leave animation per word in milliseconds',
    descVariant: 'Effect variant: flip rotates chars in 3D; block wraps the word in a rounded block that resizes to fit',
    descClassName: 'Extra class name',
  },
};

export const rotatingTextDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'rotating-text',
    title: 'RotatingText',
    category: 'Text',
    description: t.description,
    isNew: true,
    controls: [
      { type: 'text', name: 'words', label: t.wordsLabel, default: DEFAULTS.words },
      {
        type: 'number',
        name: 'interval',
        label: t.intervalLabel,
        default: DEFAULTS.interval,
        min: 800,
        max: 6000,
        step: 100,
      },
      {
        type: 'number',
        name: 'duration',
        label: t.durationLabel,
        default: DEFAULTS.duration,
        min: 200,
        max: 1500,
        step: 50,
      },
      { type: 'select', name: 'variant', label: t.variantLabel, default: DEFAULTS.variant, options: ['flip', 'block'] },
    ],
    props: [
      { name: 'words', type: 'string[]', description: t.descWords },
      { name: 'interval', type: 'number', default: String(DEFAULTS.interval), description: t.descInterval },
      { name: 'duration', type: 'number', default: String(DEFAULTS.duration), description: t.descDuration },
      { name: 'variant', type: "'flip' | 'block'", default: `'${DEFAULTS.variant}'`, description: t.descVariant },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <RotatingTextDemo
        words={v.words as string}
        interval={v.interval as number}
        duration={v.duration as number}
        variant={v.variant as 'flip' | 'block'}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'RotatingText',
        propsType: 'RotatingTextProps',
        name: 'Hero',
        props: {
          words: (v.words as string)
            .split(',')
            .map((word) => word.trim())
            .filter(Boolean),
          interval: v.interval === DEFAULTS.interval ? undefined : v.interval,
          duration: v.duration === DEFAULTS.duration ? undefined : v.duration,
          variant: v.variant === DEFAULTS.variant ? undefined : v.variant,
        },
      }),
  };
};
