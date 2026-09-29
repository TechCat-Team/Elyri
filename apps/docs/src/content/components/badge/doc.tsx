import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

const BadgeDemo = lazy(() => import('./BadgeDemo'));

const DEFAULTS = {
  text: 'New',
  variant: 'accent',
  size: 'md',
};

const copy = {
  zh: {
    description: '徽标：五种语义配色、两档尺寸，用于状态、标签与计数。',
    textLabel: '文案',
    variantLabel: '样式',
    sizeLabel: '尺寸',
    descVariant: '语义配色：neutral / accent / success / warning / danger',
    descSize: '控件尺寸：sm / md',
    descChildren: '徽标内容',
    descRest: '其余属性透传给原生 span',
  },
  en: {
    description: 'Badges with five semantic colours and two sizes, for statuses, labels and counts.',
    textLabel: 'Label',
    variantLabel: 'Variant',
    sizeLabel: 'Size',
    descVariant: 'Semantic colour: neutral / accent / success / warning / danger',
    descSize: 'Control size: sm / md',
    descChildren: 'Badge content',
    descRest: 'Remaining props are forwarded to the native span',
  },
};

export const badgeDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'badge',
    title: 'Badge',
    category: 'Data Display',
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
        options: ['neutral', 'accent', 'success', 'warning', 'danger'],
      },
      { type: 'select', name: 'size', label: t.sizeLabel, default: DEFAULTS.size, options: ['sm', 'md'] },
    ],
    props: [
      {
        name: 'variant',
        type: "'neutral' | 'accent' | 'success' | 'warning' | 'danger'",
        default: "'neutral'",
        description: t.descVariant,
      },
      { name: 'size', type: "'sm' | 'md'", default: `'${DEFAULTS.size}'`, description: t.descSize },
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: '...rest', type: 'HTMLAttributes', description: t.descRest },
    ],
    render: (v) => <BadgeDemo text={v.text as string} variant={v.variant as string} size={v.size as 'sm' | 'md'} />,
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'Badge',
        propsType: 'BadgeProps',
        name: 'Example',
        props: {
          variant: v.variant === DEFAULTS.variant ? undefined : (v.variant as string),
          size: v.size === DEFAULTS.size ? undefined : (v.size as string),
        },
        children: v.text as string,
      }),
  };
};
