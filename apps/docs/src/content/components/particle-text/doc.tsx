import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const ParticleTextDemo = lazy(() => import('./ParticleTextDemo'));

const DEFAULTS = {
  text: 'Particles',
  color: '#a78bfa',
  particleSize: 2,
  gap: 3,
  radius: 80,
  force: 1,
  assemble: true,
};

const copy = {
  zh: {
    description: '文字由细小粒子组成，进入视口时从四周飞入聚合成字；指针靠近时粒子被推散，离开后弹回原位。',
    textLabel: '文本',
    colorLabel: '粒子颜色',
    sizeLabel: '粒子尺寸 (px)',
    gapLabel: '采样间距 (px)',
    radiusLabel: '排斥半径 (px)',
    forceLabel: '排斥力度',
    assembleLabel: '飞入聚合',
    descChildren: '由粒子组成的文本，可用 \\n 换行',
    descColor: '粒子颜色，默认继承文字颜色，也可用 CSS 变量 --elyri-particle-color 覆盖',
    descSize: '单个粒子边长（CSS 像素）',
    descGap: '采样间距（CSS 像素），越小粒子越密',
    descRadius: '指针排斥半径（CSS 像素），0 为关闭交互',
    descForce: '排斥力度倍率',
    descAssemble: '首次进入视口时粒子是否从四周飞入聚合成字',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'Text made of tiny particles that fly in and assemble on viewport entry, scatter away from the pointer, and spring back into place.',
    textLabel: 'Text',
    colorLabel: 'Particle color',
    sizeLabel: 'Particle size (px)',
    gapLabel: 'Sampling gap (px)',
    radiusLabel: 'Repel radius (px)',
    forceLabel: 'Repel force',
    assembleLabel: 'Assemble',
    descChildren: 'Text rendered as particles; use \\n for line breaks',
    descColor: 'Particle color, inherits the text color by default; also overridable via --elyri-particle-color',
    descSize: 'Side length of each particle, in CSS pixels',
    descGap: 'Sampling gap in CSS pixels; smaller means denser particles',
    descRadius: 'Pointer repel radius in CSS pixels, 0 disables interaction',
    descForce: 'Repel force multiplier',
    descAssemble: 'Fly particles in from around the text the first time it enters the viewport',
    descClassName: 'Extra class name',
  },
};

export const particleTextDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];
  const unlessDefault = <T,>(value: T, fallback: T) => (value === fallback ? undefined : value);

  return {
    slug: 'particle-text',
    title: 'ParticleText',
    category: 'Text',
    description: t.description,
    isNew: true,
    dependencies: ['Canvas 2D', 'IntersectionObserver', 'ResizeObserver'],
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: DEFAULTS.text },
      { type: 'color', name: 'color', label: t.colorLabel, default: DEFAULTS.color },
      {
        type: 'number',
        name: 'particleSize',
        label: t.sizeLabel,
        default: DEFAULTS.particleSize,
        min: 1,
        max: 6,
        step: 0.5,
      },
      { type: 'number', name: 'gap', label: t.gapLabel, default: DEFAULTS.gap, min: 2, max: 10, step: 1 },
      { type: 'number', name: 'radius', label: t.radiusLabel, default: DEFAULTS.radius, min: 0, max: 200, step: 5 },
      { type: 'number', name: 'force', label: t.forceLabel, default: DEFAULTS.force, min: 0, max: 3, step: 0.1 },
      { type: 'boolean', name: 'assemble', label: t.assembleLabel, default: DEFAULTS.assemble },
    ],
    props: [
      { name: 'children', type: 'string', description: t.descChildren },
      { name: 'color', type: 'string', default: 'currentColor', description: t.descColor },
      { name: 'particleSize', type: 'number', default: String(DEFAULTS.particleSize), description: t.descSize },
      { name: 'gap', type: 'number', default: String(DEFAULTS.gap), description: t.descGap },
      { name: 'radius', type: 'number', default: String(DEFAULTS.radius), description: t.descRadius },
      { name: 'force', type: 'number', default: String(DEFAULTS.force), description: t.descForce },
      { name: 'assemble', type: 'boolean', default: 'true', description: t.descAssemble },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <ParticleTextDemo
        text={v.text as string}
        color={v.color as string}
        particleSize={v.particleSize as number}
        gap={v.gap as number}
        radius={v.radius as number}
        force={v.force as number}
        assemble={v.assemble as boolean}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'ParticleText',
        propsType: 'ParticleTextProps',
        name: 'Headline',
        props: {
          color: v.color as string,
          particleSize: unlessDefault(v.particleSize as number, DEFAULTS.particleSize),
          gap: unlessDefault(v.gap as number, DEFAULTS.gap),
          radius: unlessDefault(v.radius as number, DEFAULTS.radius),
          force: unlessDefault(v.force as number, DEFAULTS.force),
          assemble: v.assemble ? undefined : false,
        },
        children: v.text as string,
      }),
  };
};
