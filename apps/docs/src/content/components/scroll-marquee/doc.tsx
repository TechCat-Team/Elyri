import { lazy } from 'react';

import type { ScrollMarqueeDirection } from 'elyri';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const ScrollMarqueeDemo = lazy(() => import('./ScrollMarqueeDemo'));

const DEFAULTS = {
  text: 'Elyri · React motion components',
  direction: 'left' as ScrollMarqueeDirection,
  speed: 0.5,
  rows: 1,
  infinite: true,
};

const copy = {
  zh: {
    description: '页面上下滚动时文字左右横向滚动，多行时相邻行方向相反，自动尊重系统的减弱动态效果偏好。',
    textLabel: '文本',
    directionLabel: '方向',
    speedLabel: '联动系数',
    rowsLabel: '行数',
    infiniteLabel: '无限循环',
    descChildren: '需要滚动的文本',
    descDirection: '文字横向滚动的方向',
    descSpeed: '页面每滚动 1px，文字横向移动的像素数',
    descRows: '行数，相邻两行方向相反',
    descRepeat: '内容重复份数，用于铺满并实现无缝循环',
    descInfinite: '是否无限循环，关闭时走满一份内容后停住',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'Slides text horizontally as the page scrolls vertically, with opposite directions on alternating rows, respecting reduced-motion preferences.',
    textLabel: 'Text',
    directionLabel: 'Direction',
    speedLabel: 'Speed',
    rowsLabel: 'Rows',
    infiniteLabel: 'Infinite loop',
    descChildren: 'Text to scroll',
    descDirection: 'Horizontal direction the text travels in',
    descSpeed: 'Pixels the text moves horizontally per pixel of page scroll',
    descRows: 'Number of rows; adjacent rows travel in opposite directions',
    descRepeat: 'How many times the content repeats, to fill the width and loop seamlessly',
    descInfinite: 'Whether to loop forever; when off, stops after one full copy',
    descClassName: 'Extra class name',
  },
};

export const scrollMarqueeDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'scroll-marquee',
    title: 'ScrollMarquee',
    category: 'Text',
    description: t.description,
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: DEFAULTS.text },
      {
        type: 'select',
        name: 'direction',
        label: t.directionLabel,
        default: DEFAULTS.direction,
        options: ['left', 'right'],
      },
      { type: 'number', name: 'speed', label: t.speedLabel, default: DEFAULTS.speed, min: 0.1, max: 3, step: 0.1 },
      { type: 'number', name: 'rows', label: t.rowsLabel, default: DEFAULTS.rows, min: 1, max: 5, step: 1 },
      { type: 'boolean', name: 'infinite', label: t.infiniteLabel, default: DEFAULTS.infinite },
    ],
    props: [
      { name: 'children', type: 'string', description: t.descChildren },
      { name: 'direction', type: "'left' | 'right'", default: "'left'", description: t.descDirection },
      { name: 'speed', type: 'number', default: String(DEFAULTS.speed), description: t.descSpeed },
      { name: 'rows', type: 'number', default: String(DEFAULTS.rows), description: t.descRows },
      { name: 'repeat', type: 'number', default: '6', description: t.descRepeat },
      { name: 'infinite', type: 'boolean', default: 'true', description: t.descInfinite },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <ScrollMarqueeDemo
        text={v.text as string}
        direction={v.direction as ScrollMarqueeDirection}
        speed={v.speed as number}
        rows={v.rows as number}
        infinite={v.infinite as boolean}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'ScrollMarquee',
        propsType: 'ScrollMarqueeProps',
        name: 'Marquee',
        props: {
          direction: v.direction === DEFAULTS.direction ? undefined : v.direction,
          speed: v.speed === DEFAULTS.speed ? undefined : v.speed,
          rows: v.rows === DEFAULTS.rows ? undefined : v.rows,
          infinite: v.infinite === DEFAULTS.infinite ? undefined : v.infinite,
        },
        children: v.text as string,
      }),
  };
};
