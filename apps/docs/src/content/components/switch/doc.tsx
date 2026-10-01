import { Switch } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const copy = {
  zh: {
    description: '开关：受控 / 非受控双支持，role="switch" 语义，空格与回车键切换。',
    exBasic: '基础用法',
    exBasicDesc: '两个带标签的开关，其中一个默认开启。',
    exSizes: '尺寸',
    exSizesDesc: '两档尺寸：sm / md。',
    exDisabled: '禁用',
    exDisabledDesc: '开启与关闭两种禁用状态。',
    descChecked: '受控选中状态；不传则为非受控',
    descDefaultChecked: '非受控初始状态',
    descOnCheckedChange: '选中状态变化回调，受控与非受控都会触发',
    descSize: '控件尺寸：sm / md',
    descDisabled: '是否禁用',
    descRest: '其余属性透传给原生 button',
  },
  en: {
    description: 'A switch with controlled and uncontrolled modes, role="switch" semantics and Space / Enter toggling.',
    exBasic: 'Basic',
    exBasicDesc: 'Two labelled switches, one of them on by default.',
    exSizes: 'Sizes',
    exSizesDesc: 'Two sizes: sm / md.',
    exDisabled: 'Disabled',
    exDisabledDesc: 'Both the on and off disabled states.',
    descChecked: 'Controlled value; omit it to run uncontrolled',
    descDefaultChecked: 'Initial value when uncontrolled',
    descOnCheckedChange: 'Called on every change, controlled or not',
    descSize: 'Control size: sm / md',
    descDisabled: 'Whether the switch is disabled',
    descRest: 'Remaining props are forwarded to the native button',
  },
};

export const switchDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'switch',
    title: 'Switch',
    category: 'Forms',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      { name: 'checked', type: 'boolean', description: t.descChecked },
      { name: 'defaultChecked', type: 'boolean', default: 'false', description: t.descDefaultChecked },
      { name: 'onCheckedChange', type: '(checked: boolean) => void', description: t.descOnCheckedChange },
      { name: 'size', type: "'sm' | 'md'", default: "'md'", description: t.descSize },
      { name: 'disabled', type: 'boolean', default: 'false', description: t.descDisabled },
      { name: '...rest', type: 'ButtonHTMLAttributes', description: t.descRest },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        render: () => (
          <div className="demo-stack">
            <div className="demo-ui-switch-row">
              <span>Email notifications</span>
              <Switch defaultChecked aria-label="Email notifications" />
            </div>
            <div className="demo-ui-switch-row">
              <span>Product updates</span>
              <Switch aria-label="Product updates" />
            </div>
          </div>
        ),
        code: `import { Switch } from './components/elyri/Switch';

export function Example() {
  return (
    <div className="demo-stack">
      <div className="demo-ui-switch-row">
        <span>Email notifications</span>
        <Switch defaultChecked aria-label="Email notifications" />
      </div>
      <div className="demo-ui-switch-row">
        <span>Product updates</span>
        <Switch aria-label="Product updates" />
      </div>
    </div>
  );
}`,
      },
      {
        title: t.exSizes,
        description: t.exSizesDesc,
        render: () => (
          <div className="demo-stack">
            <div className="demo-ui-switch-row">
              <span>Small</span>
              <Switch size="sm" defaultChecked aria-label="Small" />
            </div>
            <div className="demo-ui-switch-row">
              <span>Medium</span>
              <Switch size="md" defaultChecked aria-label="Medium" />
            </div>
          </div>
        ),
        code: `import { Switch } from './components/elyri/Switch';

export function Example() {
  return (
    <div className="demo-stack">
      <div className="demo-ui-switch-row">
        <span>Small</span>
        <Switch size="sm" defaultChecked aria-label="Small" />
      </div>
      <div className="demo-ui-switch-row">
        <span>Medium</span>
        <Switch size="md" defaultChecked aria-label="Medium" />
      </div>
    </div>
  );
}`,
      },
      {
        title: t.exDisabled,
        description: t.exDisabledDesc,
        render: () => (
          <div className="demo-stack">
            <div className="demo-ui-switch-row">
              <span>On</span>
              <Switch defaultChecked disabled aria-label="On" />
            </div>
            <div className="demo-ui-switch-row">
              <span>Off</span>
              <Switch disabled aria-label="Off" />
            </div>
          </div>
        ),
        code: `import { Switch } from './components/elyri/Switch';

export function Example() {
  return (
    <div className="demo-stack">
      <div className="demo-ui-switch-row">
        <span>On</span>
        <Switch defaultChecked disabled aria-label="On" />
      </div>
      <div className="demo-ui-switch-row">
        <span>Off</span>
        <Switch disabled aria-label="Off" />
      </div>
    </div>
  );
}`,
      },
    ],
  };
};
