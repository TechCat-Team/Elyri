import { lazy } from 'react';

import type { ComponentDoc, Lang } from '../../../lib/types';

const DialogDemo = lazy(() => import('./DialogDemo'));

const DEFAULTS = {
  title: 'Delete project',
  description: 'This permanently removes the project and everything in it. This cannot be undone.',
};

const copy = {
  zh: {
    description: '对话框：模态浮层，自动圈定焦点、锁定滚动，点击遮罩或按 Escape 关闭并把焦点还给触发元素。',
    titleLabel: '标题',
    descriptionLabel: '描述',
    descOpen: '受控开关',
    descDefaultOpen: '非受控初始开关',
    descOnOpenChange: '开关变化回调',
    descModal: '模态：锁定滚动并圈定焦点，默认 true',
    descContent: '内容区，挂到 body 的浮层里',
    descOverlayClick: '点击遮罩关闭，默认 true',
    descEscape: '按 Escape 关闭，默认 true',
    descClose: '点击即关闭的按钮',
    descTrigger: '触发按钮，自动带上 aria-haspopup / aria-expanded',
    descTitle: '标题，作为对话框的无障碍名称',
    descDescription: '描述，关联到 aria-describedby',
  },
  en: {
    description: 'Modal dialogs that trap focus, lock scrolling, and restore focus on overlay click or Escape.',
    titleLabel: 'Title',
    descriptionLabel: 'Description',
    descOpen: 'Controlled open state',
    descDefaultOpen: 'Initial open state when uncontrolled',
    descOnOpenChange: 'Called whenever the open state changes',
    descModal: 'Modal: locks scroll and traps focus, defaults to true',
    descContent: 'The dialog surface, rendered in a portal on body',
    descOverlayClick: 'Close on overlay click, defaults to true',
    descEscape: 'Close on Escape, defaults to true',
    descClose: 'A button that closes the dialog',
    descTrigger: 'Trigger button, wired with aria-haspopup / aria-expanded',
    descTitle: 'Title, used as the accessible name',
    descDescription: 'Description, linked through aria-describedby',
  },
};

export const dialogDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'dialog',
    title: 'Dialog',
    category: 'Overlays',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    controls: [
      { type: 'text', name: 'title', label: t.titleLabel, default: DEFAULTS.title },
      { type: 'text', name: 'description', label: t.descriptionLabel, default: DEFAULTS.description },
    ],
    props: [
      { name: 'open', type: 'boolean', description: t.descOpen },
      { name: 'defaultOpen', type: 'boolean', default: 'false', description: t.descDefaultOpen },
      { name: 'onOpenChange', type: '(open: boolean) => void', description: t.descOnOpenChange },
      { name: 'modal', type: 'boolean', default: 'true', description: t.descModal },
      { name: 'Dialog.Trigger', type: 'ButtonHTMLAttributes', description: t.descTrigger },
      { name: 'Dialog.Content', type: 'HTMLAttributes', description: t.descContent },
      { name: 'closeOnOverlayClick', type: 'boolean', default: 'true', description: t.descOverlayClick },
      { name: 'closeOnEscape', type: 'boolean', default: 'true', description: t.descEscape },
      { name: 'Dialog.Title', type: 'HTMLAttributes', description: t.descTitle },
      { name: 'Dialog.Description', type: 'HTMLAttributes', description: t.descDescription },
      { name: 'Dialog.Close', type: 'ButtonHTMLAttributes', description: t.descClose },
    ],
    render: (v) => <DialogDemo title={v.title as string} description={v.description as string} />,
    usage: (v) => `import { Dialog } from './components/elyri/Dialog';

export function Example() {
  return (
    <Dialog>
      <Dialog.Trigger>Open dialog</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>${v.title}</Dialog.Title>
        <Dialog.Description>${v.description}</Dialog.Description>
        <Dialog.Close>Got it</Dialog.Close>
      </Dialog.Content>
    </Dialog>
  );
}`,
  };
};
