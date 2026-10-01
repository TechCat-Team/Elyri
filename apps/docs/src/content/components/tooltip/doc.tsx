import { lazy } from 'react';

import type { ComponentDoc, Lang } from '../../../lib/types';

const TooltipDemo = lazy(() => import('./TooltipDemo'));

const DEFAULTS = {
  placement: 'top',
  text: 'Short, non-interactive hint',
};

const copy = {
  zh: {
    description: '工具提示：悬停或聚焦触发，自动测量定位并在空间不足时翻转，只承载不可交互的短文案。',
    placementLabel: '方向',
    textLabel: '提示文案',
    descOpen: '受控开关',
    descDefaultOpen: '非受控初始开关',
    descOnOpenChange: '开关变化回调',
    descDelay: '悬停多久后显示（毫秒），键盘聚焦立即显示',
    descPlacement: '期望方向：top / bottom / left / right',
    descAlign: '交叉轴对齐：start / center / end',
    descOffset: '与触发元素的间距',
    descTrigger: '触发按钮，负责悬停 / 聚焦逻辑',
    descContent: '提示内容，role="tooltip"，不可交互',
  },
  en: {
    description: 'Tooltips that follow hover or focus, position themselves automatically and flip when space runs out.',
    placementLabel: 'Placement',
    textLabel: 'Hint text',
    descOpen: 'Controlled open state',
    descDefaultOpen: 'Initial open state when uncontrolled',
    descOnOpenChange: 'Called whenever the open state changes',
    descDelay: 'Hover delay in milliseconds; focus opens it immediately',
    descPlacement: 'Preferred side: top / bottom / left / right',
    descAlign: 'Cross-axis alignment: start / center / end',
    descOffset: 'Distance from the trigger',
    descTrigger: 'The trigger button that handles hover and focus',
    descContent: 'The tooltip content, role="tooltip", non-interactive',
  },
};

export const tooltipDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'tooltip',
    title: 'Tooltip',
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
      { type: 'text', name: 'text', label: t.textLabel, default: DEFAULTS.text },
    ],
    props: [
      { name: 'open', type: 'boolean', description: t.descOpen },
      { name: 'defaultOpen', type: 'boolean', default: 'false', description: t.descDefaultOpen },
      { name: 'onOpenChange', type: '(open: boolean) => void', description: t.descOnOpenChange },
      { name: 'delay', type: 'number', default: '200', description: t.descDelay },
      {
        name: 'placement',
        type: "'top' | 'bottom' | 'left' | 'right'",
        default: `'${DEFAULTS.placement}'`,
        description: t.descPlacement,
      },
      { name: 'align', type: "'start' | 'center' | 'end'", default: "'center'", description: t.descAlign },
      { name: 'offset', type: 'number', default: '8', description: t.descOffset },
      { name: 'Tooltip.Trigger', type: 'ButtonHTMLAttributes', description: t.descTrigger },
      { name: 'Tooltip.Content', type: 'HTMLAttributes', description: t.descContent },
    ],
    render: (v) => (
      <TooltipDemo placement={v.placement as 'top' | 'bottom' | 'left' | 'right'} text={v.text as string} />
    ),
    usage: (v) => `import { Tooltip } from './components/elyri/Tooltip';

export function Example() {
  return (
    <Tooltip placement="${v.placement}">
      <Tooltip.Trigger>Hover me</Tooltip.Trigger>
      <Tooltip.Content>${v.text}</Tooltip.Content>
    </Tooltip>
  );
}`,
  };
};
