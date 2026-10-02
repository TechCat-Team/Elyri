import { Avatar, Skeleton } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const copy = {
  zh: {
    description: '骨架屏：内容加载前的占位，文本 / 矩形 / 圆形三种形状，流光与呼吸两种动画，自动适配深浅色主题。',
    exBasic: '基础用法',
    exBasicDesc: '默认 text 形状，lines 控制行数，末行自动收短。',
    exShapes: '形状',
    exShapesDesc: '三种形状：text / rect / circle，circle 只需传一个尺寸。',
    exComposition: '组合',
    exCompositionDesc: '按真实布局拼装，加载完成后用 loading={false} 切回内容。',
    exAnimations: '动画',
    exAnimationsDesc: '三种动画：shimmer / pulse / none；系统开启减少动态时自动降级为缓慢呼吸。',
    exChildren: '包裹子元素',
    exChildrenDesc: '传入 children 时尺寸跟随子元素，子元素本身不可见。',
    descShape: '形状：text / rect / circle',
    descWidth: '宽度，数字按 px 处理',
    descHeight: '高度，数字按 px 处理',
    descLines: '文本行数，仅 text 生效',
    descAnimation: '动画：shimmer / pulse / none',
    descLoading: '为 false 时直接渲染 children',
    descChildren: '加载完成后的内容；加载中用于撑开尺寸',
    descRest: '其余属性透传给原生 div；骨架自带 aria-hidden，建议在外层容器设置 aria-busy',
  },
  en: {
    description:
      'Loading placeholders in text, rect and circle shapes, with shimmer and pulse animations that adapt to light and dark themes.',
    exBasic: 'Basic',
    exBasicDesc: 'The default text shape; lines sets the line count and the last line is shortened.',
    exShapes: 'Shapes',
    exShapesDesc: 'Three shapes: text / rect / circle. A circle needs only one size.',
    exComposition: 'Composition',
    exCompositionDesc: 'Mirror the real layout, then switch back with loading={false}.',
    exAnimations: 'Animations',
    exAnimationsDesc: 'Three animations: shimmer / pulse / none. Falls back to a slow pulse under reduced motion.',
    exChildren: 'Wrapping children',
    exChildrenDesc: 'With children, the skeleton takes their size while hiding them.',
    descShape: 'Shape: text / rect / circle',
    descWidth: 'Width; numbers are treated as px',
    descHeight: 'Height; numbers are treated as px',
    descLines: 'Number of text lines, text shape only',
    descAnimation: 'Animation: shimmer / pulse / none',
    descLoading: 'Render children directly when false',
    descChildren: 'Loaded content; sizes the skeleton while loading',
    descRest:
      'Remaining props are forwarded to the native div; the skeleton is aria-hidden, so set aria-busy on its container',
  },
};

export const skeletonDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'skeleton',
    title: 'Skeleton',
    category: 'Feedback',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      { name: 'shape', type: "'text' | 'rect' | 'circle'", default: "'text'", description: t.descShape },
      { name: 'width', type: 'number | string', description: t.descWidth },
      { name: 'height', type: 'number | string', description: t.descHeight },
      { name: 'lines', type: 'number', default: '1', description: t.descLines },
      {
        name: 'animation',
        type: "'shimmer' | 'pulse' | 'none'",
        default: "'shimmer'",
        description: t.descAnimation,
      },
      { name: 'loading', type: 'boolean', default: 'true', description: t.descLoading },
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: '...rest', type: 'HTMLAttributes', description: t.descRest },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        wide: true,
        render: () => (
          <div className="demo-ui-stack">
            <Skeleton lines={3} />
          </div>
        ),
        code: `import { Skeleton } from './components/elyri/Skeleton';

export function Example() {
  return <Skeleton lines={3} />;
}`,
      },
      {
        title: t.exShapes,
        description: t.exShapesDesc,
        wide: true,
        render: () => (
          <div className="demo-ui-row">
            <Skeleton shape="circle" width={48} />
            <Skeleton shape="rect" width={120} height={72} />
            <Skeleton width={160} />
          </div>
        ),
        code: `import { Skeleton } from './components/elyri/Skeleton';

export function Example() {
  return (
    <div className="demo-ui-row">
      <Skeleton shape="circle" width={48} />
      <Skeleton shape="rect" width={120} height={72} />
      <Skeleton width={160} />
    </div>
  );
}`,
      },
      {
        title: t.exComposition,
        description: t.exCompositionDesc,
        wide: true,
        render: () => (
          <div
            aria-busy="true"
            style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 360 }}
          >
            <Skeleton shape="rect" height={160} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Skeleton shape="circle" width={40} />
              <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 8 }}>
                <Skeleton width="45%" height={14} />
                <Skeleton width="30%" height={10} />
              </div>
            </div>
            <Skeleton lines={3} height={10} />
          </div>
        ),
        code: `import { Skeleton } from './components/elyri/Skeleton';

export function Example() {
  return (
    <div aria-busy="true" style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
      <Skeleton shape="rect" height={160} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Skeleton shape="circle" width={40} />
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 8 }}>
          <Skeleton width="45%" height={14} />
          <Skeleton width="30%" height={10} />
        </div>
      </div>
      <Skeleton lines={3} height={10} />
    </div>
  );
}`,
      },
      {
        title: t.exAnimations,
        description: t.exAnimationsDesc,
        wide: true,
        render: () => (
          <div className="demo-ui-stack">
            <Skeleton animation="shimmer" height={12} />
            <Skeleton animation="pulse" height={12} />
            <Skeleton animation="none" height={12} />
          </div>
        ),
        code: `import { Skeleton } from './components/elyri/Skeleton';

export function Example() {
  return (
    <div className="demo-ui-stack">
      <Skeleton animation="shimmer" height={12} />
      <Skeleton animation="pulse" height={12} />
      <Skeleton animation="none" height={12} />
    </div>
  );
}`,
      },
      {
        title: t.exChildren,
        description: t.exChildrenDesc,
        render: () => (
          <div className="demo-ui-row">
            <Skeleton shape="circle">
              <Avatar name="Ada Lovelace" size="lg" />
            </Skeleton>
            <Avatar name="Ada Lovelace" size="lg" />
          </div>
        ),
        code: `import { Avatar } from './components/elyri/Avatar';
import { Skeleton } from './components/elyri/Skeleton';

export function Example({ loading }: { loading: boolean }) {
  return (
    <Skeleton shape="circle" loading={loading}>
      <Avatar name="Ada Lovelace" size="lg" />
    </Skeleton>
  );
}`,
      },
    ],
  };
};
