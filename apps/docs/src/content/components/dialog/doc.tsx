import { Button, Dialog } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const copy = {
  zh: {
    description:
      '对话框：模态浮层，弹簧动画进出场，自动圈定焦点、锁定滚动，点击遮罩或按 Escape 关闭并把焦点还给触发元素。',
    exBasic: '基础用法',
    exBasicDesc: 'Dialog.Header / Body / Footer 组织结构，右上角自带关闭按钮；配合 asChild 直接使用 Button。',
    exScroll: '长内容滚动',
    exScrollDesc: '只有 Body 滚动，Header 与 Footer 保持固定，溢出时自动出现分割线。',
    exLocked: '阻止关闭',
    exLockedDesc: '关闭遮罩与 Escape 关闭后，误触时面板会轻弹提示，只能通过按钮关闭。',
    descOpen: '受控开关',
    descDefaultOpen: '非受控初始开关',
    descOnOpenChange: '开关变化回调',
    descModal: '模态：锁定滚动并圈定焦点，默认 true',
    descContent: '内容区，挂到 body 的浮层里',
    descOverlayClick: '点击遮罩关闭，默认 true；为 false 时面板轻弹提示',
    descEscape: '按 Escape 关闭，默认 true；为 false 时面板轻弹提示',
    descShowClose: '显示右上角关闭按钮，默认 true',
    descCloseLabel: '右上角关闭按钮的无障碍名称',
    descHeader: '头部，放 Title 与 Description',
    descBody: '可滚动主体，溢出时显示分割线',
    descFooter: '底部操作区，按钮右对齐，窄屏纵向铺满',
    descClose: '点击即关闭的按钮',
    descTrigger: '触发按钮，自动带上 aria-haspopup / aria-expanded',
    descAsChild: 'Trigger / Close 上使用：把行为合并到唯一子元素，如 <Button>',
    descTitle: '标题，作为对话框的无障碍名称',
    descDescription: '描述，关联到 aria-describedby',
  },
  en: {
    description:
      'Modal dialogs with springy transitions that trap focus, lock scrolling, and restore focus on overlay click or Escape.',
    exBasic: 'Basic',
    exBasicDesc:
      'Structure with Dialog.Header / Body / Footer; a corner close button is built in. Use asChild to render a Button.',
    exScroll: 'Scrolling content',
    exScrollDesc: 'Only the body scrolls while the header and footer stay put, with dividers appearing on overflow.',
    exLocked: 'Blocked dismissal',
    exLockedDesc: 'With overlay click and Escape disabled, stray dismiss attempts make the surface bump instead.',
    descOpen: 'Controlled open state',
    descDefaultOpen: 'Initial open state when uncontrolled',
    descOnOpenChange: 'Called whenever the open state changes',
    descModal: 'Modal: locks scroll and traps focus, defaults to true',
    descContent: 'The dialog surface, rendered in a portal on body',
    descOverlayClick: 'Close on overlay click, defaults to true; bumps when false',
    descEscape: 'Close on Escape, defaults to true; bumps when false',
    descShowClose: 'Show the corner close button, defaults to true',
    descCloseLabel: 'Accessible name of the corner close button',
    descHeader: 'Header holding the Title and Description',
    descBody: 'Scrollable body with overflow dividers',
    descFooter: 'Footer actions, right-aligned and stacked on narrow screens',
    descClose: 'A button that closes the dialog',
    descTrigger: 'Trigger button, wired with aria-haspopup / aria-expanded',
    descAsChild: 'On Trigger / Close: merge behaviour onto the single child, e.g. <Button>',
    descTitle: 'Title, used as the accessible name',
    descDescription: 'Description, linked through aria-describedby',
  },
};

const PARAGRAPHS = Array.from(
  { length: 8 },
  (_, index) =>
    `Section ${index + 1}. By using this service you agree to keep your credentials safe, respect usage limits, and let us process the data required to run your workspace.`,
);

function DialogBasicExample() {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="danger">Delete project</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Delete project</Dialog.Title>
          <Dialog.Description>
            This permanently removes the project and everything in it. This cannot be undone.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="secondary">Cancel</Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button variant="danger">Delete</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

function DialogScrollExample() {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="secondary">Read terms</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Terms of service</Dialog.Title>
          <Dialog.Description>Please read carefully before continuing.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Body>
          {PARAGRAPHS.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="secondary">Decline</Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button>Accept</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

function DialogLockedExample() {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="secondary">Start upload</Button>
      </Dialog.Trigger>
      <Dialog.Content closeOnOverlayClick={false} closeOnEscape={false} showCloseButton={false}>
        <Dialog.Header>
          <Dialog.Title>Upload in progress</Dialog.Title>
          <Dialog.Description>Try clicking outside or pressing Escape — use the button to finish.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button>Done</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

export const dialogDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'dialog',
    title: 'Dialog',
    category: 'Overlays',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      { name: 'open', type: 'boolean', description: t.descOpen },
      { name: 'defaultOpen', type: 'boolean', default: 'false', description: t.descDefaultOpen },
      { name: 'onOpenChange', type: '(open: boolean) => void', description: t.descOnOpenChange },
      { name: 'modal', type: 'boolean', default: 'true', description: t.descModal },
      { name: 'Dialog.Trigger', type: 'ButtonHTMLAttributes', description: t.descTrigger },
      { name: 'asChild', type: 'boolean', default: 'false', description: t.descAsChild },
      { name: 'Dialog.Content', type: 'HTMLAttributes', description: t.descContent },
      { name: 'closeOnOverlayClick', type: 'boolean', default: 'true', description: t.descOverlayClick },
      { name: 'closeOnEscape', type: 'boolean', default: 'true', description: t.descEscape },
      { name: 'showCloseButton', type: 'boolean', default: 'true', description: t.descShowClose },
      { name: 'closeLabel', type: 'string', default: "'Close'", description: t.descCloseLabel },
      { name: 'Dialog.Header', type: 'HTMLAttributes', description: t.descHeader },
      { name: 'Dialog.Body', type: 'HTMLAttributes', description: t.descBody },
      { name: 'Dialog.Footer', type: 'HTMLAttributes', description: t.descFooter },
      { name: 'Dialog.Title', type: 'HTMLAttributes', description: t.descTitle },
      { name: 'Dialog.Description', type: 'HTMLAttributes', description: t.descDescription },
      { name: 'Dialog.Close', type: 'ButtonHTMLAttributes', description: t.descClose },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        render: () => (
          <div className="demo-ui-row">
            <DialogBasicExample />
          </div>
        ),
        code: `import { Button } from './components/elyri/Button';
import { Dialog } from './components/elyri/Dialog';

export function Example() {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="danger">Delete project</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Delete project</Dialog.Title>
          <Dialog.Description>
            This permanently removes the project and everything in it. This cannot be undone.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="secondary">Cancel</Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button variant="danger">Delete</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}`,
      },
      {
        title: t.exScroll,
        description: t.exScrollDesc,
        render: () => (
          <div className="demo-ui-row">
            <DialogScrollExample />
          </div>
        ),
        code: `import { Button } from './components/elyri/Button';
import { Dialog } from './components/elyri/Dialog';

export function Example({ paragraphs }: { paragraphs: string[] }) {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="secondary">Read terms</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Terms of service</Dialog.Title>
          <Dialog.Description>Please read carefully before continuing.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Body>
          {paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="secondary">Decline</Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button>Accept</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}`,
      },
      {
        title: t.exLocked,
        description: t.exLockedDesc,
        render: () => (
          <div className="demo-ui-row">
            <DialogLockedExample />
          </div>
        ),
        code: `import { Button } from './components/elyri/Button';
import { Dialog } from './components/elyri/Dialog';

export function Example() {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="secondary">Start upload</Button>
      </Dialog.Trigger>
      <Dialog.Content closeOnOverlayClick={false} closeOnEscape={false} showCloseButton={false}>
        <Dialog.Header>
          <Dialog.Title>Upload in progress</Dialog.Title>
          <Dialog.Description>Try clicking outside or pressing Escape — use the button to finish.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button>Done</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}`,
      },
    ],
  };
};
