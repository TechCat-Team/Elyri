import { useState } from 'react';

import { DropdownMenu } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const DEFAULTS = {
  placement: 'bottom',
  align: 'start',
};

function DropdownMenuBasicExample() {
  const [selected, setSelected] = useState('Nothing yet');

  return (
    <div className="demo-ui-row">
      <DropdownMenu>
        <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Edit</DropdownMenu.Label>
          <DropdownMenu.Item onSelect={() => setSelected('Duplicate')}>Duplicate</DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => setSelected('Rename')}>Rename</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onSelect={() => setSelected('Archive')}>Archive</DropdownMenu.Item>
          <DropdownMenu.Item disabled>Delete</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
      <span className="demo-ui-label">Selected: {selected}</span>
    </div>
  );
}

const copy = {
  zh: {
    description: '下拉菜单：menu / menuitem 语义，方向键与 Home / End 导航，开合时管理焦点，选中后自动关闭。',
    exBasic: '基础用法',
    exBasicDesc: '包含分组标题、可选菜单项、分隔线与禁用项，选中项显示在下方。',
    descOpen: '受控开关',
    descDefaultOpen: '非受控初始开关',
    descOnOpenChange: '开关变化回调',
    descPlacement: '期望方向：top / bottom / left / right',
    descAlign: '交叉轴对齐：start / center / end',
    descOffset: '与触发元素的间距',
    descTrigger: '触发按钮，方向键也可打开菜单',
    descContent: '菜单容器，role="menu"',
    descItem: '菜单项，role="menuitem"，选中后关闭',
    descItemSelect: '选中回调，随后菜单关闭',
    descItemDisabled: '禁用项，不参与键盘导航',
    descLabel: '分组标题',
    descSeparator: '分隔线',
  },
  en: {
    description: 'Dropdown menus with menu / menuitem semantics, arrow-key navigation and managed focus.',
    exBasic: 'Basic',
    exBasicDesc: 'A group label, selectable items, a separator and a disabled item; the selection shows below.',
    descOpen: 'Controlled open state',
    descDefaultOpen: 'Initial open state when uncontrolled',
    descOnOpenChange: 'Called whenever the open state changes',
    descPlacement: 'Preferred side: top / bottom / left / right',
    descAlign: 'Cross-axis alignment: start / center / end',
    descOffset: 'Distance from the trigger',
    descTrigger: 'Trigger button; arrow keys open the menu too',
    descContent: 'The menu container, role="menu"',
    descItem: 'A menu item, role="menuitem", closes the menu on select',
    descItemSelect: 'Called on select, then the menu closes',
    descItemDisabled: 'Disabled item, skipped by keyboard navigation',
    descLabel: 'A group label',
    descSeparator: 'A divider between groups',
  },
};

export const dropdownMenuDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'dropdown-menu',
    title: 'DropdownMenu',
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
      { name: 'align', type: "'start' | 'center' | 'end'", default: `'${DEFAULTS.align}'`, description: t.descAlign },
      { name: 'offset', type: 'number', default: '4', description: t.descOffset },
      { name: 'DropdownMenu.Trigger', type: 'ButtonHTMLAttributes', description: t.descTrigger },
      { name: 'DropdownMenu.Content', type: 'HTMLAttributes', description: t.descContent },
      { name: 'DropdownMenu.Item', type: 'ButtonHTMLAttributes', description: t.descItem },
      { name: 'onSelect', type: '(event) => void', description: t.descItemSelect },
      { name: 'disabled', type: 'boolean', description: t.descItemDisabled },
      { name: 'DropdownMenu.Label', type: 'HTMLAttributes', description: t.descLabel },
      { name: 'DropdownMenu.Separator', type: 'HTMLAttributes', description: t.descSeparator },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        render: () => <DropdownMenuBasicExample />,
        code: `import { useState } from 'react';

import { DropdownMenu } from './components/elyri/DropdownMenu';

export function Example() {
  const [selected, setSelected] = useState('Nothing yet');

  return (
    <div className="demo-ui-row">
      <DropdownMenu>
        <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Edit</DropdownMenu.Label>
          <DropdownMenu.Item onSelect={() => setSelected('Duplicate')}>Duplicate</DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => setSelected('Rename')}>Rename</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onSelect={() => setSelected('Archive')}>Archive</DropdownMenu.Item>
          <DropdownMenu.Item disabled>Delete</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
      <span className="demo-ui-label">Selected: {selected}</span>
    </div>
  );
}`,
      },
    ],
  };
};
