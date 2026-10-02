import { Tag } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const copy = {
  zh: {
    description: '标签：五种语义配色、两档尺寸，用于状态、分类与计数。',
    exBasic: '基础用法',
    exBasicDesc: '默认的 neutral 标签。',
    exVariants: '全部变体',
    exVariantsDesc: '五种语义配色：neutral / accent / success / warning / danger。',
    exSizes: '尺寸',
    exSizesDesc: '两档尺寸：sm / md。',
    exBordered: '描边',
    exBorderedDesc: '默认带边框，可关闭得到无边框样式。',
    descVariant: '语义配色：neutral / accent / success / warning / danger',
    descSize: '控件尺寸：sm / md',
    descBordered: '是否显示边框，默认 true',
    descChildren: '标签内容',
    descRest: '其余属性透传给原生 span',
  },
  en: {
    description: 'Tags with five semantic colours and two sizes, for statuses, categories and counts.',
    exBasic: 'Basic',
    exBasicDesc: 'The default neutral tag.',
    exVariants: 'Variants',
    exVariantsDesc: 'Five semantic colours: neutral / accent / success / warning / danger.',
    exSizes: 'Sizes',
    exSizesDesc: 'Two sizes: sm / md.',
    exBordered: 'Bordered',
    exBorderedDesc: 'Bordered by default; turn it off for a plain tag.',
    descVariant: 'Semantic colour: neutral / accent / success / warning / danger',
    descSize: 'Control size: sm / md',
    descBordered: 'Whether the border shows, defaults to true',
    descChildren: 'Tag content',
    descRest: 'Remaining props are forwarded to the native span',
  },
};

export const tagDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'tag',
    title: 'Tag',
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
            <Tag>New</Tag>
          </div>
        ),
        code: `import { Tag } from './components/elyri/Tag';

export function Example() {
  return <Tag>New</Tag>;
}`,
      },
      {
        title: t.exVariants,
        description: t.exVariantsDesc,
        render: () => (
          <div className="demo-ui-row">
            <Tag variant="neutral">Neutral</Tag>
            <Tag variant="accent">Accent</Tag>
            <Tag variant="success">Success</Tag>
            <Tag variant="warning">Warning</Tag>
            <Tag variant="danger">Danger</Tag>
          </div>
        ),
        code: `import { Tag } from './components/elyri/Tag';

export function Example() {
  return (
    <div className="demo-ui-row">
      <Tag variant="neutral">Neutral</Tag>
      <Tag variant="accent">Accent</Tag>
      <Tag variant="success">Success</Tag>
      <Tag variant="warning">Warning</Tag>
      <Tag variant="danger">Danger</Tag>
    </div>
  );
}`,
      },
      {
        title: t.exSizes,
        description: t.exSizesDesc,
        render: () => (
          <div className="demo-ui-row">
            <Tag size="sm">Small</Tag>
            <Tag size="md">Medium</Tag>
          </div>
        ),
        code: `import { Tag } from './components/elyri/Tag';

export function Example() {
  return (
    <div className="demo-ui-row">
      <Tag size="sm">Small</Tag>
      <Tag size="md">Medium</Tag>
    </div>
  );
}`,
      },
      {
        title: t.exBordered,
        description: t.exBorderedDesc,
        render: () => (
          <div className="demo-ui-row">
            <Tag bordered>Bordered</Tag>
            <Tag bordered={false}>Plain</Tag>
          </div>
        ),
        code: `import { Tag } from './components/elyri/Tag';

export function Example() {
  return (
    <div className="demo-ui-row">
      <Tag bordered>Bordered</Tag>
      <Tag bordered={false}>Plain</Tag>
    </div>
  );
}`,
      },
    ],
  };
};
