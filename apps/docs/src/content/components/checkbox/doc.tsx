import { useState } from 'react';

import { Checkbox } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const copy = {
  zh: {
    description: '复选框：视觉隐藏的原生 input 承载键盘与表单行为，自绘勾选与半选图形。',
    exBasic: '基础用法',
    exBasicDesc: 'children 作为标签文案，点击文案即可切换。',
    exControlled: '受控用法',
    exControlledDesc: 'checked 与 onCheckedChange 驱动，外部状态为唯一数据源。',
    exIndeterminate: '半选态',
    exIndeterminateDesc: '常见于「全选」场景，标记 aria-checked="mixed"。',
    exDisabled: '禁用',
    exDisabledDesc: '勾选与未勾选两种禁用状态。',
    descChecked: '受控选中状态；不传则为非受控',
    descDefaultChecked: '非受控初始状态，默认 false',
    descOnCheckedChange: '选中状态变化回调，受控与非受控都会触发',
    descIndeterminate: '半选态：横线图形 + aria-checked="mixed"',
    descChildren: '标签文案，渲染在复选框右侧',
    descSize: '控件尺寸：sm / md',
    descRest: '其余属性透传给原生 input',
  },
  en: {
    description:
      'A checkbox that keeps the native input for keyboard and form behaviour while drawing its own checkmark.',
    exBasic: 'Basic',
    exBasicDesc: 'children render as the label text; click it to toggle.',
    exControlled: 'Controlled',
    exControlledDesc: 'Driven by checked and onCheckedChange; the external state is the source of truth.',
    exIndeterminate: 'Indeterminate',
    exIndeterminateDesc: 'Common for "select all"; sets aria-checked="mixed".',
    exDisabled: 'Disabled',
    exDisabledDesc: 'Both the checked and unchecked disabled states.',
    descChecked: 'Controlled value; omit it to run uncontrolled',
    descDefaultChecked: 'Initial value when uncontrolled, default false',
    descOnCheckedChange: 'Called on every change, controlled or not',
    descIndeterminate: 'Indeterminate state: dash glyph plus aria-checked="mixed"',
    descChildren: 'Label text, rendered to the right of the box',
    descSize: 'Control size: sm / md',
    descRest: 'Remaining props are forwarded to the native input',
  },
};

function ControlledExample() {
  const [checked, setChecked] = useState(false);

  return (
    <Checkbox checked={checked} onCheckedChange={setChecked}>
      订阅周报（{checked ? '已订阅' : '未订阅'}）
    </Checkbox>
  );
}

export const checkboxDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'checkbox',
    title: 'Checkbox',
    category: 'Forms',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      { name: 'checked', type: 'boolean', description: t.descChecked },
      { name: 'defaultChecked', type: 'boolean', default: 'false', description: t.descDefaultChecked },
      { name: 'onCheckedChange', type: '(checked: boolean) => void', description: t.descOnCheckedChange },
      { name: 'indeterminate', type: 'boolean', default: 'false', description: t.descIndeterminate },
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: 'size', type: "'sm' | 'md'", default: "'md'", description: t.descSize },
      { name: '...rest', type: 'InputHTMLAttributes', description: t.descRest },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        render: () => (
          <div className="demo-stack">
            <Checkbox defaultChecked>记住我</Checkbox>
            <Checkbox>接收产品动态</Checkbox>
          </div>
        ),
        code: `import { Checkbox } from './components/elyri/Checkbox';

export function Example() {
  return (
    <div>
      <Checkbox defaultChecked>记住我</Checkbox>
      <Checkbox>接收产品动态</Checkbox>
    </div>
  );
}`,
      },
      {
        title: t.exControlled,
        description: t.exControlledDesc,
        render: () => (
          <div className="demo-stack">
            <ControlledExample />
          </div>
        ),
        code: `import { useState } from 'react';
import { Checkbox } from './components/elyri/Checkbox';

export function Example() {
  const [checked, setChecked] = useState(false);

  return <Checkbox checked={checked} onCheckedChange={setChecked}>订阅周报</Checkbox>;
}`,
      },
      {
        title: t.exIndeterminate,
        description: t.exIndeterminateDesc,
        render: () => (
          <div className="demo-stack">
            <Checkbox indeterminate>全部项目</Checkbox>
          </div>
        ),
        code: `import { Checkbox } from './components/elyri/Checkbox';

export function Example() {
  return <Checkbox indeterminate>全部项目</Checkbox>;
}`,
      },
      {
        title: t.exDisabled,
        description: t.exDisabledDesc,
        render: () => (
          <div className="demo-stack">
            <Checkbox disabled defaultChecked>
              已选且禁用
            </Checkbox>
            <Checkbox disabled>未选且禁用</Checkbox>
          </div>
        ),
        code: `import { Checkbox } from './components/elyri/Checkbox';

export function Example() {
  return (
    <div>
      <Checkbox disabled defaultChecked>已选且禁用</Checkbox>
      <Checkbox disabled>未选且禁用</Checkbox>
    </div>
  );
}`,
      },
    ],
  };
};
