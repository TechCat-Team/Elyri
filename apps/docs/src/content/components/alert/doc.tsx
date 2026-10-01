import { lazy } from 'react';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

const AlertDemo = lazy(() => import('./AlertDemo'));

const DEFAULTS = {
  variant: 'info',
  title: 'Heads up',
  closable: false,
  bordered: true,
  accent: true,
};

const copy = {
  zh: {
    description: '提示条：四种语义配色，可带标题、图标与关闭按钮，危险态自动用 alert 语义播报。',
    variantLabel: '语义',
    titleLabel: '标题',
    closableLabel: '可关闭',
    borderedLabel: '显示边框',
    accentLabel: '强调色',
    descVariant: '语义与配色：info / success / warning / danger',
    descTitle: '标题，省略则只显示内容',
    descIcon: '自定义图标，省略时显示随语义变色的圆点',
    descOnClose: '传入后显示关闭按钮',
    descCloseLabel: '关闭按钮的无障碍名称，默认 Dismiss',
    descBordered: '是否显示边框，默认 true',
    descAccent: '是否使用强调色（图标着色与背景染色），默认 true',
    descChildren: '提示正文',
    descRest: '其余属性透传给原生 div',
  },
  en: {
    description: 'Inline alerts with four semantic colors, an optional title, icon and close button.',
    variantLabel: 'Variant',
    titleLabel: 'Title',
    closableLabel: 'Closable',
    borderedLabel: 'Bordered',
    accentLabel: 'Accent',
    descVariant: 'Semantic color: info / success / warning / danger',
    descTitle: 'Title; omit it to show the message only',
    descIcon: 'Custom icon; falls back to a colored dot',
    descOnClose: 'Pass a handler to render the close button',
    descCloseLabel: 'Accessible name of the close button, defaults to Dismiss',
    descBordered: 'Whether the border shows, defaults to true',
    descAccent: 'Whether the accent coloring (icon and background) is used, defaults to true',
    descChildren: 'Alert message',
    descRest: 'Remaining props are forwarded to the native div',
  },
};

export const alertDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'alert',
    title: 'Alert',
    category: 'Feedback',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    controls: [
      {
        type: 'select',
        name: 'variant',
        label: t.variantLabel,
        default: DEFAULTS.variant,
        options: ['info', 'success', 'warning', 'danger'],
      },
      { type: 'text', name: 'title', label: t.titleLabel, default: DEFAULTS.title },
      { type: 'boolean', name: 'closable', label: t.closableLabel, default: DEFAULTS.closable },
      { type: 'boolean', name: 'bordered', label: t.borderedLabel, default: DEFAULTS.bordered },
      { type: 'boolean', name: 'accent', label: t.accentLabel, default: DEFAULTS.accent },
    ],
    props: [
      {
        name: 'variant',
        type: "'info' | 'success' | 'warning' | 'danger'",
        default: `'${DEFAULTS.variant}'`,
        description: t.descVariant,
      },
      { name: 'title', type: 'ReactNode', description: t.descTitle },
      { name: 'icon', type: 'ReactNode', description: t.descIcon },
      { name: 'onClose', type: '() => void', description: t.descOnClose },
      { name: 'closeLabel', type: 'string', default: "'Dismiss'", description: t.descCloseLabel },
      { name: 'bordered', type: 'boolean', default: 'true', description: t.descBordered },
      { name: 'accent', type: 'boolean', default: 'true', description: t.descAccent },
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: '...rest', type: 'HTMLAttributes', description: t.descRest },
    ],
    render: (v) => (
      <AlertDemo
        variant={v.variant as 'info' | 'success' | 'warning' | 'danger'}
        title={v.title as string}
        closable={v.closable as boolean}
        bordered={v.bordered as boolean}
        accent={v.accent as boolean}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'Alert',
        propsType: 'AlertProps',
        name: 'Example',
        props: {
          variant: v.variant === DEFAULTS.variant ? undefined : (v.variant as string),
          title: v.title as string,
        },
        children: 'Section, package and usage notes all live in the docs.',
      }),
  };
};
