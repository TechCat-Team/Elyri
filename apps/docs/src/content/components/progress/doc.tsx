import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

const ProgressDemo = lazy(() => import('./ProgressDemo'));

const DEFAULTS = {
  value: 60,
  variant: 'accent',
  size: 'md',
  indeterminate: false,
  showValue: false,
};

const copy = {
  zh: {
    description: '进度条：确定与不确定两种形态，四档语义配色，可显示百分比，暴露标准 progressbar 语义。',
    valueLabel: '进度值',
    variantLabel: '语义',
    sizeLabel: '粗细',
    indeterminateLabel: '不确定进度',
    showValueLabel: '显示百分比',
    descValue: '当前值，范围 0–max',
    descMax: '最大值，默认 100',
    descIndeterminate: '不确定进度：循环动画，不暴露具体数值',
    descSize: '粗细：sm / md',
    descVariant: '颜色：accent / success / warning / danger',
    descShowValue: '在右侧显示百分比',
    descLabel: '无障碍名称',
    descRest: '其余属性透传给原生 div',
  },
  en: {
    description: 'Progress bars in determinate and indeterminate modes, with four semantic colors and a standard role.',
    valueLabel: 'Value',
    variantLabel: 'Variant',
    sizeLabel: 'Size',
    indeterminateLabel: 'Indeterminate',
    showValueLabel: 'Show value',
    descValue: 'Current value, from 0 to max',
    descMax: 'Maximum value, defaults to 100',
    descIndeterminate: 'Looping animation without a concrete value',
    descSize: 'Thickness: sm / md',
    descVariant: 'Color: accent / success / warning / danger',
    descShowValue: 'Show the percentage on the right',
    descLabel: 'Accessible name',
    descRest: 'Remaining props are forwarded to the native div',
  },
};

export const progressDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'progress',
    title: 'Progress',
    category: 'Feedback',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    controls: [
      { type: 'number', name: 'value', label: t.valueLabel, default: DEFAULTS.value, min: 0, max: 100 },
      {
        type: 'select',
        name: 'variant',
        label: t.variantLabel,
        default: DEFAULTS.variant,
        options: ['accent', 'success', 'warning', 'danger'],
      },
      { type: 'select', name: 'size', label: t.sizeLabel, default: DEFAULTS.size, options: ['sm', 'md'] },
      { type: 'boolean', name: 'indeterminate', label: t.indeterminateLabel, default: DEFAULTS.indeterminate },
      { type: 'boolean', name: 'showValue', label: t.showValueLabel, default: DEFAULTS.showValue },
    ],
    props: [
      { name: 'value', type: 'number', default: '0', description: t.descValue },
      { name: 'max', type: 'number', default: '100', description: t.descMax },
      { name: 'indeterminate', type: 'boolean', default: 'false', description: t.descIndeterminate },
      { name: 'size', type: "'sm' | 'md'", default: `'${DEFAULTS.size}'`, description: t.descSize },
      {
        name: 'variant',
        type: "'accent' | 'success' | 'warning' | 'danger'",
        default: `'${DEFAULTS.variant}'`,
        description: t.descVariant,
      },
      { name: 'showValue', type: 'boolean', default: 'false', description: t.descShowValue },
      { name: 'label', type: 'string', description: t.descLabel },
      { name: '...rest', type: 'HTMLAttributes', description: t.descRest },
    ],
    render: (v) => (
      <ProgressDemo
        value={v.value as number}
        variant={v.variant as 'accent' | 'success' | 'warning' | 'danger'}
        size={v.size as 'sm' | 'md'}
        indeterminate={v.indeterminate as boolean}
        showValue={v.showValue as boolean}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'Progress',
        propsType: 'ProgressProps',
        name: 'Example',
        props: {
          value: v.value === DEFAULTS.value ? 60 : (v.value as number),
          variant: v.variant === DEFAULTS.variant ? undefined : (v.variant as string),
          size: v.size === DEFAULTS.size ? undefined : (v.size as string),
          indeterminate: v.indeterminate ? true : undefined,
          showValue: v.showValue ? true : undefined,
        },
      }),
  };
};
