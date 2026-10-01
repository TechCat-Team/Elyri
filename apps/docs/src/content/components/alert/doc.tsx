import { useState } from 'react';

import { Alert } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const DEFAULTS = {
  variant: 'info',
};

const copy = {
  zh: {
    description: '提示条：四种语义配色，可带标题、图标与关闭按钮，危险态自动用 alert 语义播报。',
    exVariants: '全部变体',
    exVariantsDesc: '四种语义配色：info / success / warning / danger。',
    exBordered: '描边',
    exBorderedDesc: '默认带边框，bordered={false} 可去掉。',
    exAccent: '强调',
    exAccentDesc: 'accent={false} 关闭强调色，图标与背景转为中性色。',
    exClosable: '可关闭',
    exClosableDesc: '传入 onClose 后显示关闭按钮，点击即隐藏。',
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
    exVariants: 'Variants',
    exVariantsDesc: 'Four semantic colors: info / success / warning / danger.',
    exBordered: 'Bordered',
    exBorderedDesc: 'The border shows by default; set bordered={false} to drop it.',
    exAccent: 'Accent',
    exAccentDesc: 'Set accent={false} for a neutral icon and background.',
    exClosable: 'Closable',
    exClosableDesc: 'Pass onClose to render a close button that hides the alert.',
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

function ClosableAlert() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="demo-ui-stack">
      <Alert variant="success" title="Saved" onClose={() => setVisible(false)}>
        Your changes have been stored.
      </Alert>
    </div>
  );
}

export const alertDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'alert',
    title: 'Alert',
    category: 'Feedback',
    pkg: 'ui',
    description: t.description,
    isNew: true,
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
    examples: [
      {
        title: t.exVariants,
        description: t.exVariantsDesc,
        render: () => (
          <div className="demo-ui-stack">
            <Alert variant="info" title="Info">
              A short supporting message.
            </Alert>
            <Alert variant="success" title="Success">
              A short supporting message.
            </Alert>
            <Alert variant="warning" title="Warning">
              A short supporting message.
            </Alert>
            <Alert variant="danger" title="Danger">
              A short supporting message.
            </Alert>
          </div>
        ),
        code: `import { Alert } from './components/elyri/Alert';

export function Example() {
  return (
    <div className="demo-ui-stack">
      <Alert variant="info" title="Info">
        A short supporting message.
      </Alert>
      <Alert variant="success" title="Success">
        A short supporting message.
      </Alert>
      <Alert variant="warning" title="Warning">
        A short supporting message.
      </Alert>
      <Alert variant="danger" title="Danger">
        A short supporting message.
      </Alert>
    </div>
  );
}`,
      },
      {
        title: t.exBordered,
        description: t.exBorderedDesc,
        render: () => (
          <div className="demo-ui-stack">
            <Alert variant="info" title="Bordered">
              The default alert keeps its border.
            </Alert>
            <Alert variant="info" title="No border" bordered={false}>
              Set bordered={'{false}'} to drop the border.
            </Alert>
          </div>
        ),
        code: `import { Alert } from './components/elyri/Alert';

export function Example() {
  return (
    <div className="demo-ui-stack">
      <Alert variant="info" title="Bordered">
        The default alert keeps its border.
      </Alert>
      <Alert variant="info" title="No border" bordered={false}>
        Set bordered={false} to drop the border.
      </Alert>
    </div>
  );
}`,
      },
      {
        title: t.exAccent,
        description: t.exAccentDesc,
        render: () => (
          <div className="demo-ui-stack">
            <Alert variant="success" title="Accent">
              Accent coloring is on by default.
            </Alert>
            <Alert variant="success" title="Neutral" accent={false}>
              Set accent={'{false}'} for a neutral icon and background.
            </Alert>
          </div>
        ),
        code: `import { Alert } from './components/elyri/Alert';

export function Example() {
  return (
    <div className="demo-ui-stack">
      <Alert variant="success" title="Accent">
        Accent coloring is on by default.
      </Alert>
      <Alert variant="success" title="Neutral" accent={false}>
        Set accent={false} for a neutral icon and background.
      </Alert>
    </div>
  );
}`,
      },
      {
        title: t.exClosable,
        description: t.exClosableDesc,
        render: () => <ClosableAlert />,
        code: `import { useState } from 'react';

import { Alert } from './components/elyri/Alert';

export function Example() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <Alert variant="success" title="Saved" onClose={() => setVisible(false)}>
      Your changes have been stored.
    </Alert>
  );
}`,
      },
    ],
  };
};
