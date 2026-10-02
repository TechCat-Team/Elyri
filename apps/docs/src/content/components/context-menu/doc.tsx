import { useState } from 'react';

import { ContextMenu } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

function ContextMenuBasicExample() {
  const [selected, setSelected] = useState('Nothing yet');

  return (
    <div className="demo-ui-row">
      <ContextMenu>
        <ContextMenu.Trigger className="demo-context-area">Right-click this area</ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item onSelect={() => setSelected('Duplicate')}>Duplicate</ContextMenu.Item>
          <ContextMenu.Item onSelect={() => setSelected('Rename')}>Rename</ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item onSelect={() => setSelected('Delete')} danger>
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>
      <span className="demo-ui-label">Selected: {selected}</span>
    </div>
  );
}

function ContextMenuRichExample() {
  const [sort, setSort] = useState('name');
  const [compact, setCompact] = useState(true);

  return (
    <div className="demo-ui-row">
      <ContextMenu>
        <ContextMenu.Trigger className="demo-context-area">Right-click for options</ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Label>Sort by</ContextMenu.Label>
          <ContextMenu.RadioGroup value={sort} onValueChange={setSort}>
            <ContextMenu.RadioItem value="name">Name</ContextMenu.RadioItem>
            <ContextMenu.RadioItem value="date">Date modified</ContextMenu.RadioItem>
          </ContextMenu.RadioGroup>
          <ContextMenu.Separator />
          <ContextMenu.CheckboxItem checked={compact} onCheckedChange={setCompact}>
            Compact density
          </ContextMenu.CheckboxItem>
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger>Open with</ContextMenu.SubTrigger>
            <ContextMenu.SubContent>
              <ContextMenu.Item>Editor</ContextMenu.Item>
              <ContextMenu.Item>Terminal</ContextMenu.Item>
            </ContextMenu.SubContent>
          </ContextMenu.Sub>
        </ContextMenu.Content>
      </ContextMenu>
      <span className="demo-ui-label">
        Sort: {sort} · Compact: {compact ? 'on' : 'off'}
      </span>
    </div>
  );
}

const copy = {
  zh: {
    description:
      '右键菜单：在指针位置弹出，与 DropdownMenu 共用同一套菜单逻辑与部件，同样支持勾选 / 单选 / 分组 / 子菜单与键盘导航。',
    exBasic: '基础用法',
    exBasicDesc: '在区域内点击右键，菜单在指针位置弹出；选中项显示在下方。',
    exRich: '勾选、单选与子菜单',
    exRichDesc: '与下拉菜单一致的能力：可勾选、可单选、可逐级展开子菜单。',
    descOpen: '受控开关',
    descDefaultOpen: '非受控初始开关',
    descOnOpenChange: '开关变化回调',
    descPlacement: '相对指针的期望方向：top / bottom / left / right',
    descAlign: '交叉轴对齐：start / center / end',
    descOffset: '与指针的间距',
    descTrigger: '右键触发区域；asChild 时合并到唯一子元素',
    descContent: '菜单容器，role="menu"',
    descItem: '菜单项，role="menuitem"，选中后默认关闭',
    descItemSelect: '选中回调；调用 event.preventDefault() 可让菜单保持打开',
    descCheckboxItem: '可勾选菜单项，切换后保持打开',
    descRadioGroup: '单选项分组',
    descRadioItem: '单选菜单项，选中后保持打开',
    descSub: '子菜单根组件',
    descSubTrigger: '子菜单触发项，悬停或方向键展开',
    descSubContent: '子菜单容器，默认在右侧展开',
    descGroup: '分组容器',
    descLabel: '分组标题',
    descSeparator: '分隔线',
    descShortcut: '右侧快捷键提示',
  },
  en: {
    description:
      'Context menus that open at the pointer, sharing the same menu logic and parts as DropdownMenu: checkbox, radio, groups, submenus and full keyboard navigation.',
    exBasic: 'Basic',
    exBasicDesc: 'Right-click inside the area to open the menu at the pointer; the selection shows below.',
    exRich: 'Checkbox, radio and submenu',
    exRichDesc:
      'The same capabilities as the dropdown menu: checkable items, single-select groups and nested submenus.',
    descOpen: 'Controlled open state',
    descDefaultOpen: 'Initial open state when uncontrolled',
    descOnOpenChange: 'Called whenever the open state changes',
    descPlacement: 'Preferred side relative to the pointer: top / bottom / left / right',
    descAlign: 'Cross-axis alignment: start / center / end',
    descOffset: 'Distance from the pointer',
    descTrigger: 'The right-click area; asChild merges onto the only child',
    descContent: 'The menu container, role="menu"',
    descItem: 'A menu item, role="menuitem", closes the menu on select',
    descItemSelect: 'Called on select; call event.preventDefault() to keep the menu open',
    descCheckboxItem: 'A checkable item, stays open after toggling',
    descRadioGroup: 'A group of radio items',
    descRadioItem: 'A radio item, stays open after selecting',
    descSub: 'Submenu root',
    descSubTrigger: 'The submenu trigger, opens on hover or arrow keys',
    descSubContent: 'The submenu container, opens to the right by default',
    descGroup: 'A group container',
    descLabel: 'A group label',
    descSeparator: 'A divider between groups',
    descShortcut: 'A trailing shortcut hint',
  },
};

export const contextMenuDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'context-menu',
    title: 'ContextMenu',
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
        default: "'bottom'",
        description: t.descPlacement,
      },
      { name: 'align', type: "'start' | 'center' | 'end'", default: "'start'", description: t.descAlign },
      { name: 'offset', type: 'number', default: '2', description: t.descOffset },
      { name: 'ContextMenu.Trigger', type: 'HTMLAttributes', description: t.descTrigger },
      { name: 'ContextMenu.Content', type: 'HTMLAttributes', description: t.descContent },
      { name: 'ContextMenu.Item', type: 'ButtonHTMLAttributes', description: t.descItem },
      { name: 'onSelect', type: '(event) => void', description: t.descItemSelect },
      { name: 'ContextMenu.CheckboxItem', type: 'ButtonHTMLAttributes', description: t.descCheckboxItem },
      { name: 'ContextMenu.RadioGroup', type: 'HTMLAttributes', description: t.descRadioGroup },
      { name: 'ContextMenu.RadioItem', type: 'ButtonHTMLAttributes', description: t.descRadioItem },
      { name: 'ContextMenu.Sub', type: 'object', description: t.descSub },
      { name: 'ContextMenu.SubTrigger', type: 'ButtonHTMLAttributes', description: t.descSubTrigger },
      { name: 'ContextMenu.SubContent', type: 'HTMLAttributes', description: t.descSubContent },
      { name: 'ContextMenu.Group', type: 'HTMLAttributes', description: t.descGroup },
      { name: 'ContextMenu.Label', type: 'HTMLAttributes', description: t.descLabel },
      { name: 'ContextMenu.Separator', type: 'HTMLAttributes', description: t.descSeparator },
      { name: 'ContextMenu.Shortcut', type: 'HTMLAttributes', description: t.descShortcut },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        wide: true,
        render: () => <ContextMenuBasicExample />,
        code: `import { useState } from 'react';

import { ContextMenu } from './components/elyri/ContextMenu';

export function Example() {
  const [selected, setSelected] = useState('Nothing yet');

  return (
    <div className="demo-ui-row">
      <ContextMenu>
        <ContextMenu.Trigger className="demo-context-area">Right-click this area</ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item onSelect={() => setSelected('Duplicate')}>Duplicate</ContextMenu.Item>
          <ContextMenu.Item onSelect={() => setSelected('Rename')}>Rename</ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item onSelect={() => setSelected('Delete')} danger>
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>
      <span className="demo-ui-label">Selected: {selected}</span>
    </div>
  );
}`,
      },
      {
        title: t.exRich,
        description: t.exRichDesc,
        wide: true,
        render: () => <ContextMenuRichExample />,
        code: `import { useState } from 'react';

import { ContextMenu } from './components/elyri/ContextMenu';

export function Example() {
  const [sort, setSort] = useState('name');
  const [compact, setCompact] = useState(true);

  return (
    <div className="demo-ui-row">
      <ContextMenu>
        <ContextMenu.Trigger className="demo-context-area">Right-click for options</ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Label>Sort by</ContextMenu.Label>
          <ContextMenu.RadioGroup value={sort} onValueChange={setSort}>
            <ContextMenu.RadioItem value="name">Name</ContextMenu.RadioItem>
            <ContextMenu.RadioItem value="date">Date modified</ContextMenu.RadioItem>
          </ContextMenu.RadioGroup>
          <ContextMenu.Separator />
          <ContextMenu.CheckboxItem checked={compact} onCheckedChange={setCompact}>
            Compact density
          </ContextMenu.CheckboxItem>
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger>Open with</ContextMenu.SubTrigger>
            <ContextMenu.SubContent>
              <ContextMenu.Item>Editor</ContextMenu.Item>
              <ContextMenu.Item>Terminal</ContextMenu.Item>
            </ContextMenu.SubContent>
          </ContextMenu.Sub>
        </ContextMenu.Content>
      </ContextMenu>
      <span className="demo-ui-label">Sort: {sort} · Compact: {compact ? 'on' : 'off'}</span>
    </div>
  );
}`,
      },
    ],
  };
};
