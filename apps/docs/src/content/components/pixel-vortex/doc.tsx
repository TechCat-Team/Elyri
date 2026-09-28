import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const PixelVortexDemo = lazy(() => import('./PixelVortexDemo'));

const DEFAULTS = {
  color: '#ff4d12',
  highlightColor: '#ffd9b0',
  cellSize: 4,
  seamWidth: 5,
  speed: 1,
};

const copy = {
  zh: {
    description:
      'WebGL 渲染的 LED 屏：把视频降采样成像素灯珠播放；未提供视频时显示缓慢流动的火焰，亮区跟随指针，自动适配明暗主题。',
    videoSrcLabel: '视频地址',
    descVideoSrc:
      '在 LED 屏上播放的视频地址（跨域需 CORS，服务端需支持 Range 请求以便大视频流式播放），未提供时显示火焰效果',
    colorLabel: '火焰色',
    highlightLabel: '高光色',
    cellSizeLabel: '灯珠尺寸',
    seamsLabel: '拼接缝',
    seamWidthLabel: '缝宽',
    descSeams: '是否显示拼接屏接缝（每 16×10 颗灯珠一块）',
    descSeamWidth: '接缝宽度（CSS 像素）',
    speedLabel: '速度',
    interactiveLabel: '跟随指针',
    descChildren: '叠加在背景之上的内容',
    descColor: '火焰主色（hex）',
    descHighlight: '最亮处的高光色（hex）',
    descCellSize: '单颗灯珠尺寸（CSS 像素）',
    descSpeed: '动画速度倍率',
    descInteractive: '漩涡中心是否跟随指针',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'A WebGL LED screen: plays a video downsampled into pixel diodes; without a video, a slow flowing flame glows toward the pointer. Adapts to light and dark themes.',
    videoSrcLabel: 'Video URL',
    descVideoSrc:
      'Video played on the LED wall (cross-origin needs CORS; the server needs Range support for streaming large videos); falls back to flames when omitted',
    colorLabel: 'Fire',
    highlightLabel: 'Highlight',
    cellSizeLabel: 'Pixel size',
    seamsLabel: 'Panel seams',
    seamWidthLabel: 'Seam width',
    descSeams: 'Whether to show panel seams (one panel per 16×10 pixels)',
    descSeamWidth: 'Seam width (CSS px)',
    speedLabel: 'Speed',
    interactiveLabel: 'Follow pointer',
    descChildren: 'Content layered above the background',
    descColor: 'Main fire color (hex)',
    descHighlight: 'Color of the brightest areas (hex)',
    descCellSize: 'Size of a single LED pixel (CSS px)',
    descSpeed: 'Animation speed multiplier',
    descInteractive: 'Whether the vortex center follows the pointer',
    descClassName: 'Extra class name',
  },
};

export const pixelVortexDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];
  const unlessDefault = <T,>(value: T, fallback: T) => (value === fallback ? undefined : value);

  return {
    slug: 'pixel-vortex',
    title: 'Pixel Vortex',
    category: 'Backgrounds',
    description: t.description,
    isNew: true,
    dependencies: ['WebGL'],
    controls: [
      { type: 'text', name: 'videoSrc', label: t.videoSrcLabel, default: '' },
      { type: 'color', name: 'color', label: t.colorLabel, default: DEFAULTS.color },
      { type: 'color', name: 'highlightColor', label: t.highlightLabel, default: DEFAULTS.highlightColor },
      {
        type: 'number',
        name: 'cellSize',
        label: t.cellSizeLabel,
        default: DEFAULTS.cellSize,
        min: 2,
        max: 12,
        step: 1,
      },
      { type: 'boolean', name: 'seams', label: t.seamsLabel, default: false },
      {
        type: 'number',
        name: 'seamWidth',
        label: t.seamWidthLabel,
        default: DEFAULTS.seamWidth,
        min: 1,
        max: 20,
        step: 1,
      },
      { type: 'number', name: 'speed', label: t.speedLabel, default: DEFAULTS.speed, min: 0, max: 3, step: 0.1 },
      { type: 'boolean', name: 'interactive', label: t.interactiveLabel, default: true },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: 'videoSrc', type: 'string', description: t.descVideoSrc },
      { name: 'color', type: 'string', default: `'${DEFAULTS.color}'`, description: t.descColor },
      { name: 'highlightColor', type: 'string', default: `'${DEFAULTS.highlightColor}'`, description: t.descHighlight },
      { name: 'cellSize', type: 'number', default: String(DEFAULTS.cellSize), description: t.descCellSize },
      { name: 'seams', type: 'boolean', default: 'false', description: t.descSeams },
      { name: 'seamWidth', type: 'number', default: String(DEFAULTS.seamWidth), description: t.descSeamWidth },
      { name: 'speed', type: 'number', default: String(DEFAULTS.speed), description: t.descSpeed },
      { name: 'interactive', type: 'boolean', default: 'true', description: t.descInteractive },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <PixelVortexDemo
        videoSrc={(v.videoSrc as string) || undefined}
        color={v.color as string}
        highlightColor={v.highlightColor as string}
        cellSize={v.cellSize as number}
        seams={v.seams as boolean}
        seamWidth={v.seamWidth as number}
        speed={v.speed as number}
        interactive={v.interactive as boolean}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'PixelVortex',
        propsType: 'PixelVortexProps',
        name: 'Hero',
        props: {
          videoSrc: (v.videoSrc as string) || undefined,
          color: unlessDefault(v.color, DEFAULTS.color),
          highlightColor: unlessDefault(v.highlightColor, DEFAULTS.highlightColor),
          cellSize: unlessDefault(v.cellSize, DEFAULTS.cellSize),
          seams: v.seams ? true : undefined,
          seamWidth: v.seams ? unlessDefault(v.seamWidth, DEFAULTS.seamWidth) : undefined,
          speed: unlessDefault(v.speed, DEFAULTS.speed),
          interactive: v.interactive ? undefined : false,
        },
      }),
  };
};
