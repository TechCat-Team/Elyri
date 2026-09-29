import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const AsciiImageDemo = lazy(() => import('./AsciiImageDemo'));

/** 组件自身的默认值，用于在示例代码中省略未改动的属性 */
const DEFAULTS = {
  columns: 100,
  characters: ' .:-=+*#%@',
  duration: 1200,
  flicker: 0.01,
  radius: 90,
};

// 演示默认使用站点 logo，同源 SVG 可直接读取像素
const LOGO_SRC = `${import.meta.env.BASE_URL}logo.svg`;

const copy = {
  zh: {
    description:
      '把图片转换为 ASCII 字符画：按亮度把像素映射为疏密不同的字符，支持单色或原图着色。进入视口时自上而下解码显现，之后有高光周期性扫过、字符随机闪烁，指针靠近时字符被推开、提亮并乱码，自动适配明暗主题。',
    srcLabel: '图片地址',
    columnsLabel: '每行字符数',
    charactersLabel: '字符梯度',
    coloredLabel: '原图着色',
    colorLabel: '字符颜色',
    invertLabel: '反转明暗',
    animatedLabel: '显现动画',
    durationLabel: '动画时长 (ms)',
    shimmerLabel: '扫光',
    flickerLabel: '闪烁比例',
    interactiveLabel: '指针透镜',
    radiusLabel: '透镜半径 (px)',
    descSrc: '图片地址。跨域图片需服务端允许 CORS，否则无法读取像素，会退回显示原图',
    descAlt: '替代文本，提供给读屏软件',
    descColumns: '每行字符数，越大细节越多',
    descCharacters: '字符梯度，从稀疏到密集排列',
    descColored: '是否按原图像素着色',
    descColor: '单色模式下的字符颜色，默认继承文字颜色，也可用 CSS 变量 --elyri-ascii-color 覆盖',
    descInvert: '反转明暗映射（默认深色主题下亮处字符密集，浅色主题下暗处字符密集）',
    descAnimated: '进入视口时是否自上而下解码显现',
    descDuration: '显现动画时长（毫秒）',
    descShimmer: '是否有一道斜向高光周期性扫过',
    descFlicker: '每帧随机闪烁的字符比例（0-1），0 为关闭',
    descInteractive: '指针附近的字符是否被推开、提亮并乱码',
    descRadius: '指针影响半径（CSS 像素）',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'Turns an image into ASCII art: pixels map to sparser or denser characters by brightness, in a single color or the original colors. Decodes top to bottom on viewport entry, then a glint sweeps across and characters flicker; near the pointer they are pushed aside, brightened and scrambled. Adapts to light and dark themes.',
    srcLabel: 'Image URL',
    columnsLabel: 'Columns',
    charactersLabel: 'Character ramp',
    coloredLabel: 'Original colors',
    colorLabel: 'Text color',
    invertLabel: 'Invert',
    animatedLabel: 'Reveal',
    durationLabel: 'Duration (ms)',
    shimmerLabel: 'Shimmer',
    flickerLabel: 'Flicker',
    interactiveLabel: 'Pointer lens',
    radiusLabel: 'Lens radius (px)',
    descSrc:
      'Image URL. Cross-origin images need CORS so pixels can be read; otherwise the original image is shown instead',
    descAlt: 'Alternative text for screen readers',
    descColumns: 'Characters per row; higher means more detail',
    descCharacters: 'Character ramp ordered from sparse to dense',
    descColored: 'Color each character with its source pixel',
    descColor:
      'Character color in single-color mode, inherits the text color; also overridable via --elyri-ascii-color',
    descInvert:
      'Invert the brightness mapping (by default bright areas are dense in dark themes and dark areas are dense in light themes)',
    descAnimated: 'Decode from top to bottom on viewport entry',
    descDuration: 'Reveal duration in milliseconds',
    descShimmer: 'Sweep a diagonal glint across the image periodically',
    descFlicker: 'Fraction of characters that randomly flicker each frame (0-1), 0 disables it',
    descInteractive: 'Push aside, brighten and scramble characters near the pointer',
    descRadius: 'Pointer influence radius in CSS pixels',
    descClassName: 'Extra class name',
  },
};

export const asciiImageDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];
  const unlessDefault = <T,>(value: T, fallback: T) => (value === fallback ? undefined : value);

  return {
    slug: 'ascii-image',
    title: 'AsciiImage',
    category: 'Media',
    description: t.description,
    dependencies: ['Canvas 2D', 'IntersectionObserver', 'ResizeObserver'],
    controls: [
      { type: 'text', name: 'src', label: t.srcLabel, default: LOGO_SRC },
      {
        type: 'number',
        name: 'columns',
        label: t.columnsLabel,
        default: DEFAULTS.columns,
        min: 20,
        max: 240,
        step: 4,
      },
      { type: 'text', name: 'characters', label: t.charactersLabel, default: DEFAULTS.characters },
      { type: 'boolean', name: 'colored', label: t.coloredLabel, default: true },
      { type: 'color', name: 'color', label: t.colorLabel, default: '' },
      { type: 'boolean', name: 'invert', label: t.invertLabel, default: false },
      { type: 'boolean', name: 'animated', label: t.animatedLabel, default: true },
      {
        type: 'number',
        name: 'duration',
        label: t.durationLabel,
        default: DEFAULTS.duration,
        min: 200,
        max: 4000,
        step: 100,
      },
      { type: 'boolean', name: 'shimmer', label: t.shimmerLabel, default: true },
      {
        type: 'number',
        name: 'flicker',
        label: t.flickerLabel,
        default: DEFAULTS.flicker,
        min: 0,
        max: 0.1,
        step: 0.005,
      },
      { type: 'boolean', name: 'interactive', label: t.interactiveLabel, default: true },
      { type: 'number', name: 'radius', label: t.radiusLabel, default: DEFAULTS.radius, min: 20, max: 240, step: 5 },
    ],
    props: [
      { name: 'src', type: 'string', description: t.descSrc },
      { name: 'alt', type: 'string', description: t.descAlt },
      { name: 'columns', type: 'number', default: String(DEFAULTS.columns), description: t.descColumns },
      { name: 'characters', type: 'string', default: `'${DEFAULTS.characters}'`, description: t.descCharacters },
      { name: 'colored', type: 'boolean', default: 'false', description: t.descColored },
      { name: 'color', type: 'string', default: 'currentColor', description: t.descColor },
      { name: 'invert', type: 'boolean', default: 'false', description: t.descInvert },
      { name: 'animated', type: 'boolean', default: 'true', description: t.descAnimated },
      { name: 'duration', type: 'number', default: String(DEFAULTS.duration), description: t.descDuration },
      { name: 'shimmer', type: 'boolean', default: 'true', description: t.descShimmer },
      { name: 'flicker', type: 'number', default: String(DEFAULTS.flicker), description: t.descFlicker },
      { name: 'interactive', type: 'boolean', default: 'true', description: t.descInteractive },
      { name: 'radius', type: 'number', default: String(DEFAULTS.radius), description: t.descRadius },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <AsciiImageDemo
        // 切换显现动画时重新挂载，便于重播
        key={String(v.animated)}
        src={v.src as string}
        alt="Elyri logo"
        columns={v.columns as number}
        characters={v.characters as string}
        colored={v.colored as boolean}
        color={(v.color as string) || undefined}
        invert={v.invert as boolean}
        animated={v.animated as boolean}
        duration={v.duration as number}
        shimmer={v.shimmer as boolean}
        flicker={v.flicker as number}
        interactive={v.interactive as boolean}
        radius={v.radius as number}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'AsciiImage',
        propsType: 'AsciiImageProps',
        name: 'Logo',
        props: {
          src: '/logo.svg',
          alt: 'Logo',
          columns: unlessDefault(v.columns as number, DEFAULTS.columns),
          characters: unlessDefault(v.characters as string, DEFAULTS.characters),
          colored: v.colored ? true : undefined,
          color: (v.color as string) || undefined,
          invert: v.invert ? true : undefined,
          animated: v.animated ? undefined : false,
          duration: unlessDefault(v.duration as number, DEFAULTS.duration),
          shimmer: v.shimmer ? undefined : false,
          flicker: unlessDefault(v.flicker as number, DEFAULTS.flicker),
          interactive: v.interactive ? undefined : false,
          radius: unlessDefault(v.radius as number, DEFAULTS.radius),
        },
      }),
  };
};
