import { useState } from 'react';

import { Checkbox, CheckboxGroup } from '@elyri/ui';

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
    exGroup: '复选组',
    exGroupDesc: 'CheckboxGroup 统一管理多选，value / onValueChange 驱动选中项集合。',
    exGroupOrientation: '纵向排列',
    exGroupOrientationDesc: 'orientation="vertical" 让选项纵向堆叠，默认横向。',
    exDisabled: '禁用',
    exDisabledDesc: '勾选与未勾选两种禁用状态。',
    descChecked: '受控选中状态；不传则为非受控',
    descDefaultChecked: '非受控初始状态，默认 false',
    descOnCheckedChange: '选中状态变化回调，受控与非受控都会触发',
    descIndeterminate: '半选态：横线图形 + aria-checked="mixed"',
    descChildren: '标签文案，渲染在复选框右侧',
    descSize: '控件尺寸：sm / md',
    descValue: '选项值，放入 CheckboxGroup 时决定该选项是否选中',
    descGroupValue: '受控选中项集合（CheckboxGroup）',
    descGroupDefaultValue: '非受控初始选中项集合（CheckboxGroup）',
    descGroupOnValueChange: '选中项变化回调，受控与非受控都会触发（CheckboxGroup）',
    descGroupOrientation: '排列方向，默认 horizontal（CheckboxGroup）',
    descGroupDisabled: '组级禁用，作用于全部选项（CheckboxGroup）',
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
    exGroup: 'Grouped',
    exGroupDesc: 'CheckboxGroup owns the multi-select value through value / onValueChange.',
    exGroupOrientation: 'Vertical layout',
    exGroupOrientationDesc: 'Pass orientation="vertical" to stack the options; horizontal is the default.',
    exDisabled: 'Disabled',
    exDisabledDesc: 'Both the checked and unchecked disabled states.',
    descChecked: 'Controlled value; omit it to run uncontrolled',
    descDefaultChecked: 'Initial value when uncontrolled, default false',
    descOnCheckedChange: 'Called on every change, controlled or not',
    descIndeterminate: 'Indeterminate state: dash glyph plus aria-checked="mixed"',
    descChildren: 'Label text, rendered to the right of the box',
    descSize: 'Control size: sm / md',
    descValue: 'The option value; determines the checked state inside a CheckboxGroup',
    descGroupValue: 'Controlled selection set (CheckboxGroup)',
    descGroupDefaultValue: 'Initial selection when uncontrolled (CheckboxGroup)',
    descGroupOnValueChange: 'Called whenever the selection set changes (CheckboxGroup)',
    descGroupOrientation: 'Layout direction, horizontal by default (CheckboxGroup)',
    descGroupDisabled: 'Disable every option from the group (CheckboxGroup)',
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

function GroupedExample() {
  const [value, setValue] = useState(['email', 'sms']);

  return (
    <CheckboxGroup value={value} onValueChange={setValue}>
      <CheckboxGroup.Checkbox value="email">邮件</CheckboxGroup.Checkbox>
      <CheckboxGroup.Checkbox value="sms">短信</CheckboxGroup.Checkbox>
      <CheckboxGroup.Checkbox value="push">推送</CheckboxGroup.Checkbox>
    </CheckboxGroup>
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
      { name: 'value', type: 'string', description: t.descValue },
      { name: 'size', type: "'sm' | 'md'", default: "'md'", description: t.descSize },
      { name: '...rest', type: 'InputHTMLAttributes', description: t.descRest },
      { name: 'CheckboxGroup.value', type: 'string[]', description: t.descGroupValue },
      { name: 'CheckboxGroup.defaultValue', type: 'string[]', description: t.descGroupDefaultValue },
      {
        name: 'CheckboxGroup.onValueChange',
        type: '(value: string[]) => void',
        description: t.descGroupOnValueChange,
      },
      {
        name: 'CheckboxGroup.orientation',
        type: "'horizontal' | 'vertical'",
        default: "'horizontal'",
        description: t.descGroupOrientation,
      },
      { name: 'CheckboxGroup.disabled', type: 'boolean', default: 'false', description: t.descGroupDisabled },
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
        title: t.exGroup,
        description: t.exGroupDesc,
        render: () => <GroupedExample />,
        code: `import { useState } from 'react';
import { CheckboxGroup } from './components/elyri/Checkbox';

export function Example() {
  const [value, setValue] = useState(['email', 'sms']);

  return (
    <CheckboxGroup value={value} onValueChange={setValue}>
      <CheckboxGroup.Checkbox value="email">邮件</CheckboxGroup.Checkbox>
      <CheckboxGroup.Checkbox value="sms">短信</CheckboxGroup.Checkbox>
      <CheckboxGroup.Checkbox value="push">推送</CheckboxGroup.Checkbox>
    </CheckboxGroup>
  );
}`,
      },
      {
        title: t.exGroupOrientation,
        description: t.exGroupOrientationDesc,
        render: () => (
          <CheckboxGroup orientation="vertical" defaultValue={['apple']}>
            <CheckboxGroup.Checkbox value="apple">Apple</CheckboxGroup.Checkbox>
            <CheckboxGroup.Checkbox value="banana">Banana</CheckboxGroup.Checkbox>
            <CheckboxGroup.Checkbox value="cherry">Cherry</CheckboxGroup.Checkbox>
          </CheckboxGroup>
        ),
        code: `import { CheckboxGroup } from './components/elyri/Checkbox';

export function Example() {
  return (
    <CheckboxGroup orientation="vertical" defaultValue={['apple']}>
      <CheckboxGroup.Checkbox value="apple">Apple</CheckboxGroup.Checkbox>
      <CheckboxGroup.Checkbox value="banana">Banana</CheckboxGroup.Checkbox>
      <CheckboxGroup.Checkbox value="cherry">Cherry</CheckboxGroup.Checkbox>
    </CheckboxGroup>
  );
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
