import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const TiltDemo = lazy(() => import('./TiltDemo'));

const DEFAULTS = {
  max: 10,
  perspective: 800,
  glare: true,
};

const copy = {
  zh: {
    description: '根据指针在元素内的位置计算 3D 倾斜，可叠加跟随指针的高光；减弱动态效果下自动禁用。',
    maxLabel: '最大角度 (°)',
    perspectiveLabel: '透视 (px)',
    glareLabel: '高光',
    descChildren: '需要倾斜的内容',
    descMax: '最大倾斜角度（度）',
    descPerspective: '透视距离（像素），越小透视越强',
    descGlare: '是否显示跟随指针的高光',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'Tilts content in 3D based on the pointer position, with an optional pointer-following glare; disabled under reduced motion.',
    maxLabel: 'Max angle (°)',
    perspectiveLabel: 'Perspective (px)',
    glareLabel: 'Glare',
    descChildren: 'Content to tilt',
    descMax: 'Maximum tilt angle in degrees',
    descPerspective: 'Perspective distance in pixels; smaller values exaggerate the depth',
    descGlare: 'Whether to show a pointer-following glare',
    descClassName: 'Extra class name',
  },
};

export const tiltDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'tilt',
    title: 'Tilt',
    category: 'Animations',
    description: t.description,
    dependencies: ['PointerEvent'],
    controls: [
      { type: 'number', name: 'max', label: t.maxLabel, default: DEFAULTS.max, min: 2, max: 30, step: 1 },
      {
        type: 'number',
        name: 'perspective',
        label: t.perspectiveLabel,
        default: DEFAULTS.perspective,
        min: 300,
        max: 2000,
        step: 50,
      },
      { type: 'boolean', name: 'glare', label: t.glareLabel, default: DEFAULTS.glare },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: 'max', type: 'number', default: String(DEFAULTS.max), description: t.descMax },
      { name: 'perspective', type: 'number', default: String(DEFAULTS.perspective), description: t.descPerspective },
      { name: 'glare', type: 'boolean', default: 'true', description: t.descGlare },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => <TiltDemo max={v.max as number} perspective={v.perspective as number} glare={v.glare as boolean} />,
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'Tilt',
        propsType: 'TiltProps',
        name: 'Card',
        props: {
          max: v.max === DEFAULTS.max ? undefined : v.max,
          perspective: v.perspective === DEFAULTS.perspective ? undefined : v.perspective,
          glare: v.glare ? undefined : false,
        },
        children: '<div>Card</div>',
      }),
  };
};
