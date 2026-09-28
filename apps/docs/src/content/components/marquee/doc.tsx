import { lazy } from 'react';

import type { MarqueeDirection } from 'elyri';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const MarqueeDemo = lazy(() => import('./MarqueeDemo'));

const DEFAULTS = {
  text: 'React, TypeScript, Motion, WebGL, Theming, Accessibility',
  direction: 'left' as MarqueeDirection,
  duration: 20,
  gap: 16,
};

const copy = {
  zh: {
    description:
      '内容自动无限循环滚动，支持任意节点、横向与纵向以及反向播放，悬停可暂停，自动尊重系统的减弱动态效果偏好。',
    directionLabel: '方向',
    durationLabel: '时长',
    gapLabel: '间距',
    descChildren: '需要循环滚动的内容，任意节点',
    descDirection: '滚动方向',
    descDuration: '跑完一轮所需的秒数，数值越大越慢',
    descRepeat: '最少重复份数；实际份数会按容器尺寸自动补足，保证循环无缝',
    descGap: '每份内容之间的间距（px）',
    descInfinite: '是否无限重复播放，关闭时只播放一轮',
    descPauseOnHover: '鼠标悬停时是否暂停',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'Loops content infinitely on its own, supporting any nodes, horizontal and vertical directions, reverse playback and hover-to-pause, while respecting reduced-motion preferences.',
    directionLabel: 'Direction',
    durationLabel: 'Duration',
    gapLabel: 'Gap',
    descChildren: 'Content to loop, any node',
    descDirection: 'Direction the content travels in',
    descDuration: 'Seconds for one full loop; a larger value scrolls slower',
    descRepeat: 'Minimum number of copies; the actual count auto-expands to fill the container',
    descGap: 'Spacing between each copy of the content (px)',
    descInfinite: 'Whether to repeat forever; when off, plays a single pass',
    descPauseOnHover: 'Whether to pause while hovered',
    descClassName: 'Extra class name',
  },
};

export const marqueeDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'marquee',
    title: 'Marquee',
    category: 'Text',
    description: t.description,
    isNew: true,
    controls: [
      {
        type: 'select',
        name: 'direction',
        label: t.directionLabel,
        default: DEFAULTS.direction,
        options: ['left', 'right', 'up', 'down'],
      },
      {
        type: 'number',
        name: 'duration',
        label: t.durationLabel,
        default: DEFAULTS.duration,
        min: 4,
        max: 60,
        step: 1,
      },
      { type: 'number', name: 'gap', label: t.gapLabel, default: DEFAULTS.gap, min: 0, max: 48, step: 4 },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      {
        name: 'direction',
        type: "'left' | 'right' | 'up' | 'down'",
        default: "'left'",
        description: t.descDirection,
      },
      { name: 'duration', type: 'number', default: String(DEFAULTS.duration), description: t.descDuration },
      { name: 'repeat', type: 'number', default: '2', description: t.descRepeat },
      { name: 'gap', type: 'number', default: '0', description: t.descGap },
      { name: 'infinite', type: 'boolean', default: 'true', description: t.descInfinite },
      { name: 'pauseOnHover', type: 'boolean', default: 'true', description: t.descPauseOnHover },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <MarqueeDemo
        text={DEFAULTS.text}
        direction={v.direction as MarqueeDirection}
        duration={v.duration as number}
        gap={v.gap as number}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'Marquee',
        propsType: 'MarqueeProps',
        name: 'Ticker',
        props: {
          direction: v.direction === DEFAULTS.direction ? undefined : v.direction,
          duration: v.duration === DEFAULTS.duration ? undefined : v.duration,
          // 组件的 gap 默认值是 0，而演示起始值是 16，所以始终写进示例，保证接缝有间距
          gap: v.gap,
        },
        children: DEFAULTS.text,
      }),
  };
};
