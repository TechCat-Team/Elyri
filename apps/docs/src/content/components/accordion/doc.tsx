import { Accordion } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const DEFAULTS = {
  type: 'single',
  collapsible: false,
  variant: 'lined',
};

const SparkIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
  </svg>
);

const ShieldIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const BoltIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z" />
  </svg>
);

const copy = {
  zh: {
    description:
      '手风琴：支持单项 / 多项展开，标题可带图标，受控 / 非受控双支持，grid 高度动画，符合 WAI-ARIA 手风琴模式。',
    exLined: '分隔线',
    exLinedDesc: '默认样式，条目间以分隔线堆叠，适合 FAQ 列表。',
    exSeparated: '卡片',
    exSeparatedDesc: '每条目一张卡片，展开时高亮描边并浮起阴影。',
    exCollapsible: '可收起',
    exCollapsibleDesc: '开启 collapsible 后，再次点击已展开项可将其收起。',
    exMultiple: '多项展开 + 图标',
    exMultipleDesc: 'type="multiple" 允许同时展开多项，Trigger 的 icon 给标题加上前置图标。',
    descType: '展开模式：single（每次只展开一项）/ multiple（可同时展开多项）',
    descValue: '受控展开值；multiple 下为 string[]',
    descDefaultValue: '非受控初始值；multiple 下为 string[]',
    descOnValueChange: '展开值变化回调，签名随 type 变化（string / string[]）',
    descCollapsible: '允许再次点击已展开项将其收起（multiple 天然可收起）',
    descVariant: '外观样式：lined（分隔线堆叠）/ separated（独立卡片）',
    descItem: '单个条目，value 关联标题与面板，可禁用',
    descTrigger: '标题按钮，外层自动包裹 h3；icon 为前置图标',
    descContent: '面板，始终留在 DOM 中，收起时仅隐藏',
    descRest: '其余属性透传给原生 div',
  },
  en: {
    description:
      'An accordion that supports single or multiple expansion, optional per-item icons, controlled and uncontrolled modes, grid-based height animation and the WAI-ARIA accordion pattern.',
    exLined: 'Lined',
    exLinedDesc: 'The default look; items stack with dividers, handy for FAQ lists.',
    exSeparated: 'Separated',
    exSeparatedDesc: 'Each item is a card; the open one lights up its border and floats with a shadow.',
    exCollapsible: 'Collapsible',
    exCollapsibleDesc: 'With collapsible enabled, clicking the open item again folds it away.',
    exMultiple: 'Multiple + icons',
    exMultipleDesc: 'type="multiple" lets several items stay open; the icon prop adds a leading icon to a title.',
    descType: 'Expansion mode: single (one item at a time) or multiple (several at once)',
    descValue: 'Controlled expanded value; a string[] when multiple',
    descDefaultValue: 'Initial value when uncontrolled; a string[] when multiple',
    descOnValueChange: 'Called on every change; the signature follows type (string / string[])',
    descCollapsible: 'Allows clicking the open item again to collapse it (multiple is always collapsible)',
    descVariant: 'Appearance: lined (stacked with dividers) or separated (standalone cards)',
    descItem: 'A single item; its value links the trigger and the panel, and it can be disabled',
    descTrigger: 'The heading button, wrapped in an h3; icon renders a leading icon',
    descContent: 'Panel kept in the DOM, only hidden while collapsed',
    descRest: 'Remaining props are forwarded to the native div',
  },
};

export const accordionDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'accordion',
    title: 'Accordion',
    category: 'Navigation',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      { name: 'type', type: "'single' | 'multiple'", default: `'${DEFAULTS.type}'`, description: t.descType },
      { name: 'value', type: 'string | string[]', description: t.descValue },
      { name: 'defaultValue', type: 'string | string[]', description: t.descDefaultValue },
      { name: 'onValueChange', type: '(value: string | string[]) => void', description: t.descOnValueChange },
      { name: 'collapsible', type: 'boolean', default: String(DEFAULTS.collapsible), description: t.descCollapsible },
      {
        name: 'variant',
        type: "'lined' | 'separated'",
        default: `'${DEFAULTS.variant}'`,
        description: t.descVariant,
      },
      {
        name: 'Accordion.Item',
        type: '{ value: string; disabled?: boolean } & HTMLAttributes',
        description: t.descItem,
      },
      { name: 'Accordion.Trigger', type: '{ icon?: ReactNode } & ButtonHTMLAttributes', description: t.descTrigger },
      { name: 'Accordion.Content', type: 'HTMLAttributes', description: t.descContent },
      { name: '...rest', type: 'HTMLAttributes', description: t.descRest },
    ],
    examples: [
      {
        title: t.exLined,
        description: t.exLinedDesc,
        wide: true,
        render: () => (
          <Accordion defaultValue="shipping" className="demo-ui-accordion">
            <Accordion.Item value="shipping">
              <Accordion.Trigger>When will my order ship?</Accordion.Trigger>
              <Accordion.Content>
                Orders are packed within 24 hours and shipped the next business day. You will get a tracking link by
                email as soon as the parcel leaves the warehouse.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="returns">
              <Accordion.Trigger>Can I return a purchase?</Accordion.Trigger>
              <Accordion.Content>
                Yes. Unopened items can be returned within 30 days of delivery for a full refund, no questions asked.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="warranty" disabled>
              <Accordion.Trigger>Is there a warranty?</Accordion.Trigger>
              <Accordion.Content>Every product includes a two-year limited warranty.</Accordion.Content>
            </Accordion.Item>
          </Accordion>
        ),
        code: `import { Accordion } from './components/elyri/Accordion';

export function Example() {
  return (
    <Accordion defaultValue="shipping">
      <Accordion.Item value="shipping">
        <Accordion.Trigger>When will my order ship?</Accordion.Trigger>
        <Accordion.Content>
          Orders are packed within 24 hours and shipped the next business day. You will get a tracking link by
          email as soon as the parcel leaves the warehouse.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="returns">
        <Accordion.Trigger>Can I return a purchase?</Accordion.Trigger>
        <Accordion.Content>
          Yes. Unopened items can be returned within 30 days of delivery for a full refund, no questions asked.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="warranty" disabled>
        <Accordion.Trigger>Is there a warranty?</Accordion.Trigger>
        <Accordion.Content>Every product includes a two-year limited warranty.</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}`,
      },
      {
        title: t.exSeparated,
        description: t.exSeparatedDesc,
        wide: true,
        render: () => (
          <Accordion defaultValue="account" variant="separated" className="demo-ui-accordion">
            <Accordion.Item value="account">
              <Accordion.Trigger>How do I reset my password?</Accordion.Trigger>
              <Accordion.Content>
                Open Settings, choose Security, then click Reset password. We email you a link that stays valid for one
                hour.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="billing">
              <Accordion.Trigger>Where are my invoices?</Accordion.Trigger>
              <Accordion.Content>
                Every invoice lives under Billing → History and can be downloaded as a PDF at any time.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="team">
              <Accordion.Trigger>Can I invite my team?</Accordion.Trigger>
              <Accordion.Content>
                Workspace owners can invite unlimited members from the Team page. Roles control what each member can
                change.
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        ),
        code: `import { Accordion } from './components/elyri/Accordion';

export function Example() {
  return (
    <Accordion defaultValue="account" variant="separated">
      <Accordion.Item value="account">
        <Accordion.Trigger>How do I reset my password?</Accordion.Trigger>
        <Accordion.Content>
          Open Settings, choose Security, then click Reset password. We email you a link that stays valid for
          one hour.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="billing">
        <Accordion.Trigger>Where are my invoices?</Accordion.Trigger>
        <Accordion.Content>
          Every invoice lives under Billing → History and can be downloaded as a PDF at any time.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="team">
        <Accordion.Trigger>Can I invite my team?</Accordion.Trigger>
        <Accordion.Content>
          Workspace owners can invite unlimited members from the Team page. Roles control what each member can
          change.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}`,
      },
      {
        title: t.exCollapsible,
        description: t.exCollapsibleDesc,
        wide: true,
        render: () => (
          <Accordion defaultValue="install" collapsible className="demo-ui-accordion">
            <Accordion.Item value="install">
              <Accordion.Trigger>How do I install Elyri?</Accordion.Trigger>
              <Accordion.Content>
                Run npx elyri add accordion and the component source is copied straight into your project.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="theme">
              <Accordion.Trigger>Can I restyle it?</Accordion.Trigger>
              <Accordion.Content>
                Yes. Every color, radius and shadow comes from CSS variables, so overriding a handful of tokens reskins
                the whole component.
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        ),
        code: `import { Accordion } from './components/elyri/Accordion';

export function Example() {
  return (
    <Accordion defaultValue="install" collapsible>
      <Accordion.Item value="install">
        <Accordion.Trigger>How do I install Elyri?</Accordion.Trigger>
        <Accordion.Content>
          Run npx elyri add accordion and the component source is copied straight into your project.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="theme">
        <Accordion.Trigger>Can I restyle it?</Accordion.Trigger>
        <Accordion.Content>
          Yes. Every color, radius and shadow comes from CSS variables, so overriding a handful of tokens
          reskins the whole component.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}`,
      },
      {
        title: t.exMultiple,
        description: t.exMultipleDesc,
        wide: true,
        render: () => (
          <Accordion
            type="multiple"
            defaultValue={['design', 'build']}
            variant="separated"
            className="demo-ui-accordion"
          >
            <Accordion.Item value="design">
              <Accordion.Trigger icon={SparkIcon}>Design tokens</Accordion.Trigger>
              <Accordion.Content>
                Colors, radii and shadows all read from CSS variables, so a theme change is a handful of overrides.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="build">
              <Accordion.Trigger icon={BoltIcon}>Build pipeline</Accordion.Trigger>
              <Accordion.Content>
                tsup emits ESM, CJS and type declarations for every package on each build.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="a11y">
              <Accordion.Trigger icon={ShieldIcon}>Accessibility</Accordion.Trigger>
              <Accordion.Content>
                Triggers expose aria-expanded and panels become labelled regions, matching the WAI-ARIA pattern.
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        ),
        code: `import { Accordion } from './components/elyri/Accordion';

const SparkIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
  </svg>
);

export function Example() {
  return (
    <Accordion type="multiple" defaultValue={['design', 'build']} variant="separated">
      <Accordion.Item value="design">
        <Accordion.Trigger icon={SparkIcon}>Design tokens</Accordion.Trigger>
        <Accordion.Content>
          Colors, radii and shadows all read from CSS variables, so a theme change is a handful of overrides.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="build">
        <Accordion.Trigger icon={SparkIcon}>Build pipeline</Accordion.Trigger>
        <Accordion.Content>tsup emits ESM, CJS and type declarations for every package on each build.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="a11y">
        <Accordion.Trigger icon={SparkIcon}>Accessibility</Accordion.Trigger>
        <Accordion.Content>
          Triggers expose aria-expanded and panels become labelled regions, matching the WAI-ARIA pattern.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}`,
      },
    ],
  };
};
