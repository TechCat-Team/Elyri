import { Popover } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const DEFAULTS = {
  placement: 'bottom',
};

const copy = {
  zh: {
    description: '弹出层：点击触发，内容可交互，自动定位并支持翻转，外部点击或 Escape 关闭后把焦点还给触发元素。',
    exBasic: '基础用法',
    exBasicDesc: '点击触发，浮层内可放置标题与说明等可交互内容。',
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
    exBasic: 'Basic',
    exBasicDesc: 'Click the trigger to open interactive content such as a title and body text.',
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
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        render: () => (
          <Popover>
            <Popover.Trigger>Open popover</Popover.Trigger>
            <Popover.Content>
              <div className="demo-ui-popover-title">Popover title</div>
              <p className="demo-ui-popover-text">
                Popovers hold interactive content, move focus inside and return it to the trigger on close.
              </p>
            </Popover.Content>
          </Popover>
        ),
        code: `import { Popover } from './components/elyri/Popover';

export function Example() {
  return (
    <Popover>
      <Popover.Trigger>Open popover</Popover.Trigger>
      <Popover.Content>
        <div className="demo-ui-popover-title">Popover title</div>
        <p className="demo-ui-popover-text">
          Popovers hold interactive content, move focus inside and return it to the trigger on close.
        </p>
      </Popover.Content>
    </Popover>
  );
}`,
      },
    ],
  };
};
