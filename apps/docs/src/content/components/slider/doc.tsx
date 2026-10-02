import { Slider } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const copy = {
  zh: {
    description:
      '滑块：单值或双值区间，支持指针拖拽与方向键 / Home / End / PageUp / PageDown 键盘操作，可限定 min / max / step。',
    exBasic: '基础用法',
    exBasicDesc: '通过 defaultValue 指定初始值，拖动滑块或使用方向键调整。',
    exRange: '区间',
    exRangeDesc: 'value 传数组即为双滑块区间，两个滑块互相约束不会交叉。',
    exStep: '步长与范围',
    exStepDesc: '用 min / max / step 约束取值，键盘与拖拽都按步长吸附。',
    exValue: '数值气泡',
    exValueDesc: 'showValue 在拖拽或键盘聚焦时显示气泡，传 "always" 常驻；formatValue 同时作用于气泡与 aria-valuetext。',
    exMarks: '刻度点',
    exMarksDesc: 'marks 为 true 时按 step 逐档标注，也可传数组只标注指定值。',
    exSizes: '尺寸',
    exSizesDesc: '三档尺寸：sm / md / lg。',
    exDisabled: '禁用',
    exDisabledDesc: '禁用后不可拖拽、不响应键盘，且移出焦点序列。',
    descValue: '受控值：number 单值，number[] 双值区间',
    descDefaultValue: '非受控初始值，形态与 value 一致',
    descOnValueChange: '值变化回调，单值回传 number、区间回传 number[]',
    descMin: '最小值，默认 0',
    descMax: '最大值，默认 100',
    descStep: '步长，默认 1',
    descSize: '尺寸：sm / md / lg',
    descDisabled: '禁用',
    descInvalid: '校验失败态：标记 aria-invalid，在 Field 内与 Field 的 invalid 取并集',
    descName: '表单字段名：设置后渲染隐藏 input，值可随原生表单提交',
    descShowValue: '数值气泡：true 拖拽 / 聚焦时显示，"always" 常驻',
    descFormatValue: '数值格式化，用于气泡文本与 aria-valuetext',
    descMarks: '刻度点：true 按 step 逐档标注，number[] 仅标注指定值',
  },
  en: {
    description:
      'A slider for single values or two-thumb ranges, with pointer dragging and arrow keys / Home / End / PageUp / PageDown, bounded by min / max / step.',
    exBasic: 'Basic',
    exBasicDesc: 'Set the initial value with defaultValue; drag the thumb or use the arrow keys.',
    exRange: 'Range',
    exRangeDesc: 'Pass an array to value for a two-thumb range; the thumbs constrain each other.',
    exStep: 'Step and bounds',
    exStepDesc: 'Constrain values with min / max / step; both dragging and keyboard snap to the step.',
    exValue: 'Value bubble',
    exValueDesc:
      'showValue reveals a bubble while dragging or keyboard-focused; pass "always" to keep it visible. formatValue applies to both the bubble and aria-valuetext.',
    exMarks: 'Marks',
    exMarksDesc: 'marks={true} draws a dot at every step; pass an array to mark specific values only.',
    exSizes: 'Sizes',
    exSizesDesc: 'Three sizes: sm / md / lg.',
    exDisabled: 'Disabled',
    exDisabledDesc: 'No dragging or keyboard response, and removed from the tab order.',
    descValue: 'Controlled value: number, or number[] for a range',
    descDefaultValue: 'Initial value when uncontrolled, same shape as value',
    descOnValueChange: 'Called with a number, or number[] for a range',
    descMin: 'Minimum, default 0',
    descMax: 'Maximum, default 100',
    descStep: 'Step, default 1',
    descSize: 'Size: sm / md / lg',
    descDisabled: 'Disabled',
    descInvalid: 'Invalid state: sets aria-invalid; unions with the Field invalid state',
    descName: 'Form field name: renders hidden inputs so the value submits with a native form',
    descShowValue: 'Value bubble: true shows it while dragging / focused, "always" keeps it visible',
    descFormatValue: 'Formats the bubble text and aria-valuetext',
    descMarks: 'Marks: true marks every step, number[] marks specific values',
  },
};

export const sliderDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'slider',
    title: 'Slider',
    category: 'Forms',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      { name: 'value', type: 'number | number[]', description: t.descValue },
      { name: 'defaultValue', type: 'number | number[]', description: t.descDefaultValue },
      { name: 'onValueChange', type: '(value: number | number[]) => void', description: t.descOnValueChange },
      { name: 'min', type: 'number', default: '0', description: t.descMin },
      { name: 'max', type: 'number', default: '100', description: t.descMax },
      { name: 'step', type: 'number', default: '1', description: t.descStep },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t.descSize },
      { name: 'disabled', type: 'boolean', description: t.descDisabled },
      { name: 'invalid', type: 'boolean', description: t.descInvalid },
      { name: 'name', type: 'string', description: t.descName },
      { name: 'showValue', type: "boolean | 'always'", default: 'false', description: t.descShowValue },
      { name: 'formatValue', type: '(value: number) => string', description: t.descFormatValue },
      { name: 'marks', type: 'boolean | number[]', description: t.descMarks },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        render: () => <Slider defaultValue={40} aria-label="Volume" />,
        code: `import { Slider } from './components/elyri/Slider';

export function Example() {
  return <Slider defaultValue={40} aria-label="Volume" />;
}`,
      },
      {
        title: t.exRange,
        description: t.exRangeDesc,
        render: () => <Slider defaultValue={[20, 60]} aria-label="Price" />,
        code: `import { Slider } from './components/elyri/Slider';

export function Example() {
  return <Slider defaultValue={[20, 60]} aria-label="Price" />;
}`,
      },
      {
        title: t.exStep,
        description: t.exStepDesc,
        render: () => <Slider defaultValue={20} min={0} max={100} step={20} aria-label="Discount" />,
        code: `import { Slider } from './components/elyri/Slider';

export function Example() {
  return <Slider defaultValue={20} min={0} max={100} step={20} aria-label="Discount" />;
}`,
      },
      {
        title: t.exValue,
        description: t.exValueDesc,
        render: () => (
          <div className="demo-stack">
            <Slider defaultValue={60} showValue formatValue={(v) => `${v}%`} aria-label="Opacity" />
            <Slider defaultValue={[30, 70]} showValue="always" formatValue={(v) => `$${v}`} aria-label="Price" />
          </div>
        ),
        code: `import { Slider } from './components/elyri/Slider';

export function Example() {
  return (
    <div>
      <Slider defaultValue={60} showValue formatValue={(v) => \`\${v}%\`} aria-label="Opacity" />
      <Slider defaultValue={[30, 70]} showValue="always" formatValue={(v) => \`$\${v}\`} aria-label="Price" />
    </div>
  );
}`,
      },
      {
        title: t.exMarks,
        description: t.exMarksDesc,
        render: () => (
          <div className="demo-stack">
            <Slider defaultValue={40} step={10} marks aria-label="Level" />
            <Slider defaultValue={50} marks={[0, 25, 50, 75, 100]} aria-label="Zoom" />
          </div>
        ),
        code: `import { Slider } from './components/elyri/Slider';

export function Example() {
  return (
    <div>
      <Slider defaultValue={40} step={10} marks aria-label="Level" />
      <Slider defaultValue={50} marks={[0, 25, 50, 75, 100]} aria-label="Zoom" />
    </div>
  );
}`,
      },
      {
        title: t.exSizes,
        description: t.exSizesDesc,
        render: () => (
          <div className="demo-stack">
            <Slider size="sm" defaultValue={30} aria-label="Small" />
            <Slider size="md" defaultValue={50} aria-label="Medium" />
            <Slider size="lg" defaultValue={70} aria-label="Large" />
          </div>
        ),
        code: `import { Slider } from './components/elyri/Slider';

export function Example() {
  return (
    <div>
      <Slider size="sm" defaultValue={30} aria-label="Small" />
      <Slider size="lg" defaultValue={70} aria-label="Large" />
    </div>
  );
}`,
      },
      {
        title: t.exDisabled,
        description: t.exDisabledDesc,
        render: () => <Slider disabled defaultValue={40} aria-label="Volume" />,
        code: `import { Slider } from './components/elyri/Slider';

export function Example() {
  return <Slider disabled defaultValue={40} aria-label="Volume" />;
}`,
      },
    ],
  };
};
