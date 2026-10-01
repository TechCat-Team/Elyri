import { NumberInput } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const copy = {
  zh: {
    description:
      '数字输入：内置加减步进按钮，支持 min / max / step 与小数精度处理，键盘上下键步进，可直接参与原生表单提交。',
    exBasic: '基础用法',
    exBasicDesc: '通过 defaultValue 指定初始值，点击步进按钮或按上下方向键调整。',
    exBounds: '范围与步长',
    exBoundsDesc: '用 min / max / step 约束取值，到达边界时对应按钮自动禁用。',
    exPrecision: '小数精度',
    exPrecisionDesc: 'step 为小数时按步长的小数位取整，避免浮点误差。',
    exSizes: '尺寸',
    exSizesDesc: '三档尺寸与 Input 对齐：sm / md / lg。',
    exStates: '禁用与校验失败',
    exStatesDesc: '禁用不可交互；invalid 标记 aria-invalid 并显示红框。',
    descValue: '受控值，null 表示空；不传则为非受控',
    descDefaultValue: '非受控初始值，默认 null',
    descOnValueChange: '值变化回调，清空且 allowEmpty 时回传 null',
    descMin: '最小值',
    descMax: '最大值',
    descStep: '步长（含键盘与按钮），默认 1',
    descAllowEmpty: '是否允许清空为 null，默认 false（失焦回落为上一个有效值）',
    descSize: '尺寸：sm / md / lg',
    descInvalid: '校验失败态：红框并标记 aria-invalid',
    descName: '表单字段名，随原生表单提交',
    descRest: '其余属性透传给原生 input',
  },
  en: {
    description:
      'A number input with built-in stepper buttons, min / max / step and decimal precision handling, arrow-key stepping, and native form submission.',
    exBasic: 'Basic',
    exBasicDesc: 'Set the initial value with defaultValue; use the steppers or the up / down arrow keys.',
    exBounds: 'Bounds and step',
    exBoundsDesc: 'Constrain values with min / max / step; the matching stepper disables at each bound.',
    exPrecision: 'Decimal precision',
    exPrecisionDesc: 'A fractional step rounds to its own decimal places, avoiding floating point drift.',
    exSizes: 'Sizes',
    exSizesDesc: 'Three sizes matching Input: sm / md / lg.',
    exStates: 'Disabled and invalid',
    exStatesDesc: 'Disabled blocks interaction; invalid sets aria-invalid and a red outline.',
    descValue: 'Controlled value, null for empty; omit to run uncontrolled',
    descDefaultValue: 'Initial value when uncontrolled, default null',
    descOnValueChange: 'Called on change; null when cleared with allowEmpty',
    descMin: 'Minimum value',
    descMax: 'Maximum value',
    descStep: 'Step for keyboard and buttons, default 1',
    descAllowEmpty: 'Allow clearing to null, default false (blur falls back to the last valid value)',
    descSize: 'Size: sm / md / lg',
    descInvalid: 'Invalid state: red outline plus aria-invalid',
    descName: 'Form field name, submitted with a native form',
    descRest: 'Remaining props are forwarded to the native input',
  },
};

export const numberInputDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'number-input',
    title: 'NumberInput',
    category: 'Forms',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      { name: 'value', type: 'number | null', description: t.descValue },
      { name: 'defaultValue', type: 'number | null', default: 'null', description: t.descDefaultValue },
      { name: 'onValueChange', type: '(value: number | null) => void', description: t.descOnValueChange },
      { name: 'min', type: 'number', description: t.descMin },
      { name: 'max', type: 'number', description: t.descMax },
      { name: 'step', type: 'number', default: '1', description: t.descStep },
      { name: 'allowEmpty', type: 'boolean', default: 'false', description: t.descAllowEmpty },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t.descSize },
      { name: 'invalid', type: 'boolean', description: t.descInvalid },
      { name: 'name', type: 'string', description: t.descName },
      { name: '...rest', type: 'InputHTMLAttributes', description: t.descRest },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        render: () => <NumberInput defaultValue={1} aria-label="Quantity" />,
        code: `import { NumberInput } from './components/elyri/NumberInput';

export function Example() {
  return <NumberInput defaultValue={1} aria-label="Quantity" />;
}`,
      },
      {
        title: t.exBounds,
        description: t.exBoundsDesc,
        render: () => <NumberInput defaultValue={3} min={0} max={5} step={1} aria-label="Quantity" />,
        code: `import { NumberInput } from './components/elyri/NumberInput';

export function Example() {
  return <NumberInput defaultValue={3} min={0} max={5} aria-label="Quantity" />;
}`,
      },
      {
        title: t.exPrecision,
        description: t.exPrecisionDesc,
        render: () => <NumberInput defaultValue={0} step={0.1} aria-label="Amount" />,
        code: `import { NumberInput } from './components/elyri/NumberInput';

export function Example() {
  return <NumberInput defaultValue={0} step={0.1} aria-label="Amount" />;
}`,
      },
      {
        title: t.exSizes,
        description: t.exSizesDesc,
        render: () => (
          <div className="demo-stack">
            <NumberInput size="sm" defaultValue={1} aria-label="Small" />
            <NumberInput size="md" defaultValue={2} aria-label="Medium" />
            <NumberInput size="lg" defaultValue={3} aria-label="Large" />
          </div>
        ),
        code: `import { NumberInput } from './components/elyri/NumberInput';

export function Example() {
  return (
    <div>
      <NumberInput size="sm" defaultValue={1} aria-label="Small" />
      <NumberInput size="lg" defaultValue={3} aria-label="Large" />
    </div>
  );
}`,
      },
      {
        title: t.exStates,
        description: t.exStatesDesc,
        render: () => (
          <div className="demo-stack">
            <NumberInput disabled defaultValue={1} aria-label="Disabled" />
            <NumberInput invalid defaultValue={1} aria-label="Invalid" />
          </div>
        ),
        code: `import { NumberInput } from './components/elyri/NumberInput';

export function Example() {
  return (
    <div>
      <NumberInput disabled defaultValue={1} aria-label="Disabled" />
      <NumberInput invalid defaultValue={1} aria-label="Invalid" />
    </div>
  );
}`,
      },
    ],
  };
};
