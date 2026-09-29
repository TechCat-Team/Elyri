import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const WaveTextDemo = lazy(() => import('./WaveTextDemo'));

const DEFAULTS = {
  text: 'Hello Elyri',
  amplitude: 6,
  speed: 1200,
  stagger: 60,
};

const copy = {
  zh: {
    description: '字符按正弦节奏依次上下起伏，形成连续的波浪；纯 CSS 驱动，减弱动态效果下自动静止。',
    textLabel: '文本',
    amplitudeLabel: '振幅 (px)',
    speedLabel: '起伏时长 (ms)',
    staggerLabel: '相位差 (ms)',
    descChildren: '需要起伏的文本',
    descAmplitude: '振幅（像素）',
    descSpeed: '单个字符一次起伏的时长（毫秒）',
    descStagger: '相邻字符的相位差（毫秒），越大波浪越稀疏',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'Characters bob up and down in sequence, forming a continuous wave; pure CSS and automatically still under reduced motion.',
    textLabel: 'Text',
    amplitudeLabel: 'Amplitude (px)',
    speedLabel: 'Cycle duration (ms)',
    staggerLabel: 'Phase shift (ms)',
    descChildren: 'Text to animate',
    descAmplitude: 'Wave amplitude in pixels',
    descSpeed: 'Duration of one bob cycle per character in milliseconds',
    descStagger: 'Phase shift between adjacent characters in milliseconds; larger values spread the wave out',
    descClassName: 'Extra class name',
  },
};

export const waveTextDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'wave-text',
    title: 'WaveText',
    category: 'Text',
    description: t.description,
    isNew: true,
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: DEFAULTS.text },
      {
        type: 'number',
        name: 'amplitude',
        label: t.amplitudeLabel,
        default: DEFAULTS.amplitude,
        min: 1,
        max: 24,
        step: 1,
      },
      {
        type: 'number',
        name: 'speed',
        label: t.speedLabel,
        default: DEFAULTS.speed,
        min: 400,
        max: 3000,
        step: 100,
      },
      { type: 'number', name: 'stagger', label: t.staggerLabel, default: DEFAULTS.stagger, min: 0, max: 200, step: 10 },
    ],
    props: [
      { name: 'children', type: 'string', description: t.descChildren },
      { name: 'amplitude', type: 'number', default: String(DEFAULTS.amplitude), description: t.descAmplitude },
      { name: 'speed', type: 'number', default: String(DEFAULTS.speed), description: t.descSpeed },
      { name: 'stagger', type: 'number', default: String(DEFAULTS.stagger), description: t.descStagger },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <WaveTextDemo
        text={v.text as string}
        amplitude={v.amplitude as number}
        speed={v.speed as number}
        stagger={v.stagger as number}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'WaveText',
        propsType: 'WaveTextProps',
        name: 'Wave',
        props: {
          amplitude: v.amplitude === DEFAULTS.amplitude ? undefined : v.amplitude,
          speed: v.speed === DEFAULTS.speed ? undefined : v.speed,
          stagger: v.stagger === DEFAULTS.stagger ? undefined : v.stagger,
        },
        children: v.text as string,
      }),
  };
};
