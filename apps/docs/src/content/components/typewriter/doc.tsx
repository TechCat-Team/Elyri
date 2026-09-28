import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const TypewriterDemo = lazy(() => import('./TypewriterDemo'));

const DEFAULTS = {
  text: 'Hello, Elyri',
  speed: 60,
  startDelay: 200,
  loop: false,
  loopDelay: 1200,
  cursor: true,
};

const copy = {
  zh: {
    description: '打字机效果逐字输出文本，可循环重播，自动尊重系统的减弱动态效果偏好。',
    textLabel: '文本',
    speedLabel: '速度 (ms/字)',
    startDelayLabel: '起始延迟 (ms)',
    loopLabel: '循环',
    loopDelayLabel: '循环停顿 (ms)',
    cursorLabel: '光标',
    descChildren: '需要输出的文本',
    descSpeed: '每个字符的输入间隔（毫秒）',
    descStartDelay: '开始输入前的延迟（毫秒）',
    descLoop: '输入完成后是否循环重播',
    descLoopDelay: '循环重播前的停顿（毫秒）',
    descCursor: '是否显示闪烁光标',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'Types text out character by character with a blinking cursor, optionally looping, and respects reduced-motion preferences.',
    textLabel: 'Text',
    speedLabel: 'Speed (ms/char)',
    startDelayLabel: 'Start delay (ms)',
    loopLabel: 'Loop',
    loopDelayLabel: 'Loop pause (ms)',
    cursorLabel: 'Cursor',
    descChildren: 'Text to type out',
    descSpeed: 'Interval between characters in milliseconds',
    descStartDelay: 'Delay before typing starts in milliseconds',
    descLoop: 'Restart the animation after the text is fully typed',
    descLoopDelay: 'Pause before restarting in milliseconds',
    descCursor: 'Whether to show the blinking cursor',
    descClassName: 'Extra class name',
  },
};

export const typewriterDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'typewriter',
    title: 'Typewriter',
    category: 'Text',
    description: t.description,
    isNew: true,
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: DEFAULTS.text },
      { type: 'number', name: 'speed', label: t.speedLabel, default: DEFAULTS.speed, min: 20, max: 300, step: 10 },
      {
        type: 'number',
        name: 'startDelay',
        label: t.startDelayLabel,
        default: DEFAULTS.startDelay,
        min: 0,
        max: 2000,
        step: 50,
      },
      { type: 'boolean', name: 'loop', label: t.loopLabel, default: DEFAULTS.loop },
      {
        type: 'number',
        name: 'loopDelay',
        label: t.loopDelayLabel,
        default: DEFAULTS.loopDelay,
        min: 200,
        max: 4000,
        step: 100,
      },
      { type: 'boolean', name: 'cursor', label: t.cursorLabel, default: DEFAULTS.cursor },
    ],
    props: [
      { name: 'children', type: 'string', description: t.descChildren },
      { name: 'speed', type: 'number', default: String(DEFAULTS.speed), description: t.descSpeed },
      { name: 'startDelay', type: 'number', default: String(DEFAULTS.startDelay), description: t.descStartDelay },
      { name: 'loop', type: 'boolean', default: 'false', description: t.descLoop },
      { name: 'loopDelay', type: 'number', default: String(DEFAULTS.loopDelay), description: t.descLoopDelay },
      { name: 'cursor', type: 'boolean', default: 'true', description: t.descCursor },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <TypewriterDemo
        text={v.text as string}
        speed={v.speed as number}
        startDelay={v.startDelay as number}
        loop={v.loop as boolean}
        loopDelay={v.loopDelay as number}
        cursor={v.cursor as boolean}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'Typewriter',
        propsType: 'TypewriterProps',
        name: 'Typed',
        props: {
          speed: v.speed === DEFAULTS.speed ? undefined : v.speed,
          startDelay: v.startDelay === DEFAULTS.startDelay ? undefined : v.startDelay,
          loop: v.loop ? true : undefined,
          loopDelay: v.loop && v.loopDelay !== DEFAULTS.loopDelay ? v.loopDelay : undefined,
          cursor: v.cursor ? undefined : false,
        },
        children: v.text as string,
      }),
  };
};
