import { lazy } from 'react';

import type { ComponentDoc, Lang } from '../../../lib/types';

const PopoverDemo = lazy(() => import('./PopoverDemo'));

const DEFAULTS = {
  placement: 'bottom',
  title: 'Popover title',
};

const copy = {
  zh: {
    description: '弹出层：点击触发，内容可交互，自动定位并支持翻转，外部点击或 Escape 关闭后把焦点还给触发元素。',
    placementLabel: '方向',
    titleLabel: '标题',
    descOpen: '受控开关',
    descDefaultOpen: '非受控初始开关',
    descOnOpenChange: '开关变化回调',
    descPlacement: '期望方向：top / bottom / left / right',
    descAlign: '交叉轴对齐：start / center / end',
    descOffset: '与触发元素的间距',
    descTrigger: '触发按钮，负责开关与 aria 关联',
    descContent: '浮层内容，role="dialog"，可交互',
    descOutside: '点击外部关闭，默认 true',
    descEscape: '按 Escape 关闭，默认 true',
  },
  en: {
    description:
      'Click-triggered popovers with interactive content that position themselves and restore focus on close.',
    placementLabel: 'Placement',
    titleLabel: 'Title',
    descOpen: 'Controlled open state',
    descDefaultOpen: 'Initial open state when uncontrolled',
    descOnOpenChange: 'Called whenever the open state changes',
    descPlacement: 'Preferred side: top / bottom / left / right',
    descAlign: 'Cross-axis alignment: start / center / end',
    descOffset: 'Distance from the trigger',
    descTrigger: 'Trigger button, wires up toggling and ARIA',
    descContent: 'The popover surface, role="dialog", interactive',
    descOutside: 'Close on outside click, defaults to true',
    descEscape: 'Close on Escape, defaults to true',
  },
};

export const popoverDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'popover',
    title: 'Popover',
    category: 'Overlays',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    controls: [
      {
        type: 'select',
        name: 'placement',
        label: t.placementLabel,
        default: DEFAULTS.placement,
        options: ['top', 'bottom', 'left', 'right'],
      },
      { type: 'text', name: 'title', label: t.titleLabel, default: DEFAULTS.title },
    ],
    props: [
      { name: 'open', type: 'boolean', description: t.descOpen },
      { name: 'defaultOpen', type: 'boolean', default: 'false', description: t.descDefaultOpen },
      { name: 'onOpenChange', type: '(open: boolean) => void', description: t.descOnOpenChange },
      {
        name: 'placement',
        type: "'top' | 'bottom' | 'left' | 'right'",
        default: `'${DEFAULTS.placement}'`,
        description: t.descPlacement,
      },
      { name: 'align', type: "'start' | 'center' | 'end'", default: "'center'", description: t.descAlign },
      { name: 'offset', type: 'number', default: '8', description: t.descOffset },
      { name: 'Popover.Trigger', type: 'ButtonHTMLAttributes', description: t.descTrigger },
      { name: 'Popover.Content', type: 'HTMLAttributes', description: t.descContent },
      { name: 'closeOnInteractOutside', type: 'boolean', default: 'true', description: t.descOutside },
      { name: 'closeOnEscape', type: 'boolean', default: 'true', description: t.descEscape },
    ],
    render: (v) => (
      <PopoverDemo placement={v.placement as 'top' | 'bottom' | 'left' | 'right'} title={v.title as string} />
    ),
    usage: (v) => `import { Popover } from './components/elyri/Popover';

export function Example() {
  return (
    <Popover placement="${v.placement}">
      <Popover.Trigger>Open popover</Popover.Trigger>
      <Popover.Content>${v.title}</Popover.Content>
    </Popover>
  );
}`,
  };
};
