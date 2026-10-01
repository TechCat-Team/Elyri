import { Input } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const copy = {
  zh: {
    description: '输入框：三档尺寸，支持校验失败态，其余属性透传给原生 input。',
    exBasic: '基础用法',
    exBasicDesc: '默认的输入框，仅需一个 placeholder。',
    exSizes: '尺寸',
    exSizesDesc: '三档尺寸：sm / md / lg。',
    exInvalid: '校验失败',
    exInvalidDesc: '红框提示并标记 aria-invalid。',
    exDisabled: '禁用',
    exDisabledDesc: '原生 disabled 状态，不可输入。',
    descSize: '控件尺寸：sm / md / lg',
    descInvalid: '校验失败态：红框并标记 aria-invalid',
    descRest: '其余属性透传给原生 input',
  },
  en: {
    description: 'Text inputs with three sizes and an invalid state, forwarding everything else to the native input.',
    exBasic: 'Basic',
    exBasicDesc: 'The default input, just a placeholder.',
    exSizes: 'Sizes',
    exSizesDesc: 'Three sizes: sm / md / lg.',
    exInvalid: 'Invalid',
    exInvalidDesc: 'Red border plus aria-invalid.',
    exDisabled: 'Disabled',
    exDisabledDesc: 'The native disabled state.',
    descSize: 'Control size: sm / md / lg',
    descInvalid: 'Invalid state: red border plus aria-invalid',
    descRest: 'Remaining props are forwarded to the native input',
  },
};

export const inputDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'input',
    title: 'Input',
    category: 'Forms',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t.descSize },
      { name: 'invalid', type: 'boolean', default: 'false', description: t.descInvalid },
      { name: '...rest', type: 'InputHTMLAttributes', description: t.descRest },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        render: () => (
          <div className="demo-ui-row">
            <Input placeholder="you@example.com" />
          </div>
        ),
        code: `import { Input } from './components/elyri/Input';

export function Example() {
  return <Input placeholder="you@example.com" />;
}`,
      },
      {
        title: t.exSizes,
        description: t.exSizesDesc,
        render: () => (
          <div className="demo-ui-row">
            <Input size="sm" placeholder="Small" />
            <Input size="md" placeholder="Medium" />
            <Input size="lg" placeholder="Large" />
          </div>
        ),
        code: `import { Input } from './components/elyri/Input';

export function Example() {
  return (
    <div className="demo-ui-row">
      <Input size="sm" placeholder="Small" />
      <Input size="md" placeholder="Medium" />
      <Input size="lg" placeholder="Large" />
    </div>
  );
}`,
      },
      {
        title: t.exInvalid,
        description: t.exInvalidDesc,
        render: () => (
          <div className="demo-stack">
            <label className="demo-ui-field">
              <span className="demo-ui-label">Email · invalid</span>
              <Input invalid placeholder="you@example.com" defaultValue="hello@elyri.dev" />
            </label>
          </div>
        ),
        code: `import { Input } from './components/elyri/Input';

export function Example() {
  return (
    <label className="demo-ui-field">
      <span className="demo-ui-label">Email · invalid</span>
      <Input invalid placeholder="you@example.com" defaultValue="hello@elyri.dev" />
    </label>
  );
}`,
      },
      {
        title: t.exDisabled,
        description: t.exDisabledDesc,
        render: () => (
          <div className="demo-stack">
            <label className="demo-ui-field">
              <span className="demo-ui-label">Disabled</span>
              <Input placeholder="Not available" disabled />
            </label>
          </div>
        ),
        code: `import { Input } from './components/elyri/Input';

export function Example() {
  return <Input placeholder="Not available" disabled />;
}`,
      },
    ],
  };
};
