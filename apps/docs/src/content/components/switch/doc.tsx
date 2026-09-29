import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

const SwitchDemo = lazy(() => import('./SwitchDemo'));

const DEFAULTS = {
  size: 'md',
  checked: true,
  disabled: false,
};

const copy = {
  zh: {
    description: '开关：受控 / 非受控双支持，role="switch" 语义，空格与回车键切换。',
    sizeLabel: '尺寸',
    checkedLabel: '默认开启',
    disabledLabel: '禁用',
    descChecked: '受控选中状态；不传则为非受控',
    descDefaultChecked: '非受控初始状态',
    descOnCheckedChange: '选中状态变化回调，受控与非受控都会触发',
    descSize: '控件尺寸：sm / md',
    descDisabled: '是否禁用',
    descRest: '其余属性透传给原生 button',
  },
  en: {
    description: 'A switch with controlled and uncontrolled modes, role="switch" semantics and Space / Enter toggling.',
    sizeLabel: 'Size',
    checkedLabel: 'Default on',
    disabledLabel: 'Disabled',
    descChecked: 'Controlled value; omit it to run uncontrolled',
    descDefaultChecked: 'Initial value when uncontrolled',
    descOnCheckedChange: 'Called on every change, controlled or not',
    descSize: 'Control size: sm / md',
    descDisabled: 'Whether the switch is disabled',
    descRest: 'Remaining props are forwarded to the native button',
  },
};

export const switchDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'switch',
    title: 'Switch',
    category: 'Forms',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    controls: [
      { type: 'select', name: 'size', label: t.sizeLabel, default: DEFAULTS.size, options: ['sm', 'md'] },
      { type: 'boolean', name: 'checked', label: t.checkedLabel, default: DEFAULTS.checked },
      { type: 'boolean', name: 'disabled', label: t.disabledLabel, default: DEFAULTS.disabled },
    ],
    props: [
      { name: 'checked', type: 'boolean', description: t.descChecked },
      { name: 'defaultChecked', type: 'boolean', default: 'false', description: t.descDefaultChecked },
      { name: 'onCheckedChange', type: '(checked: boolean) => void', description: t.descOnCheckedChange },
      { name: 'size', type: "'sm' | 'md'", default: `'${DEFAULTS.size}'`, description: t.descSize },
      { name: 'disabled', type: 'boolean', default: 'false', description: t.descDisabled },
      { name: '...rest', type: 'ButtonHTMLAttributes', description: t.descRest },
    ],
    render: (v) => (
      <SwitchDemo size={v.size as 'sm' | 'md'} checked={v.checked as boolean} disabled={v.disabled as boolean} />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'Switch',
        propsType: 'SwitchProps',
        name: 'Example',
        props: {
          size: v.size === DEFAULTS.size ? undefined : (v.size as string),
          defaultChecked: v.checked ? true : undefined,
          disabled: v.disabled ? true : undefined,
        },
      }),
  };
};
