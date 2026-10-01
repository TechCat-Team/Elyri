import { Tabs } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const DEFAULTS = {
  orientation: 'horizontal',
  variant: 'segmented',
};

const copy = {
  zh: {
    description: '标签页：受控 / 非受控双支持，方向键与 Home / End 导航，符合 WAI-ARIA 标签页模式。',
    exSegmented: '分段',
    exSegmentedDesc: '分段胶囊样式，选中项由滑块带动切换动画。',
    exUnderline: '下划线',
    exUnderlineDesc: '文字加下划线样式，选中项底部高亮。',
    exVertical: '纵向',
    exVerticalDesc: '垂直排列，适合侧边导航布局。',
    descValue: '受控选中值',
    descDefaultValue: '非受控初始值',
    descOnValueChange: '选中值变化回调，受控与非受控都会触发',
    descOrientation: '排列方向：horizontal / vertical',
    descVariant: '外观样式：segmented（分段胶囊）/ underline（文字加下划线），滑块带切换动画',
    descList: '标签栏，承接方向键导航',
    descTrigger: '单个标签，value 与面板对应',
    descPanel: '面板，始终留在 DOM 中，仅隐藏未选中的',
    descRest: '其余属性透传给原生 div',
  },
  en: {
    description: 'Tabs with controlled and uncontrolled modes, arrow-key navigation and the WAI-ARIA tabs pattern.',
    exSegmented: 'Segmented',
    exSegmentedDesc: 'The pill style; an animated indicator carries the selected tab.',
    exUnderline: 'Underline',
    exUnderlineDesc: 'Text with an underline that highlights the selected tab.',
    exVertical: 'Vertical',
    exVerticalDesc: 'A vertical layout, handy for side navigation.',
    descValue: 'Controlled selected value',
    descDefaultValue: 'Initial value when uncontrolled',
    descOnValueChange: 'Called on every change, controlled or not',
    descOrientation: 'Layout direction: horizontal / vertical',
    descVariant: 'Appearance: segmented (pill) or underline (text with an underline); the indicator animates',
    descList: 'The tab strip that handles arrow-key navigation',
    descTrigger: 'A single tab; its value maps to a panel',
    descPanel: 'Panel kept in the DOM, only the inactive ones are hidden',
    descRest: 'Remaining props are forwarded to the native div',
  },
};

export const tabsDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'tabs',
    title: 'Tabs',
    category: 'Navigation',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      { name: 'value', type: 'string', description: t.descValue },
      { name: 'defaultValue', type: 'string', description: t.descDefaultValue },
      { name: 'onValueChange', type: '(value: string) => void', description: t.descOnValueChange },
      {
        name: 'orientation',
        type: "'horizontal' | 'vertical'",
        default: `'${DEFAULTS.orientation}'`,
        description: t.descOrientation,
      },
      {
        name: 'variant',
        type: "'segmented' | 'underline'",
        default: `'${DEFAULTS.variant}'`,
        description: t.descVariant,
      },
      { name: 'Tabs.List', type: 'HTMLAttributes<HTMLDivElement>', description: t.descList },
      { name: 'Tabs.Trigger', type: '{ value: string } & ButtonHTMLAttributes', description: t.descTrigger },
      { name: 'Tabs.Panel', type: '{ value: string } & HTMLAttributes', description: t.descPanel },
      { name: '...rest', type: 'HTMLAttributes', description: t.descRest },
    ],
    examples: [
      {
        title: t.exSegmented,
        description: t.exSegmentedDesc,
        wide: true,
        render: () => (
          <Tabs defaultValue="overview" variant="segmented" className="demo-ui-tabs">
            <Tabs.List>
              <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
              <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
              <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Panel value="overview">Tabs keep every panel mounted and only hide the inactive ones.</Tabs.Panel>
            <Tabs.Panel value="activity">Recent activity shows up here.</Tabs.Panel>
            <Tabs.Panel value="settings">Preferences live in this panel.</Tabs.Panel>
          </Tabs>
        ),
        code: `import { Tabs } from './components/elyri/Tabs';

export function Example() {
  return (
    <Tabs defaultValue="overview" variant="segmented" className="demo-ui-tabs">
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="overview">Tabs keep every panel mounted and only hide the inactive ones.</Tabs.Panel>
      <Tabs.Panel value="activity">Recent activity shows up here.</Tabs.Panel>
      <Tabs.Panel value="settings">Preferences live in this panel.</Tabs.Panel>
    </Tabs>
  );
}`,
      },
      {
        title: t.exUnderline,
        description: t.exUnderlineDesc,
        wide: true,
        render: () => (
          <Tabs defaultValue="overview" variant="underline" className="demo-ui-tabs">
            <Tabs.List>
              <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
              <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
              <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Panel value="overview">Tabs keep every panel mounted and only hide the inactive ones.</Tabs.Panel>
            <Tabs.Panel value="activity">Recent activity shows up here.</Tabs.Panel>
            <Tabs.Panel value="settings">Preferences live in this panel.</Tabs.Panel>
          </Tabs>
        ),
        code: `import { Tabs } from './components/elyri/Tabs';

export function Example() {
  return (
    <Tabs defaultValue="overview" variant="underline" className="demo-ui-tabs">
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="overview">Tabs keep every panel mounted and only hide the inactive ones.</Tabs.Panel>
      <Tabs.Panel value="activity">Recent activity shows up here.</Tabs.Panel>
      <Tabs.Panel value="settings">Preferences live in this panel.</Tabs.Panel>
    </Tabs>
  );
}`,
      },
      {
        title: t.exVertical,
        description: t.exVerticalDesc,
        wide: true,
        render: () => (
          <Tabs defaultValue="overview" orientation="vertical" className="demo-ui-tabs">
            <Tabs.List>
              <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
              <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
              <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Panel value="overview">Tabs keep every panel mounted and only hide the inactive ones.</Tabs.Panel>
            <Tabs.Panel value="activity">Recent activity shows up here.</Tabs.Panel>
            <Tabs.Panel value="settings">Preferences live in this panel.</Tabs.Panel>
          </Tabs>
        ),
        code: `import { Tabs } from './components/elyri/Tabs';

export function Example() {
  return (
    <Tabs defaultValue="overview" orientation="vertical" className="demo-ui-tabs">
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="overview">Tabs keep every panel mounted and only hide the inactive ones.</Tabs.Panel>
      <Tabs.Panel value="activity">Recent activity shows up here.</Tabs.Panel>
      <Tabs.Panel value="settings">Preferences live in this panel.</Tabs.Panel>
    </Tabs>
  );
}`,
      },
    ],
  };
};
