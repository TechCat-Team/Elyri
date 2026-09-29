import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const ButtonDemo = lazy(() => import('./ButtonDemo'));

const DEFAULTS = {
  text: 'Get started',
  variant: 'primary',
  size: 'md',
  loading: false,
};

const copy = {
  zh: {
    description: '按钮：四种视觉样式、三档尺寸，内置加载态与焦点环，其余属性透传给原生 button。',
    textLabel: '文案',
    variantLabel: '样式',
    sizeLabel: '尺寸',
    loadingLabel: '加载中',
    descVariant: '视觉样式：primary / secondary / ghost / danger',
    descSize: '控件尺寸：sm / md / lg',
    descLoading: '加载中：显示 spinner、置为禁用并标记 aria-busy',
    descChildren: '按钮内容',
    descRest: '其余属性透传给原生 button',
  },
  en: {
    description: 'Buttons with four visual styles, three sizes, a built-in loading state and a focus ring.',
    textLabel: 'Label',
    variantLabel: 'Variant',
    sizeLabel: 'Size',
    loadingLabel: 'Loading',
    descVariant: 'Visual style: primary / secondary / ghost / danger',
    descSize: 'Control size: sm / md / lg',
    descLoading: 'Shows a spinner, disables the button and sets aria-busy',
    descChildren: 'Button content',
    descRest: 'Remaining props are forwarded to the native button',
  },
};

export const buttonDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'button',
    title: 'Button',
    category: 'Forms',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: DEFAULTS.text },
      {
        type: 'select',
        name: 'variant',
        label: t.variantLabel,
        default: DEFAULTS.variant,
        options: ['primary', 'secondary', 'ghost', 'danger'],
      },
      { type: 'select', name: 'size', label: t.sizeLabel, default: DEFAULTS.size, options: ['sm', 'md', 'lg'] },
      { type: 'boolean', name: 'loading', label: t.loadingLabel, default: DEFAULTS.loading },
    ],
    props: [
      {
        name: 'variant',
        type: "'primary' | 'secondary' | 'ghost' | 'danger'",
        default: `'${DEFAULTS.variant}'`,
        description: t.descVariant,
      },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: `'${DEFAULTS.size}'`, description: t.descSize },
      { name: 'loading', type: 'boolean', default: 'false', description: t.descLoading },
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: '...rest', type: 'ButtonHTMLAttributes', description: t.descRest },
    ],
    render: (v) => (
      <ButtonDemo
        text={v.text as string}
        variant={v.variant as 'primary' | 'secondary' | 'ghost' | 'danger'}
        size={v.size as 'sm' | 'md' | 'lg'}
        loading={v.loading as boolean}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'Button',
        propsType: 'ButtonProps',
        name: 'Example',
        props: {
          variant: v.variant === DEFAULTS.variant ? undefined : (v.variant as string),
          size: v.size === DEFAULTS.size ? undefined : (v.size as string),
          loading: v.loading ? true : undefined,
        },
        children: v.text as string,
      }),
  };
};
