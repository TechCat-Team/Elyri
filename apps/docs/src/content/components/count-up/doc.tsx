import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const CountUpDemo = lazy(() => import('./CountUpDemo'));

const DEFAULTS = {
  to: 2024,
  duration: 1600,
  decimals: 0,
  separator: true,
  prefix: '',
  suffix: '',
};

const copy = {
  zh: {
    description: '进入视口时数字从起始值滚动到目标值，自动尊重系统的减弱动态效果偏好。',
    toLabel: '目标值',
    durationLabel: '时长 (ms)',
    decimalsLabel: '小数位',
    separatorLabel: '千分位',
    prefixLabel: '前缀',
    suffixLabel: '后缀',
    descTo: '目标数值',
    descFrom: '起始数值',
    descDuration: '动画时长（毫秒）',
    descDecimals: '保留的小数位数',
    descSeparator: '是否使用千分位分隔符',
    descPrefix: '数字前缀',
    descSuffix: '数字后缀',
    descOnce: '是否只在首次进入视口时播放',
    descClassName: '自定义类名',
  },
  en: {
    description: 'Counts a number from its start value up to the target when it enters the viewport.',
    toLabel: 'Target',
    durationLabel: 'Duration (ms)',
    decimalsLabel: 'Decimals',
    separatorLabel: 'Thousands',
    prefixLabel: 'Prefix',
    suffixLabel: 'Suffix',
    descTo: 'Target value',
    descFrom: 'Start value',
    descDuration: 'Animation duration in milliseconds',
    descDecimals: 'Number of decimal places to keep',
    descSeparator: 'Whether to group thousands with a separator',
    descPrefix: 'Text rendered before the number',
    descSuffix: 'Text rendered after the number',
    descOnce: 'Only play the first time it enters the viewport',
    descClassName: 'Extra class name',
  },
};

export const countUpDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'count-up',
    title: 'CountUp',
    category: 'Animations',
    description: t.description,
    dependencies: ['IntersectionObserver'],
    controls: [
      { type: 'number', name: 'to', label: t.toLabel, default: DEFAULTS.to, min: 0, max: 5000, step: 1 },
      {
        type: 'number',
        name: 'duration',
        label: t.durationLabel,
        default: DEFAULTS.duration,
        min: 300,
        max: 4000,
        step: 100,
      },
      { type: 'number', name: 'decimals', label: t.decimalsLabel, default: DEFAULTS.decimals, min: 0, max: 3, step: 1 },
      { type: 'boolean', name: 'separator', label: t.separatorLabel, default: DEFAULTS.separator },
      { type: 'text', name: 'prefix', label: t.prefixLabel, default: DEFAULTS.prefix },
      { type: 'text', name: 'suffix', label: t.suffixLabel, default: DEFAULTS.suffix },
    ],
    props: [
      { name: 'to', type: 'number', description: t.descTo },
      { name: 'from', type: 'number', default: '0', description: t.descFrom },
      { name: 'duration', type: 'number', default: String(DEFAULTS.duration), description: t.descDuration },
      { name: 'decimals', type: 'number', default: String(DEFAULTS.decimals), description: t.descDecimals },
      { name: 'separator', type: 'boolean', default: 'false', description: t.descSeparator },
      { name: 'prefix', type: 'string', description: t.descPrefix },
      { name: 'suffix', type: 'string', description: t.descSuffix },
      { name: 'once', type: 'boolean', default: 'true', description: t.descOnce },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <CountUpDemo
        to={v.to as number}
        duration={v.duration as number}
        decimals={v.decimals as number}
        separator={v.separator as boolean}
        prefix={v.prefix as string}
        suffix={v.suffix as string}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'CountUp',
        propsType: 'CountUpProps',
        name: 'Stat',
        props: {
          to: v.to,
          duration: v.duration === DEFAULTS.duration ? undefined : v.duration,
          decimals: v.decimals === DEFAULTS.decimals ? undefined : v.decimals,
          separator: v.separator ? undefined : false,
          prefix: (v.prefix as string) || undefined,
          suffix: (v.suffix as string) || undefined,
        },
      }),
  };
};
