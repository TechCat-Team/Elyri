import { Button, Empty } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const DEFAULTS = {
  variant: 'default',
  size: 'md',
};

const checkIcon = (
  <svg
    width="56"
    height="56"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.5 2.5 2.5L16 9.5" />
  </svg>
);

const copy = {
  zh: {
    description: '空状态：内置三款随主题变色的插画，可带标题、描述与操作，也可替换为自定义图像。',
    exBasic: '基础用法',
    exBasicDesc: '标题 + 描述 + 操作，适合列表、表格、卡片无数据时。',
    exVariants: '内置插画',
    exVariantsDesc: 'default / search / inbox 三款，配色全部取自主题变量。',
    exSizes: '尺寸',
    exSizesDesc: 'sm / md / lg 三档，插画与文字同步缩放。',
    exImage: '自定义图像',
    exImageDesc: '通过 image 替换插画，传 null 则只保留文字。',
    descVariant: '内置插画：default / search / inbox',
    descSize: '尺寸：sm / md / lg',
    descImage: '自定义插画，覆盖内置插画；传 null 隐藏',
    descTitle: '标题',
    descAction: '底部操作区',
    descChildren: '描述文字',
    descRest: '其余属性透传给原生 div',
  },
  en: {
    description: 'Empty states with three theme-aware illustrations, an optional title, description and actions.',
    exBasic: 'Basic',
    exBasicDesc: 'Title, description and an action — for empty lists, tables and cards.',
    exVariants: 'Illustrations',
    exVariantsDesc: 'default / search / inbox, all colored from theme tokens.',
    exSizes: 'Sizes',
    exSizesDesc: 'sm / md / lg; the illustration scales with the text.',
    exImage: 'Custom image',
    exImageDesc: 'Swap the illustration via image, or pass null to keep only the text.',
    descVariant: 'Built-in illustration: default / search / inbox',
    descSize: 'Size: sm / md / lg',
    descImage: 'Custom illustration overriding the built-in one; pass null to hide it',
    descTitle: 'Title',
    descAction: 'Footer actions',
    descChildren: 'Description',
    descRest: 'Remaining props are forwarded to the native div',
  },
};

export const emptyDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'empty',
    title: 'Empty',
    category: 'Data Display',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      {
        name: 'variant',
        type: "'default' | 'search' | 'inbox'",
        default: `'${DEFAULTS.variant}'`,
        description: t.descVariant,
      },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: `'${DEFAULTS.size}'`, description: t.descSize },
      { name: 'image', type: 'ReactNode', description: t.descImage },
      { name: 'title', type: 'ReactNode', description: t.descTitle },
      { name: 'action', type: 'ReactNode', description: t.descAction },
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: '...rest', type: 'HTMLAttributes', description: t.descRest },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        render: () => (
          <Empty title="No projects yet" action={<Button size="sm">Create project</Button>}>
            Projects you create will show up here.
          </Empty>
        ),
        code: `import { Button } from './components/elyri/Button';
import { Empty } from './components/elyri/Empty';

export function Example() {
  return (
    <Empty title="No projects yet" action={<Button size="sm">Create project</Button>}>
      Projects you create will show up here.
    </Empty>
  );
}`,
      },
      {
        title: t.exVariants,
        description: t.exVariantsDesc,
        render: () => (
          <div className="demo-ui-grid">
            <Empty size="sm" title="No documents" />
            <Empty size="sm" variant="search" title="No results" />
            <Empty size="sm" variant="inbox" title="Inbox zero" />
          </div>
        ),
        code: `import { Empty } from './components/elyri/Empty';

export function Example() {
  return (
    <div className="demo-ui-grid">
      <Empty size="sm" title="No documents" />
      <Empty size="sm" variant="search" title="No results" />
      <Empty size="sm" variant="inbox" title="Inbox zero" />
    </div>
  );
}`,
      },
      {
        title: t.exSizes,
        description: t.exSizesDesc,
        render: () => (
          <div className="demo-ui-row">
            <Empty size="sm" title="Small" />
            <Empty size="md" title="Medium" />
            <Empty size="lg" title="Large" />
          </div>
        ),
        code: `import { Empty } from './components/elyri/Empty';

export function Example() {
  return (
    <div className="demo-ui-row">
      <Empty size="sm" title="Small" />
      <Empty size="md" title="Medium" />
      <Empty size="lg" title="Large" />
    </div>
  );
}`,
      },
      {
        title: t.exImage,
        description: t.exImageDesc,
        render: () => (
          <div className="demo-ui-row">
            <Empty image={checkIcon} title="All clear">
              Nothing left to review.
            </Empty>
            <Empty image={null} title="No activity">
              Recent changes will appear here.
            </Empty>
          </div>
        ),
        code: `import { Empty } from './components/elyri/Empty';

const checkIcon = (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.5 2.5 2.5L16 9.5" />
  </svg>
);

export function Example() {
  return (
    <div className="demo-ui-row">
      <Empty image={checkIcon} title="All clear">
        Nothing left to review.
      </Empty>
      <Empty image={null} title="No activity">
        Recent changes will appear here.
      </Empty>
    </div>
  );
}`,
      },
    ],
  };
};
