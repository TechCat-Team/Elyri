import { useState } from 'react';

import { Button, DropdownMenu } from '@elyri/ui';

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

function DropdownMenuChoiceExample() {
  const [sort, setSort] = useState('name');
  const [compact, setCompact] = useState(true);

  return (
    <div className="demo-ui-row">
      <DropdownMenu>
        <DropdownMenu.Trigger>View</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Sort by</DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenu.RadioItem value="name">Name</DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="date">Date modified</DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
          <DropdownMenu.Separator />
          <DropdownMenu.CheckboxItem checked={compact} onCheckedChange={setCompact}>
            Compact density
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu>
      <span className="demo-ui-label">
        Sort: {sort} · Compact: {compact ? 'on' : 'off'}
      </span>
    </div>
  );
}

function DropdownMenuSubExample() {
  return (
    <div className="demo-ui-row">
      <DropdownMenu>
        <DropdownMenu.Trigger>Share</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Copy link</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Invite people</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item>Email</DropdownMenu.Item>
              <DropdownMenu.Item>Slack</DropdownMenu.Item>
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger>More…</DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent>
                  <DropdownMenu.Item>Teams</DropdownMenu.Item>
                  <DropdownMenu.Item>Discord</DropdownMenu.Item>
                </DropdownMenu.SubContent>
              </DropdownMenu.Sub>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onSelect={(event) => event.preventDefault()} danger>
            Revoke access
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
}

function DropdownMenuShortcutExample() {
  const [selected, setSelected] = useState('Nothing yet');
  const pick = (label: string) => () => setSelected(label);

  return (
    <div className="demo-ui-row">
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button variant="secondary">File</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={pick('New')}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New
            <DropdownMenu.Shortcut>⌘N</DropdownMenu.Shortcut>
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={pick('Save')}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
              <path d="M17 21v-8H7v8M7 3v5h8" />
            </svg>
            Save
            <DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut>
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item danger onSelect={pick('Delete')}>
            Delete
            <DropdownMenu.Shortcut>⌫</DropdownMenu.Shortcut>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
      <span className="demo-ui-label">Selected: {selected}</span>
    </div>
  );
}

const copy = {
  zh: {
    description:
      '下拉菜单：menu / menuitem 语义，方向键与 Home / End 导航、typeahead 跳转，开合时管理焦点。支持普通 / 勾选 / 单选 / 分组 / 子菜单，以及图标与快捷键提示。',
    exBasic: '基础用法',
    exBasicDesc: '包含分组标题、可选菜单项、分隔线与禁用项，选中项显示在下方。',
    exChoice: '勾选与单选',
    exChoiceDesc: 'CheckboxItem 与 RadioGroup / RadioItem 切换后保持打开，方便连续选择。',
    exSub: '子菜单',
    exSubDesc: 'Sub / SubTrigger / SubContent 逐级展开，可用方向键或右键定位；也可让某项保持打开。',
    exShortcut: '图标、快捷键与 asChild',
    exShortcutDesc: '菜单项可带图标与右侧快捷键提示；Trigger 传 asChild 可复用 Button 等自定义触发元素。',
    descOpen: '受控开关',
    descDefaultOpen: '非受控初始开关',
    descOnOpenChange: '开关变化回调',
    descPlacement: '期望方向：top / bottom / left / right',
    descAlign: '交叉轴对齐：start / center / end',
    descOffset: '与触发元素的间距',
    descTrigger: '触发元素，方向键也可打开菜单；asChild 时合并到唯一子元素',
    descTriggerAsChild: '不渲染自带按钮，把行为合并到唯一子元素上',
    descContent: '菜单容器，role="menu"',
    descItem: '菜单项，role="menuitem"，选中后默认关闭',
    descItemSelect: '选中回调；调用 event.preventDefault() 可让菜单保持打开',
    descItemDisabled: '禁用项，不参与键盘导航',
    descDanger: '危险操作（如删除）显示为警示色',
    descCheckboxItem: '可勾选菜单项，role="menuitemcheckbox"，切换后保持打开',
    descCheckboxChecked: '受控选中态',
    descCheckboxDefaultChecked: '非受控初始选中态',
    descCheckboxChange: '选中态变化回调',
    descRadioGroup: '单选项分组，role="group"',
    descRadioValue: '受控选中值',
    descRadioDefaultValue: '非受控初始选中值',
    descRadioChange: '选中值变化回调',
    descRadioItem: '单选菜单项，role="menuitemradio"，选中后保持打开',
    descRadioItemValue: '该项的取值，与 RadioGroup 的 value 对应',
    descSub: '子菜单根组件，管理自身的展开状态',
    descSubTrigger: '子菜单触发项，带 aria-haspopup，悬停或方向键展开',
    descSubContent: '子菜单容器，默认在右侧展开',
    descGroup: '分组容器，role="group"，可配 aria-label',
    descLabel: '分组标题',
    descSeparator: '分隔线',
    descShortcut: '右侧快捷键提示，如 ⌘K',
  },
  en: {
    description:
      'Dropdown menus with menu / menuitem semantics, arrow-key and Home / End navigation, typeahead and managed focus. Supports plain, checkbox, radio, grouped and nested items, plus icons and shortcut hints.',
    exBasic: 'Basic',
    exBasicDesc: 'A group label, selectable items, a separator and a disabled item; the selection shows below.',
    exChoice: 'Checkbox and radio',
    exChoiceDesc: 'CheckboxItem and RadioGroup / RadioItem stay open after toggling, so you can pick several in a row.',
    exSub: 'Submenu',
    exSubDesc: 'Sub / SubTrigger / SubContent nest to any depth; open with arrow keys or hover, or keep an item open.',
    exShortcut: 'Icons, shortcuts and asChild',
    exShortcutDesc:
      'Items take a leading icon and a trailing shortcut hint; pass asChild to reuse a Button as the trigger.',
    descOpen: 'Controlled open state',
    descDefaultOpen: 'Initial open state when uncontrolled',
    descOnOpenChange: 'Called whenever the open state changes',
    descPlacement: 'Preferred side: top / bottom / left / right',
    descAlign: 'Cross-axis alignment: start / center / end',
    descOffset: 'Distance from the trigger',
    descTrigger: 'Trigger element; arrow keys open the menu too, asChild merges onto the only child',
    descTriggerAsChild: 'Skip the built-in button and merge behaviour onto the only child',
    descContent: 'The menu container, role="menu"',
    descItem: 'A menu item, role="menuitem", closes the menu on select',
    descItemSelect: 'Called on select; call event.preventDefault() to keep the menu open',
    descItemDisabled: 'Disabled item, skipped by keyboard navigation',
    descDanger: 'Destructive actions such as delete render in the danger colour',
    descCheckboxItem: 'A checkable item, role="menuitemcheckbox", stays open after toggling',
    descCheckboxChecked: 'Controlled checked state',
    descCheckboxDefaultChecked: 'Initial checked state when uncontrolled',
    descCheckboxChange: 'Called whenever the checked state changes',
    descRadioGroup: 'A group of radio items, role="group"',
    descRadioValue: 'Controlled selected value',
    descRadioDefaultValue: 'Initial selected value when uncontrolled',
    descRadioChange: 'Called whenever the selected value changes',
    descRadioItem: 'A radio item, role="menuitemradio", stays open after selecting',
    descRadioItemValue: 'This item value, matched against the RadioGroup value',
    descSub: 'Submenu root, manages its own open state',
    descSubTrigger: 'The submenu trigger, aria-haspopup, opens on hover or arrow keys',
    descSubContent: 'The submenu container, opens to the right by default',
    descGroup: 'A group container, role="group", accepts an aria-label',
    descLabel: 'A group label',
    descSeparator: 'A divider between groups',
    descShortcut: 'A trailing shortcut hint such as ⌘K',
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
      { name: 'Trigger.asChild', type: 'boolean', default: 'false', description: t.descTriggerAsChild },
      { name: 'DropdownMenu.Content', type: 'HTMLAttributes', description: t.descContent },
      { name: 'DropdownMenu.Item', type: 'ButtonHTMLAttributes', description: t.descItem },
      { name: 'onSelect', type: '(event) => void', description: t.descItemSelect },
      { name: 'disabled', type: 'boolean', description: t.descItemDisabled },
      { name: 'danger', type: 'boolean', description: t.descDanger },
      { name: 'DropdownMenu.CheckboxItem', type: 'ButtonHTMLAttributes', description: t.descCheckboxItem },
      { name: 'CheckboxItem.checked', type: 'boolean', description: t.descCheckboxChecked },
      {
        name: 'CheckboxItem.defaultChecked',
        type: 'boolean',
        default: 'false',
        description: t.descCheckboxDefaultChecked,
      },
      { name: 'CheckboxItem.onCheckedChange', type: '(checked: boolean) => void', description: t.descCheckboxChange },
      { name: 'DropdownMenu.RadioGroup', type: 'HTMLAttributes', description: t.descRadioGroup },
      { name: 'RadioGroup.value', type: 'string', description: t.descRadioValue },
      { name: 'RadioGroup.defaultValue', type: 'string', description: t.descRadioDefaultValue },
      { name: 'RadioGroup.onValueChange', type: '(value: string) => void', description: t.descRadioChange },
      { name: 'DropdownMenu.RadioItem', type: 'ButtonHTMLAttributes', description: t.descRadioItem },
      { name: 'RadioItem.value', type: 'string', description: t.descRadioItemValue },
      { name: 'DropdownMenu.Sub', type: 'object', description: t.descSub },
      { name: 'DropdownMenu.SubTrigger', type: 'ButtonHTMLAttributes', description: t.descSubTrigger },
      { name: 'DropdownMenu.SubContent', type: 'HTMLAttributes', description: t.descSubContent },
      { name: 'DropdownMenu.Group', type: 'HTMLAttributes', description: t.descGroup },
      { name: 'DropdownMenu.Label', type: 'HTMLAttributes', description: t.descLabel },
      { name: 'DropdownMenu.Separator', type: 'HTMLAttributes', description: t.descSeparator },
      { name: 'DropdownMenu.Shortcut', type: 'HTMLAttributes', description: t.descShortcut },
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
      {
        title: t.exChoice,
        description: t.exChoiceDesc,
        wide: true,
        render: () => <DropdownMenuChoiceExample />,
        code: `import { useState } from 'react';

import { DropdownMenu } from './components/elyri/DropdownMenu';

export function Example() {
  const [sort, setSort] = useState('name');
  const [compact, setCompact] = useState(true);

  return (
    <div className="demo-ui-row">
      <DropdownMenu>
        <DropdownMenu.Trigger>View</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Sort by</DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenu.RadioItem value="name">Name</DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="date">Date modified</DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
          <DropdownMenu.Separator />
          <DropdownMenu.CheckboxItem checked={compact} onCheckedChange={setCompact}>
            Compact density
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu>
      <span className="demo-ui-label">Sort: {sort} · Compact: {compact ? 'on' : 'off'}</span>
    </div>
  );
}`,
      },
      {
        title: t.exSub,
        description: t.exSubDesc,
        wide: true,
        render: () => <DropdownMenuSubExample />,
        code: `import { DropdownMenu } from './components/elyri/DropdownMenu';

export function Example() {
  return (
    <div className="demo-ui-row">
      <DropdownMenu>
        <DropdownMenu.Trigger>Share</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Copy link</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Invite people</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item>Email</DropdownMenu.Item>
              <DropdownMenu.Item>Slack</DropdownMenu.Item>
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger>More…</DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent>
                  <DropdownMenu.Item>Teams</DropdownMenu.Item>
                  <DropdownMenu.Item>Discord</DropdownMenu.Item>
                </DropdownMenu.SubContent>
              </DropdownMenu.Sub>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Separator />
          {/* onSelect 里 preventDefault 让菜单保持打开 */}
          <DropdownMenu.Item onSelect={(event) => event.preventDefault()} danger>
            Revoke access
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
}`,
      },
      {
        title: t.exShortcut,
        description: t.exShortcutDesc,
        wide: true,
        render: () => <DropdownMenuShortcutExample />,
        code: `import { useState } from 'react';

import { Button } from './components/elyri/Button';
import { DropdownMenu } from './components/elyri/DropdownMenu';

export function Example() {
  const [selected, setSelected] = useState('Nothing yet');
  const pick = (label: string) => () => setSelected(label);

  return (
    <div className="demo-ui-row">
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button variant="secondary">File</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={pick('New')}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New
            <DropdownMenu.Shortcut>⌘N</DropdownMenu.Shortcut>
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={pick('Save')}>
            Save
            <DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut>
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item danger onSelect={pick('Delete')}>
            Delete
            <DropdownMenu.Shortcut>⌫</DropdownMenu.Shortcut>
          </DropdownMenu.Item>
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
