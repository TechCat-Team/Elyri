import { lazy } from 'react';

import type { ToastVariant } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const ToastDemo = lazy(() => import('./ToastDemo'));

const DEFAULTS = {
  title: 'Saved',
  variant: 'success',
  duration: 4000,
  position: 'top',
  description: true,
};

const POSITIONS = ['top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right'] as const;

const copy = {
  zh: {
    description: '轻提示：用 ToastProvider 承载 useToast，浮层堆叠、自动关闭、悬停暂停，兼容受控与非受控。',
    titleLabel: '标题',
    variantLabel: '语义',
    durationLabel: '自动关闭（毫秒）',
    descriptionLabel: '描述文字',
    positionLabel: '停靠位置',
    descDuration: 'Provider 默认自动关闭毫秒数，0 表示不自动关闭',
    descLimit: '同时最多显示的条数',
    descPosition: '视口停靠方向，支持六个方向，默认 top',
    descLabel: '视口区域的无障碍名称',
    descDescription: '关闭后不显示描述，只保留一行标题，形如单行 Message',
    descToast: 'toast(options) 弹出一条提示，返回其 id',
    descUpdate: 'update(id, options) 就地更新某条提示，如 loading 完成后改成 success',
    descDismiss: 'dismiss(id) 手动关闭某条提示；不传 id 时关闭全部',
    descPromise: 'promise(p, { loading, success, error }) 跟踪一个 promise，自动切换 loading / success / error',
    descOnClose: '任一提示关闭后的回调，reason 为 manual | timeout | limit',
    descDismissible: '是否显示关闭按钮，默认 true；persistent 时始终不显示',
    descOptions: 'toast 选项：title / description / variant / duration / persistent / dismissible / action',
    descPersistent: '常驻：不自动关闭、不显示关闭按钮、不受 limit 挤出，只能由程序调用 dismiss 关闭',
    descChildren: 'Provider 包裹应用内容',
  },
  en: {
    description: 'Toasts driven by ToastProvider and useToast: a stacking portal, auto-dismiss, hover pause.',
    titleLabel: 'Title',
    variantLabel: 'Variant',
    durationLabel: 'Auto-dismiss (ms)',
    descriptionLabel: 'Description',
    positionLabel: 'Position',
    descDuration: 'Default auto-dismiss delay, 0 keeps the toast until dismissed',
    descLimit: 'Maximum number of toasts shown at once',
    descPosition: 'Viewport docking direction, six options, defaults to top',
    descLabel: 'Accessible name of the viewport region',
    descDescription: 'When off, the description is hidden and the toast shrinks to a single-line message',
    descToast: 'toast(options) pushes a toast and returns its id',
    descUpdate: 'update(id, options) updates an existing toast in place, e.g. loading to success',
    descDismiss: 'dismiss(id) closes a single toast; call it without an id to close them all',
    descPromise: 'promise(p, { loading, success, error }) tracks a promise and switches loading / success / error',
    descOnClose: 'Called when any toast closes, with reason manual | timeout | limit',
    descDismissible: 'Whether the close button shows, defaults to true; always hidden when persistent',
    descOptions: 'toast options: title / description / variant / duration / persistent / dismissible / action',
    descPersistent:
      'Pinned toast: never auto-dismisses, hides the close button and is never evicted by limit; close it with dismiss(id)',
    descChildren: 'Provider wraps your application',
  },
};

export const toastDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'toast',
    title: 'Toast',
    category: 'Feedback',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    controls: [
      { type: 'text', name: 'title', label: t.titleLabel, default: DEFAULTS.title },
      {
        type: 'select',
        name: 'variant',
        label: t.variantLabel,
        default: DEFAULTS.variant,
        options: ['info', 'success', 'warning', 'danger', 'loading'],
      },
      {
        type: 'number',
        name: 'duration',
        label: t.durationLabel,
        default: DEFAULTS.duration,
        min: 0,
        max: 10000,
        step: 500,
      },
      {
        type: 'select',
        name: 'position',
        label: t.positionLabel,
        default: DEFAULTS.position,
        options: [...POSITIONS],
      },
      { type: 'boolean', name: 'description', label: t.descriptionLabel, default: DEFAULTS.description },
    ],
    props: [
      { name: 'ToastProvider.duration', type: 'number', default: '4000', description: t.descDuration },
      { name: 'ToastProvider.limit', type: 'number', default: '4', description: t.descLimit },
      { name: 'ToastProvider.position', type: 'ToastPosition', default: "'top'", description: t.descPosition },
      { name: 'ToastProvider.label', type: 'string', default: "'Notifications'", description: t.descLabel },
      { name: 'ToastProvider.onClose', type: '(id, reason) => void', description: t.descOnClose },
      { name: 'useToast().toast', type: '(options) => string', description: t.descToast },
      { name: 'useToast().update', type: '(id, options) => void', description: t.descUpdate },
      { name: 'useToast().dismiss', type: '(id?: string) => void', description: t.descDismiss },
      { name: 'useToast().promise', type: '(p, messages) => Promise', description: t.descPromise },
      { name: 'options', type: 'ToastOptions', description: t.descOptions },
      { name: 'options.description', type: 'ReactNode', description: t.descDescription },
      { name: 'options.persistent', type: 'boolean', default: 'false', description: t.descPersistent },
      { name: 'options.dismissible', type: 'boolean', default: 'true', description: t.descDismissible },
      { name: 'children', type: 'ReactNode', description: t.descChildren },
    ],
    render: (v) => (
      <ToastDemo
        title={v.title as string}
        variant={v.variant as ToastVariant}
        duration={v.duration as number}
        position={v.position as (typeof POSITIONS)[number]}
        showDescription={v.description as boolean}
      />
    ),
    usage: (v) => {
      const variant = v.variant === DEFAULTS.variant ? '' : `, variant: '${v.variant}'`;
      const description = v.description ? `, description: 'Saved to your workspace.'` : '';
      const position = v.position === DEFAULTS.position ? '' : ` position="${v.position}"`;

      return `import { ToastProvider, useToast } from './components/elyri/Toast';
import { Button } from './components/elyri/Button';

function Trigger() {
  const { toast } = useToast();

  return (
    <Button onClick={() => toast({ title: '${v.title}'${description}${variant} })}>
      Show toast
    </Button>
  );
}

export function Example() {
  return (
    <ToastProvider${position}>
      <Trigger />
    </ToastProvider>
  );
}`;
    },
  };
};
