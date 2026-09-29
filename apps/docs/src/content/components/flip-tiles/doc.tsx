import { lazy } from 'react';

import type { FlipTilesPattern } from '@elyri/motion';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const FlipTilesDemo = lazy(() => import('./FlipTilesDemo'));

const DEFAULTS = {
  color: '#4f6bff',
  highlightColor: '#b8c4ff',
  tileSize: 72,
  speed: 1,
  pattern: 'wave',
};

const copy = {
  zh: {
    description:
      'WebGL 实时渲染的立方体阵列：俯角透视下，黑曜石顶面、强调色金属侧面与高光倒角棱边整齐排布，翻滚波经过时立方体带着轻微回弹滚动 90° 翻出色面，投影与深槽辉光拉开纵深，指针处的立方体缓缓升起。',
    textLabel: '文本',
    colorLabel: '侧面色',
    highlightLabel: '高光色',
    tileSizeLabel: '立方体大小 (px)',
    speedLabel: '速度',
    patternLabel: '翻滚编排',
    interactiveLabel: '跟随指针',
    descChildren: '叠加在背景之上的内容',
    descColor: '立方体侧面的强调色（hex），翻滚时翻到顶上的就是这一面',
    descHighlight: '金属倒角与反光条的高光色（hex）',
    descTileSize: '单个立方体加缝隙的宽度（像素）',
    descSpeed: '动画速度倍率',
    descPattern: "翻滚编排：'wave' 成列扫过、'ripple' 从中心向外荡开、'drift' 成片有机漂移",
    descInteractive: '光源与指针处立方体升起是否跟随指针',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'A WebGL array of solid cubes seen in slight perspective: obsidian tops, metallic colored sides and polished beveled edges. Roll waves tip cubes 90° with a subtle spring to reveal their color, cast shadows and glowing grooves add depth, and cubes rise under the pointer.',
    textLabel: 'Text',
    colorLabel: 'Side color',
    highlightLabel: 'Highlight',
    tileSizeLabel: 'Cube size (px)',
    speedLabel: 'Speed',
    patternLabel: 'Pattern',
    interactiveLabel: 'Follow pointer',
    descChildren: 'Content layered above the background',
    descColor: 'Accent color of the cube sides, revealed on top as cubes roll (hex)',
    descHighlight: 'Bevel and reflection highlight color (hex)',
    descTileSize: 'Width of one cube plus its gap in pixels',
    descSpeed: 'Animation speed multiplier',
    descPattern:
      "Roll choreography: 'wave' sweeps in columns, 'ripple' spreads out from the center, 'drift' flows in organic patches",
    descInteractive: 'Whether the light and rising cubes follow the pointer',
    descClassName: 'Extra class name',
  },
};

export const flipTilesDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];
  const unlessDefault = <T,>(value: T, fallback: T) => (value === fallback ? undefined : value);

  return {
    slug: 'flip-tiles',
    title: 'FlipTiles',
    category: 'Backgrounds',
    description: t.description,
    hero: true,
    isNew: true,
    dependencies: ['WebGL'],
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: 'Components that come alive' },
      {
        type: 'select',
        name: 'pattern',
        label: t.patternLabel,
        default: DEFAULTS.pattern,
        options: ['wave', 'ripple', 'drift'],
      },
      { type: 'color', name: 'color', label: t.colorLabel, default: DEFAULTS.color },
      { type: 'color', name: 'highlightColor', label: t.highlightLabel, default: DEFAULTS.highlightColor },
      { type: 'number', name: 'tileSize', label: t.tileSizeLabel, default: DEFAULTS.tileSize, min: 32, max: 140 },
      { type: 'number', name: 'speed', label: t.speedLabel, default: DEFAULTS.speed, min: 0, max: 3, step: 0.1 },
      { type: 'boolean', name: 'interactive', label: t.interactiveLabel, default: true },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: 'color', type: 'string', default: `'${DEFAULTS.color}'`, description: t.descColor },
      { name: 'highlightColor', type: 'string', default: `'${DEFAULTS.highlightColor}'`, description: t.descHighlight },
      { name: 'tileSize', type: 'number', default: String(DEFAULTS.tileSize), description: t.descTileSize },
      { name: 'speed', type: 'number', default: String(DEFAULTS.speed), description: t.descSpeed },
      {
        name: 'pattern',
        type: "'wave' | 'ripple' | 'drift'",
        default: `'${DEFAULTS.pattern}'`,
        description: t.descPattern,
      },
      { name: 'interactive', type: 'boolean', default: 'true', description: t.descInteractive },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <FlipTilesDemo
        text={v.text as string}
        color={v.color as string}
        highlightColor={v.highlightColor as string}
        tileSize={v.tileSize as number}
        speed={v.speed as number}
        pattern={v.pattern as FlipTilesPattern}
        interactive={v.interactive as boolean}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'FlipTiles',
        propsType: 'FlipTilesProps',
        name: 'Hero',
        props: {
          color: unlessDefault(v.color, DEFAULTS.color),
          highlightColor: unlessDefault(v.highlightColor, DEFAULTS.highlightColor),
          tileSize: unlessDefault(v.tileSize, DEFAULTS.tileSize),
          speed: unlessDefault(v.speed, DEFAULTS.speed),
          pattern: unlessDefault(v.pattern, DEFAULTS.pattern),
          interactive: v.interactive ? undefined : false,
        },
        children: `<h1>${v.text as string}</h1>`,
      }),
  };
};
