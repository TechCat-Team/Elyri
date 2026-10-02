import { useState } from 'react';

import { Select } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const copy = {
  zh: {
    description:
      '下拉选择：listbox 语义浮层，方向键 / Home / End / typeahead 导航，Esc 关闭；multiple 切换为多选 Tag 形态。',
    exBasic: '基础用法',
    exBasicDesc: '点击或按方向键展开，选择后自动收起并把焦点还给触发器。',
    exControlled: '受控用法',
    exControlledDesc: 'value 与 onValueChange 驱动。',
    exMultiple: '多选',
    exMultipleDesc: 'multiple 模式下选项点击不收起，选中项以 Tag 展示，可单独移除或一键清空。',
    exSizes: '尺寸',
    exSizesDesc: '三档尺寸与 Input 对齐：sm / md / lg。',
    exDisabled: '禁用',
    exDisabledDesc: '整个下拉不可交互。',
    exSearch: '可搜索',
    exSearchDesc: '在 Trigger 内放 Select.Search，触发器变为可输入，输入即按文案过滤选项。',
    descValue: '受控选中值：单选 string，多选 string[]',
    descDefaultValue: '非受控初始值',
    descOnValueChange: '选中值变化回调：单选回传 string，多选回传 string[]',
    descMultiple: '多选模式：值为 string[]，Trigger 以 Tag 展示',
    descPlaceholder: '未选中时的占位文案',
    descSize: 'Trigger 尺寸：sm / md / lg',
    descPlacement: '期望方向：top / bottom / left / right，默认 bottom',
    descOpen: '受控开关；配合 onOpenChange 使用',
    descClearLabel: '多选清空按钮的无障碍名称，默认 "Clear"',
    descFilter: '自定义搜索匹配；默认按文案做大小写不敏感的包含匹配',
    descOnSearchChange: '搜索关键词变化回调，可配合自定义 / 异步过滤',
  },
  en: {
    description:
      'A listbox-style select with arrow keys, Home / End and typeahead navigation; multiple switches to a tag-based multi-select.',
    exBasic: 'Basic',
    exBasicDesc: 'Open by click or arrow key; picking an option closes the list and returns focus to the trigger.',
    exControlled: 'Controlled',
    exControlledDesc: 'Driven by value and onValueChange.',
    exMultiple: 'Multiple',
    exMultipleDesc: 'In multiple mode options stay open, selections render as removable tags with a clear-all button.',
    exSizes: 'Sizes',
    exSizesDesc: 'Three sizes matching Input: sm / md / lg.',
    exDisabled: 'Disabled',
    exDisabledDesc: 'The whole select stops responding.',
    exSearch: 'Searchable',
    exSearchDesc: 'Put Select.Search inside the trigger to type and filter options by their label.',
    descValue: 'Controlled value: string for single, string[] with multiple',
    descDefaultValue: 'Initial value when uncontrolled',
    descOnValueChange: 'Called with a string, or string[] in multiple mode',
    descMultiple: 'Multi-select mode: string[] value, tags in the trigger',
    descPlaceholder: 'Placeholder text when nothing is selected',
    descSize: 'Trigger size: sm / md / lg',
    descPlacement: 'Preferred side: top / bottom / left / right, default bottom',
    descOpen: 'Controlled open state; pair with onOpenChange',
    descClearLabel: 'Accessible name of the clear button, default "Clear"',
    descFilter: 'Custom match; defaults to a case-insensitive contains on the label',
    descOnSearchChange: 'Called with the search query; pair with custom or async filtering',
  },
};

const FRUITS = ['Apple', 'Banana', 'Cherry', 'Grape', 'Mango'];

function FruitSelect({ size }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <Select placeholder="Pick a fruit" size={size}>
      <Select.Trigger />
      <Select.Content>
        {FRUITS.map((fruit) => (
          <Select.Item key={fruit} value={fruit.toLowerCase()}>
            {fruit}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
}

function ControlledExample() {
  const [value, setValue] = useState('apple');

  return (
    <Select value={value} onValueChange={(next) => setValue(next as string)}>
      <Select.Trigger />
      <Select.Content>
        {FRUITS.map((fruit) => (
          <Select.Item key={fruit} value={fruit.toLowerCase()}>
            {fruit}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
}

export const selectDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'select',
    title: 'Select',
    category: 'Forms',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      { name: 'value', type: 'string | string[]', description: t.descValue },
      { name: 'defaultValue', type: 'string | string[]', description: t.descDefaultValue },
      { name: 'onValueChange', type: '(value: string | string[]) => void', description: t.descOnValueChange },
      { name: 'multiple', type: 'boolean', default: 'false', description: t.descMultiple },
      { name: 'placeholder', type: 'string', description: t.descPlaceholder },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t.descSize },
      {
        name: 'placement',
        type: "'top' | 'bottom' | 'left' | 'right'",
        default: "'bottom'",
        description: t.descPlacement,
      },
      { name: 'open', type: 'boolean', description: t.descOpen },
      { name: 'clearLabel', type: 'string', default: "'Clear'", description: t.descClearLabel },
      { name: 'filter', type: '(label: string, query: string) => boolean', description: t.descFilter },
      { name: 'onSearchChange', type: '(query: string) => void', description: t.descOnSearchChange },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        wide: true,
        render: () => <FruitSelect />,
        code: `import { Select } from './components/elyri/Select';

export function Example() {
  return (
    <Select placeholder="Pick a fruit">
      <Select.Trigger />
      <Select.Content>
        <Select.Item value="apple">Apple</Select.Item>
        <Select.Item value="banana">Banana</Select.Item>
        <Select.Item value="cherry">Cherry</Select.Item>
      </Select.Content>
    </Select>
  );
}`,
      },
      {
        title: t.exSearch,
        description: t.exSearchDesc,
        wide: true,
        render: () => (
          <Select placeholder="Pick a fruit">
            <Select.Trigger>
              <Select.Search placeholder="搜索水果" />
            </Select.Trigger>
            <Select.Content>
              {FRUITS.map((fruit) => (
                <Select.Item key={fruit} value={fruit.toLowerCase()}>
                  {fruit}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        ),
        code: `import { Select } from './components/elyri/Select';

export function Example() {
  return (
    <Select placeholder="Pick a fruit">
      <Select.Trigger>
        <Select.Search placeholder="搜索水果" />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="apple">Apple</Select.Item>
        <Select.Item value="banana">Banana</Select.Item>
        <Select.Item value="cherry">Cherry</Select.Item>
      </Select.Content>
    </Select>
  );
}`,
      },
      {
        title: t.exControlled,
        description: t.exControlledDesc,
        wide: true,
        render: () => <ControlledExample />,
        code: `import { useState } from 'react';
import { Select } from './components/elyri/Select';

export function Example() {
  const [value, setValue] = useState('apple');

  return (
    <Select value={value} onValueChange={setValue}>
      <Select.Trigger />
      <Select.Content>
        <Select.Item value="apple">Apple</Select.Item>
        <Select.Item value="banana">Banana</Select.Item>
      </Select.Content>
    </Select>
  );
}`,
      },
      {
        title: t.exMultiple,
        description: t.exMultipleDesc,
        wide: true,
        render: () => (
          <Select multiple placeholder="Pick fruits" defaultValue={['apple', 'banana']}>
            <Select.Trigger />
            <Select.Content>
              {FRUITS.map((fruit) => (
                <Select.Item key={fruit} value={fruit.toLowerCase()}>
                  {fruit}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        ),
        code: `import { Select } from './components/elyri/Select';

export function Example() {
  return (
    <Select multiple placeholder="Pick fruits" defaultValue={['apple', 'banana']}>
      <Select.Trigger />
      <Select.Content>
        <Select.Item value="apple">Apple</Select.Item>
        <Select.Item value="banana">Banana</Select.Item>
        <Select.Item value="cherry">Cherry</Select.Item>
      </Select.Content>
    </Select>
  );
}`,
      },
      {
        title: t.exSizes,
        description: t.exSizesDesc,
        wide: true,
        render: () => (
          <div className="demo-stack">
            <FruitSelect size="sm" />
            <FruitSelect size="md" />
            <FruitSelect size="lg" />
          </div>
        ),
        code: `import { Select } from './components/elyri/Select';

export function Example() {
  return (
    <div>
      <Select size="sm" placeholder="Small">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="apple">Apple</Select.Item>
        </Select.Content>
      </Select>
      <Select size="lg" placeholder="Large">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="apple">Apple</Select.Item>
        </Select.Content>
      </Select>
    </div>
  );
}`,
      },
      {
        title: t.exDisabled,
        description: t.exDisabledDesc,
        wide: true,
        render: () => (
          <Select disabled placeholder="Pick a fruit">
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="apple">Apple</Select.Item>
            </Select.Content>
          </Select>
        ),
        code: `import { Select } from './components/elyri/Select';

export function Example() {
  return (
    <Select disabled placeholder="Pick a fruit">
      <Select.Trigger />
      <Select.Content>
        <Select.Item value="apple">Apple</Select.Item>
      </Select.Content>
    </Select>
  );
}`,
      },
    ],
  };
};
