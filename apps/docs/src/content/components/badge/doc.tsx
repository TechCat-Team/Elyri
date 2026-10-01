import { Badge } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const copy = {
  zh: {
    description: '徽标：五种语义配色、两档尺寸，用于状态、标签与计数。',
    exBasic: '基础用法',
    exBasicDesc: '默认的 neutral 徽标。',
    exVariants: '全部变体',
    exVariantsDesc: '五种语义配色：neutral / accent / success / warning / danger。',
    exSizes: '尺寸',
    exSizesDesc: '两档尺寸：sm / md。',
    exBordered: '描边',
    exBorderedDesc: '默认带边框，可关闭得到无边框样式。',
    descVariant: '语义配色：neutral / accent / success / warning / danger',
    descSize: '控件尺寸：sm / md',
    descBordered: '是否显示边框，默认 true',
    descChildren: '徽标内容',
    descRest: '其余属性透传给原生 span',
  },
  en: {
    description: 'Badges with five semantic colours and two sizes, for statuses, labels and counts.',
    exBasic: 'Basic',
    exBasicDesc: 'The default neutral badge.',
    exVariants: 'Variants',
    exVariantsDesc: 'Five semantic colours: neutral / accent / success / warning / danger.',
    exSizes: 'Sizes',
    exSizesDesc: 'Two sizes: sm / md.',
    exBordered: 'Bordered',
    exBorderedDesc: 'Bordered by default; turn it off for a plain badge.',
    descVariant: 'Semantic colour: neutral / accent / success / warning / danger',
    descSize: 'Control size: sm / md',
    descBordered: 'Whether the border shows, defaults to true',
    descChildren: 'Badge content',
    descRest: 'Remaining props are forwarded to the native span',
  },
};

export const badgeDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'badge',
    title: 'Badge',
    category: 'Data Display',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      {
        name: 'variant',
        type: "'neutral' | 'accent' | 'success' | 'warning' | 'danger'",
        default: "'neutral'",
        description: t.descVariant,
      },
      { name: 'size', type: "'sm' | 'md'", default: "'md'", description: t.descSize },
      { name: 'bordered', type: 'boolean', default: 'true', description: t.descBordered },
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: '...rest', type: 'HTMLAttributes', description: t.descRest },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        render: () => (
          <div className="demo-ui-row">
            <Badge>New</Badge>
          </div>
        ),
        code: `import { Badge } from './components/elyri/Badge';

export function Example() {
  return <Badge>New</Badge>;
}`,
      },
      {
        title: t.exVariants,
        description: t.exVariantsDesc,
        render: () => (
          <div className="demo-ui-row">
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
          </div>
        ),
        code: `import { Badge } from './components/elyri/Badge';

export function Example() {
  return (
    <div className="demo-ui-row">
      <Badge variant="neutral">Neutral</Badge>
      <Badge variant="accent">Accent</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
    </div>
  );
}`,
      },
      {
        title: t.exSizes,
        description: t.exSizesDesc,
        render: () => (
          <div className="demo-ui-row">
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
          </div>
        ),
        code: `import { Badge } from './components/elyri/Badge';

export function Example() {
  return (
    <div className="demo-ui-row">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
    </div>
  );
}`,
      },
      {
        title: t.exBordered,
        description: t.exBorderedDesc,
        render: () => (
          <div className="demo-ui-row">
            <Badge bordered>Bordered</Badge>
            <Badge bordered={false}>Plain</Badge>
          </div>
        ),
        code: `import { Badge } from './components/elyri/Badge';

export function Example() {
  return (
    <div className="demo-ui-row">
      <Badge bordered>Bordered</Badge>
      <Badge bordered={false}>Plain</Badge>
    </div>
  );
}`,
      },
    ],
  };
};
