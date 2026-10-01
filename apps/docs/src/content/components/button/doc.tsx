import { useEffect, useState } from 'react';

import { Button } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

/** 基础用法示例：点击后进入加载态，2.5 秒后自动恢复 */
function BasicExample() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <div className="demo-ui-row">
      <Button loading={loading} onClick={() => setLoading(true)}>
        Get started
      </Button>
    </div>
  );
}

const copy = {
  zh: {
    description: '按钮：四种视觉样式、三档尺寸，内置加载态与焦点环，其余属性透传给原生 button。',
    exBasic: '基础用法',
    exBasicDesc: '点击后进入加载态，2.5 秒后自动恢复。',
    exVariants: '全部变体',
    exVariantsDesc: '四种视觉样式：primary / secondary / ghost / danger。',
    exSizes: '尺寸',
    exSizesDesc: '三档尺寸：sm / md / lg。',
    exLoading: '加载态',
    exLoadingDesc: '显示 spinner、置为禁用并标记 aria-busy。',
    exDisabled: '禁用态',
    exDisabledDesc: '原生 disabled 状态，不可点击。',
    descVariant: '视觉样式：primary / secondary / ghost / danger',
    descSize: '控件尺寸：sm / md / lg',
    descLoading: '加载中：显示 spinner、置为禁用并标记 aria-busy',
    descChildren: '按钮内容',
    descRest: '其余属性透传给原生 button',
  },
  en: {
    description: 'Buttons with four visual styles, three sizes, a built-in loading state and a focus ring.',
    exBasic: 'Basic',
    exBasicDesc: 'Click to enter the loading state, which resets after 2.5 seconds.',
    exVariants: 'Variants',
    exVariantsDesc: 'Four visual styles: primary / secondary / ghost / danger.',
    exSizes: 'Sizes',
    exSizesDesc: 'Three sizes: sm / md / lg.',
    exLoading: 'Loading',
    exLoadingDesc: 'Shows a spinner, disables the button and sets aria-busy.',
    exDisabled: 'Disabled',
    exDisabledDesc: 'The native disabled state.',
    descVariant: 'Visual style: primary / secondary / ghost / danger',
    descSize: 'Control size: sm / md / lg',
    descLoading: 'Shows a spinner, disables the button and sets aria-busy',
    descChildren: 'Button content',
    descRest: 'Remaining props are forwarded to the native button',
  },
};

export const buttonDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'button',
    title: 'Button',
    category: 'Forms',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      {
        name: 'variant',
        type: "'primary' | 'secondary' | 'ghost' | 'danger'",
        default: "'primary'",
        description: t.descVariant,
      },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t.descSize },
      { name: 'loading', type: 'boolean', default: 'false', description: t.descLoading },
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: '...rest', type: 'ButtonHTMLAttributes', description: t.descRest },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        render: () => <BasicExample />,
        code: `import { useEffect, useState } from 'react';

import { Button } from './components/elyri/Button';

export function Example() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <Button loading={loading} onClick={() => setLoading(true)}>
      Get started
    </Button>
  );
}`,
      },
      {
        title: t.exVariants,
        description: t.exVariantsDesc,
        render: () => (
          <div className="demo-ui-row">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Delete</Button>
          </div>
        ),
        code: `import { Button } from './components/elyri/Button';

export function Example() {
  return (
    <div className="demo-ui-row">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Delete</Button>
    </div>
  );
}`,
      },
      {
        title: t.exSizes,
        description: t.exSizesDesc,
        render: () => (
          <div className="demo-ui-row">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        ),
        code: `import { Button } from './components/elyri/Button';

export function Example() {
  return (
    <div className="demo-ui-row">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  );
}`,
      },
      {
        title: t.exLoading,
        description: t.exLoadingDesc,
        render: () => (
          <div className="demo-ui-row">
            <Button loading>Submitting</Button>
            <Button variant="secondary" loading>
              Saving
            </Button>
          </div>
        ),
        code: `import { Button } from './components/elyri/Button';

export function Example() {
  return (
    <div className="demo-ui-row">
      <Button loading>Submitting</Button>
      <Button variant="secondary" loading>
        Saving
      </Button>
    </div>
  );
}`,
      },
      {
        title: t.exDisabled,
        description: t.exDisabledDesc,
        render: () => (
          <div className="demo-ui-row">
            <Button disabled>Primary</Button>
            <Button variant="secondary" disabled>
              Secondary
            </Button>
          </div>
        ),
        code: `import { Button } from './components/elyri/Button';

export function Example() {
  return (
    <div className="demo-ui-row">
      <Button disabled>Primary</Button>
      <Button variant="secondary" disabled>
        Secondary
      </Button>
    </div>
  );
}`,
      },
    ],
  };
};
