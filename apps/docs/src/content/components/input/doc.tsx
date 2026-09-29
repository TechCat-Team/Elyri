import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

const InputDemo = lazy(() => import('./InputDemo'));

const DEFAULTS = {
  placeholder: 'you@example.com',
  size: 'md',
  invalid: false,
};

const copy = {
  zh: {
    description: '输入框：三档尺寸，支持校验失败态，其余属性透传给原生 input。',
    placeholderLabel: '占位文案',
    sizeLabel: '尺寸',
    invalidLabel: '校验失败',
    descSize: '控件尺寸：sm / md / lg',
    descInvalid: '校验失败态：红框并标记 aria-invalid',
    descRest: '其余属性透传给原生 input',
  },
  en: {
    description: 'Text inputs with three sizes and an invalid state, forwarding everything else to the native input.',
    placeholderLabel: 'Placeholder',
    sizeLabel: 'Size',
    invalidLabel: 'Invalid',
    descSize: 'Control size: sm / md / lg',
    descInvalid: 'Invalid state: red border plus aria-invalid',
    descRest: 'Remaining props are forwarded to the native input',
  },
};

export const inputDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'input',
    title: 'Input',
    category: 'Forms',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    controls: [
      { type: 'text', name: 'placeholder', label: t.placeholderLabel, default: DEFAULTS.placeholder },
      { type: 'select', name: 'size', label: t.sizeLabel, default: DEFAULTS.size, options: ['sm', 'md', 'lg'] },
      { type: 'boolean', name: 'invalid', label: t.invalidLabel, default: DEFAULTS.invalid },
    ],
    props: [
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: `'${DEFAULTS.size}'`, description: t.descSize },
      { name: 'invalid', type: 'boolean', default: 'false', description: t.descInvalid },
      { name: '...rest', type: 'InputHTMLAttributes', description: t.descRest },
    ],
    render: (v) => (
      <InputDemo
        placeholder={v.placeholder as string}
        size={v.size as 'sm' | 'md' | 'lg'}
        invalid={v.invalid as boolean}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'Input',
        propsType: 'InputProps',
        name: 'Example',
        props: {
          size: v.size === DEFAULTS.size ? undefined : (v.size as string),
          invalid: v.invalid ? true : undefined,
          placeholder: v.placeholder as string,
        },
      }),
  };
};
