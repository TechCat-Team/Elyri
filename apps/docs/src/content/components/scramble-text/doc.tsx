import { lazy } from 'react';

import type { ScrambleTextTrigger } from 'elyri';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const ScrambleTextDemo = lazy(() => import('./ScrambleTextDemo'));

const DEFAULTS = {
  text: 'Decode the future',
  trigger: 'view' as ScrambleTextTrigger,
  speed: 40,
  stagger: 60,
  characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_\\/[]{}=+*^?#',
  accentColor: '#22d3ee',
  glow: 1,
  once: true,
};

const copy = {
  zh: {
    description: '字符先以发光乱码闪烁，再从左到右依次定格为原文，呈现解码般的科技感。支持进入视口或悬停触发。',
    textLabel: '文本',
    triggerLabel: '触发方式',
    speedLabel: '刷新间隔 (ms)',
    staggerLabel: '定格间隔 (ms)',
    charactersLabel: '乱码字符池',
    accentLabel: '强调色',
    glowLabel: '辉光强度',
    descGlow: '乱码辉光强度倍率，0 为关闭，也可用 CSS 变量 --elyri-scramble-glow 覆盖',
    onceLabel: '仅触发一次',
    descChildren: '需要解码显现的文本',
    descTrigger: '进入视口时播放，或指针悬停 / 聚焦时播放',
    descSpeed: '乱码刷新间隔（毫秒）',
    descStagger: '相邻字符依次定格的间隔（毫秒）',
    descCharacters: '乱码使用的字符池',
    descAccent: '乱码字符的颜色与辉光，也可用 CSS 变量 --elyri-scramble-accent 覆盖',
    descOnce: '视口模式下是否只在首次进入时触发',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'Characters flicker as glowing glyphs, then lock into the real text one by one for a decoding effect. Triggers on viewport entry or hover.',
    textLabel: 'Text',
    triggerLabel: 'Trigger',
    speedLabel: 'Refresh interval (ms)',
    staggerLabel: 'Settle stagger (ms)',
    charactersLabel: 'Glyph pool',
    accentLabel: 'Accent color',
    glowLabel: 'Glow',
    descGlow:
      'Glow strength multiplier for scrambled glyphs, 0 disables it; also overridable via --elyri-scramble-glow',
    onceLabel: 'Play once',
    descChildren: 'Text to decode',
    descTrigger: 'Play on viewport entry, or on pointer hover / focus',
    descSpeed: 'How often scrambled glyphs refresh, in milliseconds',
    descStagger: 'Delay between adjacent characters settling, in milliseconds',
    descCharacters: 'Characters used for the scramble',
    descAccent: 'Color and glow of scrambled glyphs, also overridable via --elyri-scramble-accent',
    descOnce: 'In view mode, only trigger the first time it enters the viewport',
    descClassName: 'Extra class name',
  },
};

export const scrambleTextDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];
  const unlessDefault = <T,>(value: T, fallback: T) => (value === fallback ? undefined : value);

  return {
    slug: 'scramble-text',
    title: 'ScrambleText',
    category: 'Text',
    description: t.description,
    isNew: true,
    dependencies: ['IntersectionObserver'],
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: DEFAULTS.text },
      {
        type: 'select',
        name: 'trigger',
        label: t.triggerLabel,
        default: DEFAULTS.trigger,
        options: ['view', 'hover'],
      },
      { type: 'number', name: 'speed', label: t.speedLabel, default: DEFAULTS.speed, min: 16, max: 200, step: 4 },
      {
        type: 'number',
        name: 'stagger',
        label: t.staggerLabel,
        default: DEFAULTS.stagger,
        min: 10,
        max: 300,
        step: 10,
      },
      { type: 'text', name: 'characters', label: t.charactersLabel, default: DEFAULTS.characters },
      { type: 'color', name: 'accentColor', label: t.accentLabel, default: DEFAULTS.accentColor },
      { type: 'number', name: 'glow', label: t.glowLabel, default: DEFAULTS.glow, min: 0, max: 3, step: 0.1 },
      { type: 'boolean', name: 'once', label: t.onceLabel, default: DEFAULTS.once },
    ],
    props: [
      { name: 'children', type: 'string', description: t.descChildren },
      { name: 'trigger', type: "'view' | 'hover'", default: "'view'", description: t.descTrigger },
      { name: 'speed', type: 'number', default: String(DEFAULTS.speed), description: t.descSpeed },
      { name: 'stagger', type: 'number', default: String(DEFAULTS.stagger), description: t.descStagger },
      { name: 'characters', type: 'string', default: "'A-Z 0-9 !<>-_…'", description: t.descCharacters },
      { name: 'accentColor', type: 'string', default: `'${DEFAULTS.accentColor}'`, description: t.descAccent },
      { name: 'glow', type: 'number', default: String(DEFAULTS.glow), description: t.descGlow },
      { name: 'once', type: 'boolean', default: 'true', description: t.descOnce },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <ScrambleTextDemo
        text={v.text as string}
        trigger={v.trigger as ScrambleTextTrigger}
        speed={v.speed as number}
        stagger={v.stagger as number}
        characters={v.characters as string}
        accentColor={v.accentColor as string}
        glow={v.glow as number}
        once={v.once as boolean}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'ScrambleText',
        propsType: 'ScrambleTextProps',
        name: 'Headline',
        props: {
          trigger: unlessDefault(v.trigger as string, DEFAULTS.trigger),
          speed: unlessDefault(v.speed as number, DEFAULTS.speed),
          stagger: unlessDefault(v.stagger as number, DEFAULTS.stagger),
          characters: unlessDefault(v.characters as string, DEFAULTS.characters),
          accentColor: unlessDefault(v.accentColor as string, DEFAULTS.accentColor),
          glow: unlessDefault(v.glow as number, DEFAULTS.glow),
          once: v.once ? undefined : false,
        },
        children: v.text as string,
      }),
  };
};
