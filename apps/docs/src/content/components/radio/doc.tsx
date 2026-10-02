import { useState } from 'react';

import { RadioGroup } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const copy = {
  zh: {
    description: '单选组：同名原生 radio 承载箭头键循环切换，RadioGroup 管理取值，Radio 声明选项。',
    exBasic: '基础用法',
    exBasicDesc: 'defaultValue 指定初始选中项，点击切换。',
    exControlled: '受控用法',
    exControlledDesc: 'value 与 onValueChange 驱动。',
    exOrientation: '纵向排列',
    exOrientationDesc: 'orientation="vertical" 让选项纵向堆叠，默认横向。',
    exDisabled: '禁用',
    exDisabledDesc: '组级禁用会作用于全部选项。',
    descValue: '受控选中值；不传则为非受控',
    descDefaultValue: '非受控初始值',
    descOnValueChange: '选中值变化回调',
    descName: '原生 name 属性，未传时自动生成（箭头键导航依赖同名）',
    descOrientation: '排列方向，默认 horizontal',
    descDisabled: '组级禁用',
    descRadioValue: '该选项的值（Radio）',
    descRadioChildren: '标签文案，渲染在圆点右侧（Radio）',
  },
  en: {
    description: 'A radio group: same-name native radios provide arrow key cycling while RadioGroup owns the value.',
    exBasic: 'Basic',
    exBasicDesc: 'Set the initial choice with defaultValue, then click to switch.',
    exControlled: 'Controlled',
    exControlledDesc: 'Driven by value and onValueChange.',
    exOrientation: 'Vertical layout',
    exOrientationDesc: 'Pass orientation="vertical" to stack the options; horizontal is the default.',
    exDisabled: 'Disabled',
    exDisabledDesc: 'Group level disabling applies to every radio.',
    descValue: 'Controlled value; omit it to run uncontrolled',
    descDefaultValue: 'Initial value when uncontrolled',
    descOnValueChange: 'Called whenever the selection changes',
    descName: 'Native name attribute, auto-generated when omitted (arrow keys rely on it)',
    descOrientation: 'Layout direction, horizontal by default',
    descDisabled: 'Disable the whole group',
    descRadioValue: 'The option value (Radio)',
    descRadioChildren: 'Label text rendered to the right of the dot (Radio)',
  },
};

function ControlledExample() {
  const [value, setValue] = useState('apple');

  return (
    <RadioGroup value={value} onValueChange={setValue}>
      <RadioGroup.Radio value="apple">Apple</RadioGroup.Radio>
      <RadioGroup.Radio value="banana">Banana</RadioGroup.Radio>
      <RadioGroup.Radio value="cherry">Cherry</RadioGroup.Radio>
    </RadioGroup>
  );
}

export const radioDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'radio',
    title: 'Radio',
    category: 'Forms',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      { name: 'value', type: 'string', description: t.descValue },
      { name: 'defaultValue', type: 'string', description: t.descDefaultValue },
      { name: 'onValueChange', type: '(value: string) => void', description: t.descOnValueChange },
      { name: 'name', type: 'string', description: t.descName },
      { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: t.descOrientation },
      { name: 'disabled', type: 'boolean', default: 'false', description: t.descDisabled },
      { name: 'Radio.value', type: 'string', description: t.descRadioValue },
      { name: 'Radio.children', type: 'ReactNode', description: t.descRadioChildren },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        render: () => (
          <RadioGroup defaultValue="apple">
            <RadioGroup.Radio value="apple">Apple</RadioGroup.Radio>
            <RadioGroup.Radio value="banana">Banana</RadioGroup.Radio>
            <RadioGroup.Radio value="cherry">Cherry</RadioGroup.Radio>
          </RadioGroup>
        ),
        code: `import { RadioGroup } from './components/elyri/Radio';

export function Example() {
  return (
    <RadioGroup defaultValue="apple">
      <RadioGroup.Radio value="apple">Apple</RadioGroup.Radio>
      <RadioGroup.Radio value="banana">Banana</RadioGroup.Radio>
      <RadioGroup.Radio value="cherry">Cherry</RadioGroup.Radio>
    </RadioGroup>
  );
}`,
      },
      {
        title: t.exControlled,
        description: t.exControlledDesc,
        render: () => <ControlledExample />,
        code: `import { useState } from 'react';
import { RadioGroup } from './components/elyri/Radio';

export function Example() {
  const [value, setValue] = useState('apple');

  return (
    <RadioGroup value={value} onValueChange={setValue}>
      <RadioGroup.Radio value="apple">Apple</RadioGroup.Radio>
      <RadioGroup.Radio value="banana">Banana</RadioGroup.Radio>
    </RadioGroup>
  );
}`,
      },
      {
        title: t.exOrientation,
        description: t.exOrientationDesc,
        render: () => (
          <RadioGroup orientation="vertical" defaultValue="apple">
            <RadioGroup.Radio value="apple">Apple</RadioGroup.Radio>
            <RadioGroup.Radio value="banana">Banana</RadioGroup.Radio>
            <RadioGroup.Radio value="cherry">Cherry</RadioGroup.Radio>
          </RadioGroup>
        ),
        code: `import { RadioGroup } from './components/elyri/Radio';

export function Example() {
  return (
    <RadioGroup orientation="vertical" defaultValue="apple">
      <RadioGroup.Radio value="apple">Apple</RadioGroup.Radio>
      <RadioGroup.Radio value="banana">Banana</RadioGroup.Radio>
      <RadioGroup.Radio value="cherry">Cherry</RadioGroup.Radio>
    </RadioGroup>
  );
}`,
      },
      {
        title: t.exDisabled,
        description: t.exDisabledDesc,
        render: () => (
          <RadioGroup disabled defaultValue="apple">
            <RadioGroup.Radio value="apple">Apple</RadioGroup.Radio>
            <RadioGroup.Radio value="banana">Banana</RadioGroup.Radio>
          </RadioGroup>
        ),
        code: `import { RadioGroup } from './components/elyri/Radio';

export function Example() {
  return (
    <RadioGroup disabled defaultValue="apple">
      <RadioGroup.Radio value="apple">Apple</RadioGroup.Radio>
      <RadioGroup.Radio value="banana">Banana</RadioGroup.Radio>
    </RadioGroup>
  );
}`,
      },
    ],
  };
};
