import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const FilamentsDemo = lazy(() => import('./FilamentsDemo'));

const DEFAULTS = {
  color: '#5b8cff',
  highlightColor: '#d46bff',
  amplitude: 1,
  speed: 1,
};

const copy = {
  zh: {
    description:
      'WebGL 实时渲染的光丝：七根发丝般的光线交织成一束缓慢起伏的波形，光脉冲沿线流过，指针处像被轻轻拨动的琴弦。',
    textLabel: '文本',
    colorLabel: '光丝色',
    highlightLabel: '渐变色',
    amplitudeLabel: '振幅',
    speedLabel: '速度',
    interactiveLabel: '跟随指针',
    descChildren: '叠加在背景之上的内容',
    descColor: '光丝主色（hex）',
    descHighlight: '沿光丝渐变的第二种颜色（hex）',
    descAmplitude: '光丝振幅倍率',
    descSpeed: '动画速度倍率',
    descInteractive: '指针处的光丝是否被拨动、弯向指针',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'WebGL filaments: seven hairlines of light braided into a slowly undulating waveform, with pulses running along them and a pluck under the pointer.',
    textLabel: 'Text',
    colorLabel: 'Thread color',
    highlightLabel: 'Gradient',
    amplitudeLabel: 'Amplitude',
    speedLabel: 'Speed',
    interactiveLabel: 'Follow pointer',
    descChildren: 'Content layered above the background',
    descColor: 'Main thread color (hex)',
    descHighlight: 'Second color the threads blend into (hex)',
    descAmplitude: 'Thread amplitude multiplier',
    descSpeed: 'Animation speed multiplier',
    descInteractive: 'Whether threads near the pointer are plucked toward it',
    descClassName: 'Extra class name',
  },
};

export const filamentsDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];
  const unlessDefault = <T,>(value: T, fallback: T) => (value === fallback ? undefined : value);

  return {
    slug: 'filaments',
    title: 'Filaments',
    category: 'Backgrounds',
    description: t.description,
    hero: true,
    isNew: true,
    dependencies: ['WebGL'],
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: 'Components that come alive' },
      { type: 'color', name: 'color', label: t.colorLabel, default: DEFAULTS.color },
      { type: 'color', name: 'highlightColor', label: t.highlightLabel, default: DEFAULTS.highlightColor },
      {
        type: 'number',
        name: 'amplitude',
        label: t.amplitudeLabel,
        default: DEFAULTS.amplitude,
        min: 0,
        max: 2.5,
        step: 0.05,
      },
      { type: 'number', name: 'speed', label: t.speedLabel, default: DEFAULTS.speed, min: 0, max: 3, step: 0.1 },
      { type: 'boolean', name: 'interactive', label: t.interactiveLabel, default: true },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: 'color', type: 'string', default: `'${DEFAULTS.color}'`, description: t.descColor },
      { name: 'highlightColor', type: 'string', default: `'${DEFAULTS.highlightColor}'`, description: t.descHighlight },
      { name: 'amplitude', type: 'number', default: String(DEFAULTS.amplitude), description: t.descAmplitude },
      { name: 'speed', type: 'number', default: String(DEFAULTS.speed), description: t.descSpeed },
      { name: 'interactive', type: 'boolean', default: 'true', description: t.descInteractive },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <FilamentsDemo
        text={v.text as string}
        color={v.color as string}
        highlightColor={v.highlightColor as string}
        amplitude={v.amplitude as number}
        speed={v.speed as number}
        interactive={v.interactive as boolean}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'Filaments',
        propsType: 'FilamentsProps',
        name: 'Hero',
        props: {
          color: unlessDefault(v.color, DEFAULTS.color),
          highlightColor: unlessDefault(v.highlightColor, DEFAULTS.highlightColor),
          amplitude: unlessDefault(v.amplitude, DEFAULTS.amplitude),
          speed: unlessDefault(v.speed, DEFAULTS.speed),
          interactive: v.interactive ? undefined : false,
        },
        children: `<h1>${v.text as string}</h1>`,
      }),
  };
};
