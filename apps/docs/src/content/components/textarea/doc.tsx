import { Textarea } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const copy = {
  zh: {
    description: '多行输入：与 Input 同款尺寸与失败态，autosize 时高度跟随内容。',
    exBasic: '基础用法',
    exBasicDesc: '默认的多行输入，可拖拽调整高度。',
    exSizes: '尺寸',
    exSizesDesc: '三档尺寸：sm / md / lg。',
    exAutosize: '自适应高度',
    exAutosizeDesc: 'autosize 开启后高度随内容增长，禁止手动拉伸。',
    exInvalid: '校验失败',
    exInvalidDesc: '红框提示并标记 aria-invalid。',
    exDisabled: '禁用',
    exDisabledDesc: '原生 disabled 状态，不可输入。',
    descSize: '控件尺寸：sm / md / lg',
    descInvalid: '校验失败态：红框并标记 aria-invalid',
    descAutosize: '高度随内容自适应，开启后禁止手动拉伸',
    descRest: '其余属性透传给原生 textarea',
  },
  en: {
    description:
      'A multiline input sharing the Input sizes and invalid state, with an optional content-driven autosize.',
    exBasic: 'Basic',
    exBasicDesc: 'The default textarea, resizable by dragging.',
    exSizes: 'Sizes',
    exSizesDesc: 'Three sizes: sm / md / lg.',
    exAutosize: 'Autosize',
    exAutosizeDesc: 'With autosize the height follows the content and manual resizing is off.',
    exInvalid: 'Invalid',
    exInvalidDesc: 'Red border plus aria-invalid.',
    exDisabled: 'Disabled',
    exDisabledDesc: 'The native disabled state.',
    descSize: 'Control size: sm / md / lg',
    descInvalid: 'Invalid state: red border plus aria-invalid',
    descAutosize: 'Grow the height with the content; disables manual resizing',
    descRest: 'Remaining props are forwarded to the native textarea',
  },
};

export const textareaDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'textarea',
    title: 'Textarea',
    category: 'Forms',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t.descSize },
      { name: 'invalid', type: 'boolean', default: 'false', description: t.descInvalid },
      { name: 'autosize', type: 'boolean', default: 'false', description: t.descAutosize },
      { name: '...rest', type: 'TextareaHTMLAttributes', description: t.descRest },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        render: () => <Textarea placeholder="写点什么……" />,
        code: `import { Textarea } from './components/elyri/Textarea';

export function Example() {
  return <Textarea placeholder="写点什么……" />;
}`,
      },
      {
        title: t.exSizes,
        description: t.exSizesDesc,
        render: () => (
          <div className="demo-stack">
            <Textarea size="sm" placeholder="Small" />
            <Textarea size="md" placeholder="Medium" />
            <Textarea size="lg" placeholder="Large" />
          </div>
        ),
        code: `import { Textarea } from './components/elyri/Textarea';

export function Example() {
  return (
    <div>
      <Textarea size="sm" placeholder="Small" />
      <Textarea size="md" placeholder="Medium" />
      <Textarea size="lg" placeholder="Large" />
    </div>
  );
}`,
      },
      {
        title: t.exAutosize,
        description: t.exAutosizeDesc,
        render: () => <Textarea autosize placeholder="输入长文本试试" />,
        code: `import { Textarea } from './components/elyri/Textarea';

export function Example() {
  return <Textarea autosize placeholder="输入长文本试试" />;
}`,
      },
      {
        title: t.exInvalid,
        description: t.exInvalidDesc,
        render: () => <Textarea invalid defaultValue="这段内容不符合要求" />,
        code: `import { Textarea } from './components/elyri/Textarea';

export function Example() {
  return <Textarea invalid defaultValue="这段内容不符合要求" />;
}`,
      },
      {
        title: t.exDisabled,
        description: t.exDisabledDesc,
        render: () => <Textarea placeholder="不可输入" disabled />,
        code: `import { Textarea } from './components/elyri/Textarea';

export function Example() {
  return <Textarea placeholder="不可输入" disabled />;
}`,
      },
    ],
  };
};
