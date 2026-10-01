import { Progress } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const DEFAULTS = {
  variant: 'accent',
  size: 'md',
};

const copy = {
  zh: {
    description: '进度条：确定与不确定两种形态，四档语义配色，可显示百分比，暴露标准 progressbar 语义。',
    exBasic: '基础用法',
    exBasicDesc: '设置 value 与无障碍 label，可同时显示百分比。',
    exIndeterminate: '不确定进度',
    exIndeterminateDesc: '不确定进度：循环动画，不暴露具体数值。',
    exSizes: '尺寸',
    exSizesDesc: '两档粗细：sm / md。',
    exVariants: '全部变体',
    exVariantsDesc: '四档语义配色：accent / success / warning / danger。',
    descValue: '当前值，范围 0–max',
    descMax: '最大值，默认 100',
    descIndeterminate: '不确定进度：循环动画，不暴露具体数值',
    descSize: '粗细：sm / md',
    descVariant: '颜色：accent / success / warning / danger',
    descShowValue: '在右侧显示百分比',
    descLabel: '无障碍名称',
    descRest: '其余属性透传给原生 div',
  },
  en: {
    description: 'Progress bars in determinate and indeterminate modes, with four semantic colors and a standard role.',
    exBasic: 'Basic',
    exBasicDesc: 'Set a value and an accessible label; the percentage can be shown too.',
    exIndeterminate: 'Indeterminate',
    exIndeterminateDesc: 'A looping animation without a concrete value.',
    exSizes: 'Sizes',
    exSizesDesc: 'Two thicknesses: sm / md.',
    exVariants: 'Variants',
    exVariantsDesc: 'Four semantic colors: accent / success / warning / danger.',
    descValue: 'Current value, from 0 to max',
    descMax: 'Maximum value, defaults to 100',
    descIndeterminate: 'Looping animation without a concrete value',
    descSize: 'Thickness: sm / md',
    descVariant: 'Color: accent / success / warning / danger',
    descShowValue: 'Show the percentage on the right',
    descLabel: 'Accessible name',
    descRest: 'Remaining props are forwarded to the native div',
  },
};

export const progressDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'progress',
    title: 'Progress',
    category: 'Feedback',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      { name: 'value', type: 'number', default: '0', description: t.descValue },
      { name: 'max', type: 'number', default: '100', description: t.descMax },
      { name: 'indeterminate', type: 'boolean', default: 'false', description: t.descIndeterminate },
      { name: 'size', type: "'sm' | 'md'", default: `'${DEFAULTS.size}'`, description: t.descSize },
      {
        name: 'variant',
        type: "'accent' | 'success' | 'warning' | 'danger'",
        default: `'${DEFAULTS.variant}'`,
        description: t.descVariant,
      },
      { name: 'showValue', type: 'boolean', default: 'false', description: t.descShowValue },
      { name: 'label', type: 'string', description: t.descLabel },
      { name: '...rest', type: 'HTMLAttributes', description: t.descRest },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        wide: true,
        render: () => (
          <div className="demo-ui-stack">
            <Progress value={60} label="Progress" showValue />
          </div>
        ),
        code: `import { Progress } from './components/elyri/Progress';

export function Example() {
  return <Progress value={60} label="Progress" showValue />;
}`,
      },
      {
        title: t.exIndeterminate,
        description: t.exIndeterminateDesc,
        wide: true,
        render: () => (
          <div className="demo-ui-stack">
            <Progress indeterminate label="Loading" />
          </div>
        ),
        code: `import { Progress } from './components/elyri/Progress';

export function Example() {
  return <Progress indeterminate label="Loading" />;
}`,
      },
      {
        title: t.exSizes,
        description: t.exSizesDesc,
        wide: true,
        render: () => (
          <div className="demo-ui-stack">
            <Progress value={60} size="sm" label="Small" showValue />
            <Progress value={60} size="md" label="Medium" showValue />
          </div>
        ),
        code: `import { Progress } from './components/elyri/Progress';

export function Example() {
  return (
    <div className="demo-ui-stack">
      <Progress value={60} size="sm" label="Small" showValue />
      <Progress value={60} size="md" label="Medium" showValue />
    </div>
  );
}`,
      },
      {
        title: t.exVariants,
        description: t.exVariantsDesc,
        wide: true,
        render: () => (
          <div className="demo-ui-stack">
            <Progress value={60} variant="accent" label="Accent" showValue />
            <Progress value={60} variant="success" label="Success" showValue />
            <Progress value={60} variant="warning" label="Warning" showValue />
            <Progress value={60} variant="danger" label="Danger" showValue />
          </div>
        ),
        code: `import { Progress } from './components/elyri/Progress';

export function Example() {
  return (
    <div className="demo-ui-stack">
      <Progress value={60} variant="accent" label="Accent" showValue />
      <Progress value={60} variant="success" label="Success" showValue />
      <Progress value={60} variant="warning" label="Warning" showValue />
      <Progress value={60} variant="danger" label="Danger" showValue />
    </div>
  );
}`,
      },
    ],
  };
};
