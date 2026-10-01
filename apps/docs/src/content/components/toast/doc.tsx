import { Button, useToast } from '@elyri/ui';
import type { ToastPosition } from '@elyri/ui';

import { useToastPosition } from '../../../lib/toastPosition';
import type { ComponentDoc, Lang } from '../../../lib/types';

const copy = {
  zh: {
    description: '轻提示：用 ToastProvider 承载 useToast，浮层堆叠、自动关闭、悬停暂停，兼容受控与非受控。',
    exBasic: '基础用法',
    exBasicDesc: '调用 toast({ title, description, variant }) 弹出一条提示。',
    exPosition: '位置切换',
    exPositionDesc: '切换 ToastProvider 的 position，提示会停靠在视口的六个方向之一。',
    exVariants: '全部变体',
    exVariantsDesc: '四种语义：info / success / warning / danger。',
    exLoading: '加载到成功',
    exLoadingDesc: '先弹出 loading 提示，再用 update(id, options) 就地改成 success。',
    exPromise: 'Promise',
    exPromiseDesc: 'promise(p, messages) 自动跟随 promise 切换 loading / success / error。',
    exPersistent: '常驻',
    exPersistentDesc: 'persistent: true 的提示不会自动关闭，只能由程序调用 dismiss(id) 关闭。',
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
    exBasic: 'Basic',
    exBasicDesc: 'Call toast({ title, description, variant }) to push a toast.',
    exPosition: 'Position',
    exPositionDesc: 'Switch the ToastProvider position to dock toasts to any of the six viewport corners.',
    exVariants: 'Variants',
    exVariantsDesc: 'Four variants: info / success / warning / danger.',
    exLoading: 'Loading → Success',
    exLoadingDesc: 'Push a loading toast, then update it in place to success with update(id, options).',
    exPromise: 'Promise',
    exPromiseDesc: 'promise(p, messages) follows a promise and switches loading / success / error.',
    exPersistent: 'Persistent',
    exPersistentDesc: 'A persistent: true toast never auto-dismisses; close it with dismiss(id).',
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

function ToastBasicExample() {
  const { toast } = useToast();

  return (
    <div className="demo-ui-row">
      <Button onClick={() => toast({ title: 'Saved', description: 'Saved to your workspace.', variant: 'success' })}>
        Show toast
      </Button>
    </div>
  );
}

const TOAST_POSITIONS: ToastPosition[] = ['top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right'];

/** 切换全局视口位置并弹出一条提示，直观对比六个停靠方向 */
function ToastPositionExample() {
  const { toast } = useToast();
  const { position, setPosition } = useToastPosition();

  const showAt = (next: ToastPosition) => {
    setPosition(next);
    toast({ title: 'Position', description: next, variant: 'info' });
  };

  return (
    <div className="demo-ui-row">
      {TOAST_POSITIONS.map((item) => (
        <Button
          key={item}
          size="sm"
          variant={item === position ? 'primary' : 'secondary'}
          onClick={() => showAt(item)}
        >
          {item}
        </Button>
      ))}
    </div>
  );
}

function ToastVariantsExample() {
  const { toast } = useToast();

  return (
    <div className="demo-ui-row">
      <Button onClick={() => toast({ title: 'Heads up', description: 'A neutral update.', variant: 'info' })}>
        Info
      </Button>
      <Button onClick={() => toast({ title: 'Saved', description: 'Saved to your workspace.', variant: 'success' })}>
        Success
      </Button>
      <Button onClick={() => toast({ title: 'Careful', description: 'This is irreversible.', variant: 'warning' })}>
        Warning
      </Button>
      <Button onClick={() => toast({ title: 'Error', description: 'Something went wrong.', variant: 'danger' })}>
        Danger
      </Button>
    </div>
  );
}

function ToastLoadingExample() {
  const { toast, update } = useToast();

  const showLoading = () => {
    const id = toast({ title: 'Uploading file', description: 'Please wait…', variant: 'loading' });
    setTimeout(
      () => update(id, { title: 'Upload complete', description: 'Saved to your workspace.', variant: 'success' }),
      1500,
    );
  };

  return (
    <div className="demo-ui-row">
      <Button onClick={showLoading}>Upload file</Button>
    </div>
  );
}

function ToastPromiseExample() {
  const { promise } = useToast();

  const showPromise = () => {
    promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
      loading: { title: 'Submitting', description: 'Hang tight…' },
      success: { title: 'Submitted', description: 'Saved to your workspace.' },
      error: { title: 'Submit failed', description: 'Please try again.' },
    });
  };

  return (
    <div className="demo-ui-row">
      <Button onClick={showPromise}>Submit</Button>
    </div>
  );
}

function ToastPersistentExample() {
  const { toast, dismiss } = useToast();

  const showPersistent = () => {
    const id = toast({
      title: 'Syncing',
      description: 'Closed by the app when the task finishes.',
      variant: 'loading',
      persistent: true,
    });
    setTimeout(() => dismiss(id), 3000);
  };

  return (
    <div className="demo-ui-row">
      <Button onClick={showPersistent}>Start sync</Button>
    </div>
  );
}

export const toastDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'toast',
    title: 'Toast',
    category: 'Feedback',
    pkg: 'ui',
    description: t.description,
    isNew: true,
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
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        wide: true,
        render: () => <ToastBasicExample />,
        code: `import { ToastProvider, useToast } from './components/elyri/Toast';
import { Button } from './components/elyri/Button';

function Trigger() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() => toast({ title: 'Saved', description: 'Saved to your workspace.', variant: 'success' })}
    >
      Show toast
    </Button>
  );
}

export function Example() {
  return (
    <ToastProvider>
      <Trigger />
    </ToastProvider>
  );
}`,
      },
      {
        title: t.exPosition,
        description: t.exPositionDesc,
        wide: true,
        render: () => <ToastPositionExample />,
        code: `import { useState } from 'react';
import { ToastProvider, useToast } from './components/elyri/Toast';
import type { ToastPosition } from './components/elyri/Toast';
import { Button } from './components/elyri/Button';

const positions: ToastPosition[] = ['top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right'];

function Trigger({ position, onPick }: { position: ToastPosition; onPick: (position: ToastPosition) => void }) {
  const { toast } = useToast();

  return (
    <div className="demo-ui-row">
      {positions.map((item) => (
        <Button
          key={item}
          variant={item === position ? 'primary' : 'secondary'}
          onClick={() => {
            onPick(item);
            toast({ title: 'Position', description: item, variant: 'info' });
          }}
        >
          {item}
        </Button>
      ))}
    </div>
  );
}

export function Example() {
  const [position, setPosition] = useState<ToastPosition>('top');

  return (
    <ToastProvider position={position}>
      <Trigger position={position} onPick={setPosition} />
    </ToastProvider>
  );
}`,
      },
      {
        title: t.exVariants,
        description: t.exVariantsDesc,
        wide: true,
        render: () => <ToastVariantsExample />,
        code: `import { ToastProvider, useToast } from './components/elyri/Toast';
import { Button } from './components/elyri/Button';

function Trigger() {
  const { toast } = useToast();

  return (
    <div className="demo-ui-row">
      <Button onClick={() => toast({ title: 'Heads up', description: 'A neutral update.', variant: 'info' })}>
        Info
      </Button>
      <Button onClick={() => toast({ title: 'Saved', description: 'Saved to your workspace.', variant: 'success' })}>
        Success
      </Button>
      <Button onClick={() => toast({ title: 'Careful', description: 'This is irreversible.', variant: 'warning' })}>
        Warning
      </Button>
      <Button onClick={() => toast({ title: 'Error', description: 'Something went wrong.', variant: 'danger' })}>
        Danger
      </Button>
    </div>
  );
}

export function Example() {
  return (
    <ToastProvider>
      <Trigger />
    </ToastProvider>
  );
}`,
      },
      {
        title: t.exLoading,
        description: t.exLoadingDesc,
        wide: true,
        render: () => <ToastLoadingExample />,
        code: `import { ToastProvider, useToast } from './components/elyri/Toast';
import { Button } from './components/elyri/Button';

function Trigger() {
  const { toast, update } = useToast();

  const showLoading = () => {
    const id = toast({ title: 'Uploading file', description: 'Please wait…', variant: 'loading' });
    setTimeout(
      () => update(id, { title: 'Upload complete', description: 'Saved to your workspace.', variant: 'success' }),
      1500,
    );
  };

  return <Button onClick={showLoading}>Upload file</Button>;
}

export function Example() {
  return (
    <ToastProvider>
      <Trigger />
    </ToastProvider>
  );
}`,
      },
      {
        title: t.exPromise,
        description: t.exPromiseDesc,
        wide: true,
        render: () => <ToastPromiseExample />,
        code: `import { ToastProvider, useToast } from './components/elyri/Toast';
import { Button } from './components/elyri/Button';

function Trigger() {
  const { promise } = useToast();

  const showPromise = () => {
    promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
      loading: { title: 'Submitting', description: 'Hang tight…' },
      success: { title: 'Submitted', description: 'Saved to your workspace.' },
      error: { title: 'Submit failed', description: 'Please try again.' },
    });
  };

  return <Button onClick={showPromise}>Submit</Button>;
}

export function Example() {
  return (
    <ToastProvider>
      <Trigger />
    </ToastProvider>
  );
}`,
      },
      {
        title: t.exPersistent,
        description: t.exPersistentDesc,
        wide: true,
        render: () => <ToastPersistentExample />,
        code: `import { ToastProvider, useToast } from './components/elyri/Toast';
import { Button } from './components/elyri/Button';

function Trigger() {
  const { toast, dismiss } = useToast();

  const showPersistent = () => {
    const id = toast({
      title: 'Syncing',
      description: 'Closed by the app when the task finishes.',
      variant: 'loading',
      persistent: true,
    });
    setTimeout(() => dismiss(id), 3000);
  };

  return <Button onClick={showPersistent}>Start sync</Button>;
}

export function Example() {
  return (
    <ToastProvider>
      <Trigger />
    </ToastProvider>
  );
}`,
      },
    ],
  };
};
