import type { CSSProperties } from 'react';

import { Button, Divider, Tag } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const copy = {
  zh: {
    description:
      '分割线：横 / 纵两个方向、solid / dashed / dotted / gradient 四种线型，横向可带居中文字并控制对齐与留白。',
    exBasic: '基础用法',
    exBasicDesc: '默认横向实线，铺满父容器宽度。',
    exVariants: '线型',
    exVariantsDesc: 'solid / dashed / dotted / gradient 四种外观，gradient 两端自然淡出。',
    exLabel: '带文字',
    exLabelDesc: '在分割线中嵌入文字；align 控制文字靠 start / center / end。',
    exVertical: '纵向',
    exVerticalDesc: '纵向分割线随父级高度拉伸，适合分隔行内元素。',
    exSpacing: '间距',
    exSpacingDesc: 'spacing 控制横向的上下留白（纵向为左右留白）：none / sm / md / lg。',
    descOrientation: '方向：horizontal / vertical',
    descVariant: '线型：solid / dashed / dotted / gradient',
    descSpacing: '留白：none / sm / md / lg，默认 md',
    descLabel: '居中文字，仅横向生效',
    descAlign: '文字对齐：start / center / end，默认 center',
    descRest: '其余属性透传给原生 div',
  },
  en: {
    description:
      'A divider with horizontal/vertical orientations and solid / dashed / dotted / gradient styles. Horizontal dividers can carry a centred label with alignment and spacing controls.',
    exBasic: 'Basic',
    exBasicDesc: 'A horizontal solid line that fills its container by default.',
    exVariants: 'Variants',
    exVariantsDesc: 'solid / dashed / dotted / gradient; gradient fades out at both ends.',
    exLabel: 'With label',
    exLabelDesc: 'Embed text in the line; align controls start / center / end.',
    exVertical: 'Vertical',
    exVerticalDesc: 'A vertical divider stretches to its parent height, great between inline elements.',
    exSpacing: 'Spacing',
    exSpacingDesc: 'spacing sets block spacing (inline for vertical): none / sm / md / lg.',
    descOrientation: 'Orientation: horizontal / vertical',
    descVariant: 'Style: solid / dashed / dotted / gradient',
    descSpacing: 'Spacing: none / sm / md / lg, defaults to md',
    descLabel: 'Centred label, horizontal only',
    descAlign: 'Label alignment: start / center / end, defaults to center',
    descRest: 'Remaining props are forwarded to the native div',
  },
};

const variants = ['solid', 'dashed', 'dotted', 'gradient'] as const;

const stackStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: 'min(520px, 100%)',
  textAlign: 'left',
};

const labelsStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: 'min(520px, 100%)',
  textAlign: 'left',
};

const verticalRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'center',
  gap: 4,
};

const spacingStyle: CSSProperties = { width: 'min(520px, 100%)', textAlign: 'left' };

export const dividerDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'divider',
    title: 'Divider',
    category: 'Data Display',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      {
        name: 'orientation',
        type: "'horizontal' | 'vertical'",
        default: "'horizontal'",
        description: t.descOrientation,
      },
      {
        name: 'variant',
        type: "'solid' | 'dashed' | 'dotted' | 'gradient'",
        default: "'solid'",
        description: t.descVariant,
      },
      { name: 'spacing', type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: t.descSpacing },
      { name: 'label', type: 'ReactNode', description: t.descLabel },
      { name: 'align', type: "'start' | 'center' | 'end'", default: "'center'", description: t.descAlign },
      { name: '...rest', type: 'HTMLAttributes', description: t.descRest },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        render: () => (
          <div style={stackStyle}>
            <Divider />
          </div>
        ),
        code: `import { Divider } from './components/elyri/Divider';

export function Example() {
  return <Divider />;
}`,
      },
      {
        title: t.exVariants,
        description: t.exVariantsDesc,
        render: () => (
          <div style={stackStyle}>
            {variants.map((variant) => (
              <Divider key={variant} variant={variant} label={variant} />
            ))}
          </div>
        ),
        code: `import { Divider } from './components/elyri/Divider';

const variants = ['solid', 'dashed', 'dotted', 'gradient'] as const;

export function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 'min(520px, 100%)' }}>
      {variants.map((variant) => (
        <Divider key={variant} variant={variant} label={variant} />
      ))}
    </div>
  );
}`,
      },
      {
        title: t.exLabel,
        description: t.exLabelDesc,
        render: () => (
          <div style={labelsStyle}>
            <Divider label="Center" variant="gradient" />
            <Divider label="Start" align="start" variant="gradient" />
            <Divider label="End" align="end" variant="gradient" />
          </div>
        ),
        code: `import { Divider } from './components/elyri/Divider';

export function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 'min(520px, 100%)' }}>
      <Divider label="Center" variant="gradient" />
      <Divider label="Start" align="start" variant="gradient" />
      <Divider label="End" align="end" variant="gradient" />
    </div>
  );
}`,
      },
      {
        title: t.exVertical,
        description: t.exVerticalDesc,
        render: () => (
          <div style={verticalRowStyle}>
            <Tag>Draft</Tag>
            <Divider orientation="vertical" />
            <Tag variant="accent">Review</Tag>
            <Divider orientation="vertical" variant="dashed" />
            <Tag variant="success">Done</Tag>
          </div>
        ),
        code: `import { Divider } from './components/elyri/Divider';
import { Tag } from './components/elyri/Tag';

export function Example() {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 4 }}>
      <Tag>Draft</Tag>
      <Divider orientation="vertical" />
      <Tag variant="accent">Review</Tag>
      <Divider orientation="vertical" variant="dashed" />
      <Tag variant="success">Done</Tag>
    </div>
  );
}`,
      },
      {
        title: t.exSpacing,
        description: t.exSpacingDesc,
        render: () => (
          <div style={spacingStyle}>
            <Button size="sm" variant="ghost">
              Delete account
            </Button>
            <Divider spacing="sm" />
            <Button size="sm" variant="ghost">
              Export data
            </Button>
            <Divider spacing="lg" label="Danger zone" />
            <Button size="sm" variant="danger">
              Remove workspace
            </Button>
          </div>
        ),
        code: `import { Button } from './components/elyri/Button';
import { Divider } from './components/elyri/Divider';

export function Example() {
  return (
    <div style={{ width: 'min(520px, 100%)' }}>
      <Button size="sm" variant="ghost">Delete account</Button>
      <Divider spacing="sm" />
      <Button size="sm" variant="ghost">Export data</Button>
      <Divider spacing="lg" label="Danger zone" />
      <Button size="sm" variant="danger">Remove workspace</Button>
    </div>
  );
}`,
      },
    ],
  };
};
