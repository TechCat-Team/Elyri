import { useState } from 'react';

import { Field, Input, RadioGroup, Select, Textarea } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const copy = {
  zh: {
    description: '表单域：统一 label / 控件 / 描述 / 错误信息的排版与 aria 关联，校验逻辑完全由外部驱动。',
    exBasic: '基础用法',
    exBasicDesc: 'Label 自动关联控件，Description 补充说明。',
    exValidation: '校验失败',
    exValidationDesc: 'invalid 驱动红框与 aria-invalid，Message 条件渲染错误文案。',
    exControls: '承载各类控件',
    exControlsDesc: 'Input / Textarea / Select / RadioGroup 都能自动接入关联。',
    exDisabled: '整域禁用',
    exDisabledDesc: 'Field 的 disabled 会下发给未显式设置禁用的控件。',
    descInvalid: '校验失败态：控件红框 + aria-invalid',
    descRequired: '必填态：无原生 required 的控件（如 Select）标记 aria-required',
    descDisabled: '禁用态：下发给未显式设置的控件',
    descLabel: '标签：htmlFor 自动指向控件',
    descDescription: '描述文案：注册进 aria-describedby',
    descMessage: '错误信息：建议配合 invalid 条件渲染，注册进 aria-describedby',
  },
  en: {
    description:
      'A form field that wires label, control, description and error message together; validation stays external.',
    exBasic: 'Basic',
    exBasicDesc: 'Label wires the control automatically, Description adds a hint.',
    exValidation: 'Invalid',
    exValidationDesc: 'invalid drives the red border and aria-invalid; render Message conditionally.',
    exControls: 'Any control',
    exControlsDesc: 'Input / Textarea / Select / RadioGroup all hook into the wiring.',
    exDisabled: 'Disabled',
    exDisabledDesc: "Field's disabled propagates to controls that do not set their own.",
    descInvalid: 'Invalid state: red border plus aria-invalid on the control',
    descRequired: 'Required state: aria-required for controls without a native required',
    descDisabled: 'Disabled state: applies to controls that do not set their own',
    descLabel: 'The label; htmlFor points at the control automatically',
    descDescription: 'Hint text; registered into aria-describedby',
    descMessage: 'Error text; render it conditionally with invalid, registered into aria-describedby',
  },
};

function ValidationExample() {
  const [value, setValue] = useState('');
  const invalid = value !== '' && !value.includes('@');

  return (
    <Field invalid={invalid}>
      <Field.Label>邮箱</Field.Label>
      <Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="you@example.com" />
      <Field.Description>我们不会公开你的邮箱。</Field.Description>
      {invalid && <Field.Message>请输入包含 @ 的邮箱地址。</Field.Message>}
    </Field>
  );
}

export const fieldDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'field',
    title: 'Field',
    category: 'Forms',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      { name: 'invalid', type: 'boolean', default: 'false', description: t.descInvalid },
      { name: 'required', type: 'boolean', description: t.descRequired },
      { name: 'disabled', type: 'boolean', description: t.descDisabled },
      { name: 'Field.Label', type: 'label 元素', description: t.descLabel },
      { name: 'Field.Description', type: 'p 元素', description: t.descDescription },
      { name: 'Field.Message', type: 'p 元素', description: t.descMessage },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        render: () => (
          <Field>
            <Field.Label>项目名称</Field.Label>
            <Input placeholder="elyri-ui" />
            <Field.Description>展示在仓库首页与侧边栏。</Field.Description>
          </Field>
        ),
        code: `import { Field } from './components/elyri/Field';
import { Input } from './components/elyri/Input';

export function Example() {
  return (
    <Field>
      <Field.Label>项目名称</Field.Label>
      <Input placeholder="elyri-ui" />
      <Field.Description>展示在仓库首页与侧边栏。</Field.Description>
    </Field>
  );
}`,
      },
      {
        title: t.exValidation,
        description: t.exValidationDesc,
        render: () => <ValidationExample />,
        code: `import { useState } from 'react';
import { Field } from './components/elyri/Field';
import { Input } from './components/elyri/Input';

export function Example() {
  const [value, setValue] = useState('');
  const invalid = value !== '' && !value.includes('@');

  return (
    <Field invalid={invalid}>
      <Field.Label>邮箱</Field.Label>
      <Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="you@example.com" />
      <Field.Description>我们不会公开你的邮箱。</Field.Description>
      {invalid && <Field.Message>请输入包含 @ 的邮箱地址。</Field.Message>}
    </Field>
  );
}`,
      },
      {
        title: t.exControls,
        description: t.exControlsDesc,
        render: () => (
          <div className="demo-stack">
            <Field required>
              <Field.Label>水果</Field.Label>
              <Select placeholder="Pick one">
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="apple">Apple</Select.Item>
                  <Select.Item value="banana">Banana</Select.Item>
                </Select.Content>
              </Select>
            </Field>
            <Field>
              <Field.Label>备注</Field.Label>
              <Textarea placeholder="可选" />
            </Field>
            <Field>
              <Field.Label>尺寸偏好</Field.Label>
              <RadioGroup defaultValue="md">
                <RadioGroup.Radio value="sm">小</RadioGroup.Radio>
                <RadioGroup.Radio value="md">中</RadioGroup.Radio>
              </RadioGroup>
            </Field>
          </div>
        ),
        code: `import { Field } from './components/elyri/Field';
import { RadioGroup } from './components/elyri/Radio';
import { Select } from './components/elyri/Select';
import { Textarea } from './components/elyri/Textarea';

export function Example() {
  return (
    <div>
      <Field required>
        <Field.Label>水果</Field.Label>
        <Select placeholder="Pick one">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="apple">Apple</Select.Item>
            <Select.Item value="banana">Banana</Select.Item>
          </Select.Content>
        </Select>
      </Field>
      <Field>
        <Field.Label>备注</Field.Label>
        <Textarea placeholder="可选" />
      </Field>
      <Field>
        <Field.Label>尺寸偏好</Field.Label>
        <RadioGroup defaultValue="md">
          <RadioGroup.Radio value="sm">小</RadioGroup.Radio>
          <RadioGroup.Radio value="md">中</RadioGroup.Radio>
        </RadioGroup>
      </Field>
    </div>
  );
}`,
      },
      {
        title: t.exDisabled,
        description: t.exDisabledDesc,
        render: () => (
          <Field disabled>
            <Field.Label>项目名称</Field.Label>
            <Input placeholder="不可编辑" />
            <Field.Description>整域禁用时标签与描述同步变灰。</Field.Description>
          </Field>
        ),
        code: `import { Field } from './components/elyri/Field';
import { Input } from './components/elyri/Input';

export function Example() {
  return (
    <Field disabled>
      <Field.Label>项目名称</Field.Label>
      <Input placeholder="不可编辑" />
      <Field.Description>整域禁用时标签与描述同步变灰。</Field.Description>
    </Field>
  );
}`,
      },
    ],
  };
};
