import { useState } from 'react';

import { Sidebar, SidebarProvider, useSidebar } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const iconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const LogoIcon = () => (
  <svg {...iconProps} width={20} height={20}>
    <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" />
    <path d="M12 12v9M12 12l8-4.5M12 12 4 7.5" />
  </svg>
);

const HomeIcon = () => (
  <svg {...iconProps}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
);

const FolderIcon = () => (
  <svg {...iconProps}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
  </svg>
);

const InboxIcon = () => (
  <svg {...iconProps}>
    <path d="M3 13h5l1.5 2.5h5L16 13h5" />
    <path d="M3 13 5.5 5h13L21 13v6H3Z" />
  </svg>
);

const CogIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.2 4.2l2.2 2.2M17.6 17.6l2.2 2.2M2 12h3M19 12h3M4.2 19.8l2.2-2.2M17.6 6.4l2.2-2.2" />
  </svg>
);

const CardIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18M7 15h3" />
  </svg>
);

const UsersIcon = () => (
  <svg {...iconProps}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <path d="M16 6.5a3 3 0 0 1 0 5.8M17.5 20a6 6 0 0 0-2-4.5" />
  </svg>
);

const BookIcon = () => (
  <svg {...iconProps}>
    <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2Z" />
    <path d="M4 19a2 2 0 0 0 2 2h12" />
  </svg>
);

const CodeIcon = () => (
  <svg {...iconProps}>
    <path d="m9 8-4 4 4 4M15 8l4 4-4 4" />
  </svg>
);

function BasicExample() {
  const [active, setActive] = useState('home');

  return (
    <div className="demo-ui-sidebar">
      <Sidebar active={active} onActiveChange={setActive} aria-label="示例侧边栏">
        <Sidebar.Header>
          <span className="demo-ui-sidebar-brand">
            <LogoIcon />
            Elyri
          </span>
          <Sidebar.Trigger />
        </Sidebar.Header>
        <Sidebar.Content>
          <Sidebar.Group label="工作区">
            <Sidebar.Item value="home" icon={<HomeIcon />}>
              概览
            </Sidebar.Item>
            <Sidebar.Item value="projects" icon={<FolderIcon />} badge={3}>
              项目
            </Sidebar.Item>
            <Sidebar.Item value="inbox" icon={<InboxIcon />} badge="New">
              收件箱
            </Sidebar.Item>
          </Sidebar.Group>
          <Sidebar.Separator />
          <Sidebar.Group label="账户">
            <Sidebar.Item value="settings" icon={<CogIcon />}>
              设置
            </Sidebar.Item>
            <Sidebar.Item value="billing" icon={<CardIcon />} disabled>
              账单
            </Sidebar.Item>
          </Sidebar.Group>
        </Sidebar.Content>
        <Sidebar.Footer>
          <span className="demo-ui-sidebar-brand">Ada Lovelace</span>
        </Sidebar.Footer>
      </Sidebar>
      <div className="demo-ui-sidebar-main">当前页面：{active}</div>
    </div>
  );
}

function CollapsedExample() {
  return (
    <div className="demo-ui-sidebar">
      <Sidebar defaultActive="projects" aria-label="示例侧边栏">
        <Sidebar.Header>
          <span className="demo-ui-sidebar-brand">
            <LogoIcon />
            Elyri
          </span>
          <Sidebar.Trigger />
        </Sidebar.Header>
        <Sidebar.Content>
          <Sidebar.Group label="工作区" icon={<FolderIcon />}>
            <Sidebar.Item value="home" icon={<HomeIcon />}>
              概览
            </Sidebar.Item>
            <Sidebar.Item value="projects" icon={<FolderIcon />} badge={3}>
              项目
            </Sidebar.Item>
            <Sidebar.Item value="inbox" icon={<InboxIcon />}>
              收件箱
            </Sidebar.Item>
          </Sidebar.Group>
        </Sidebar.Content>
      </Sidebar>
      <div className="demo-ui-sidebar-main">点击标题栏右侧的按钮折叠为图标栏</div>
    </div>
  );
}

function NestedExample() {
  return (
    <div className="demo-ui-sidebar">
      <Sidebar defaultActive="alpha" aria-label="示例侧边栏">
        <Sidebar.Content>
          <Sidebar.Group label="项目">
            <Sidebar.Item value="all" icon={<FolderIcon />}>
              全部项目
            </Sidebar.Item>
            <Sidebar.Item value="team" icon={<UsersIcon />}>
              团队空间
              <Sidebar.Sub>
                <Sidebar.SubItem value="alpha">Alpha</Sidebar.SubItem>
                <Sidebar.SubItem value="beta">Beta</Sidebar.SubItem>
                <Sidebar.SubItem value="gamma" badge={2}>
                  Gamma
                </Sidebar.SubItem>
              </Sidebar.Sub>
            </Sidebar.Item>
          </Sidebar.Group>
        </Sidebar.Content>
      </Sidebar>
      <div className="demo-ui-sidebar-main">子级含激活项时，父级会自动展开</div>
    </div>
  );
}

function AsChildExample() {
  return (
    <div className="demo-ui-sidebar">
      <Sidebar defaultActive="docs" aria-label="示例侧边栏">
        <Sidebar.Content>
          <Sidebar.Group label="资源">
            <Sidebar.Item value="docs" asChild icon={<BookIcon />} badge="9">
              <a href="#docs">文档</a>
            </Sidebar.Item>
            <Sidebar.Item value="api" asChild icon={<CodeIcon />}>
              <a href="#api">API 参考</a>
            </Sidebar.Item>
          </Sidebar.Group>
        </Sidebar.Content>
      </Sidebar>
      <div className="demo-ui-sidebar-main">asChild 把行为合并到 &lt;a&gt; 或路由的 Link 上</div>
    </div>
  );
}

/** 顶部导航栏里的按钮：位于 <Sidebar> 外部，靠 useSidebar() 控制折叠 */
function TopbarToggle() {
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <button type="button" className="demo-ui-sidebar-toggle" onClick={toggleCollapsed}>
      {collapsed ? '展开菜单' : '收起菜单'}
    </button>
  );
}

function ProviderExample() {
  return (
    <SidebarProvider defaultActive="home">
      <div className="demo-ui-sidebar-shell">
        <header className="demo-ui-sidebar-topbar">
          <span className="demo-ui-sidebar-brand">
            <LogoIcon />
            Elyri
          </span>
          <TopbarToggle />
        </header>
        <div className="demo-ui-sidebar">
          <Sidebar aria-label="示例侧边栏">
            <Sidebar.Content>
              <Sidebar.Group label="工作区">
                <Sidebar.Item value="home" icon={<HomeIcon />}>
                  概览
                </Sidebar.Item>
                <Sidebar.Item value="projects" icon={<FolderIcon />} badge={3}>
                  项目
                </Sidebar.Item>
                <Sidebar.Item value="inbox" icon={<InboxIcon />}>
                  收件箱
                </Sidebar.Item>
              </Sidebar.Group>
            </Sidebar.Content>
          </Sidebar>
          <div className="demo-ui-sidebar-main">点击顶栏右侧按钮折叠 / 展开侧边栏</div>
        </div>
      </div>
    </SidebarProvider>
  );
}

const copy = {
  zh: {
    description:
      '侧边栏：可折叠为图标栏的应用导航，支持分组、二级嵌套、激活态与徽标。折叠时标签在视觉上隐藏但仍留在 DOM，读屏器可读；含 WAI-ARIA 的 aria-current / aria-expanded 语义。',
    exBasic: '基础用法',
    exBasicDesc: '顶栏 + 分组导航 + 底栏，项带图标、徽标与禁用态；受控 active 同步显示在右侧内容区。',
    exCollapsed: '折叠为图标栏',
    exCollapsedDesc: '点击标题栏的 Trigger 在完整宽度与图标栏之间切换，带宽度过渡动画。',
    exNested: '分组与嵌套项',
    exNestedDesc: 'Item 内嵌 Sub / SubItem 形成二级导航，子级激活时父级自动展开，可用方向键展开收起。',
    exAsChild: 'asChild 接入路由',
    exAsChildDesc: 'Item 传 asChild 时把行为合并到唯一子元素上，可换成 react-router 的 Link 等。',
    descCollapsed: '受控折叠态',
    descDefaultCollapsed: '非受控初始折叠态',
    descOnCollapsedChange: '折叠态变化回调',
    descCollapsible: '是否允许折叠，为 false 时 Trigger 禁用',
    descActive: '受控激活项 value',
    descDefaultActive: '非受控初始激活项 value',
    descOnActiveChange: '激活项变化回调，受控与非受控都会触发',
    descHeader: '顶部区域，折叠时只保留 Trigger',
    descContent: '导航主体，可滚动，默认渲染为 <nav>',
    descGroup: '分组容器，可配 label 与 icon',
    descGroupLabel: '分组标题，折叠时隐藏',
    descGroupIcon: '分组图标，折叠时保留',
    descItem: '导航项；含 Sub 时变为可展开的父项',
    descItemValue: '唯一值，与根组件的 active 对应',
    descItemIcon: '前置图标',
    descItemBadge: '右侧徽标 / 计数',
    descItemActive: '显式指定激活态，覆盖 root 的 active 匹配',
    descItemDisabled: '禁用后不可点击，也不参与激活',
    descItemHref: '渲染为 <a> 链接',
    descItemAsChild: '把行为合并到唯一子元素（如路由 Link）上，仅用于叶子项',
    descSub: '子级导航容器，展开态由父级 Item 注入',
    descSubItem: '二级导航项，属性与 Item 一致',
    descSeparator: '分隔线',
    descFooter: '底部区域，折叠时只保留 Trigger',
    descTrigger: '折叠开关，切换 collapsed',
    descTriggerAsChild: '不渲染自带按钮，把行为合并到唯一子元素上',
    descExpandLabel: '折叠时按钮的无障碍名称',
    descCollapseLabel: '展开时按钮的无障碍名称',
    exProvider: '外部按钮控制',
    exProviderDesc:
      '外层包一个 SidebarProvider 把折叠状态提升出来，顶部导航栏里的按钮调用 useSidebar() 即可折叠 / 展开侧边栏。',
    descProvider:
      '把折叠、激活状态提升到 Sidebar 之外，供顶部导航栏等外部按钮共享；状态相关 props 与 Sidebar 一致',
    descUseSidebar:
      '读取 collapsed / active 并提供 toggleCollapsed，可在 Sidebar 或 SidebarProvider 内调用',
  },
  en: {
    description:
      'A collapsible sidebar for app navigation with groups, nested items, active states and badges. When collapsed the labels are visually hidden but stay in the DOM for screen readers, with aria-current / aria-expanded semantics.',
    exBasic: 'Basic',
    exBasicDesc:
      'Header, grouped navigation and footer, with icons, badges and a disabled item; the controlled active value shows in the content area.',
    exCollapsed: 'Collapse to icon rail',
    exCollapsedDesc: 'The Trigger in the header toggles between full width and an icon rail with an animated width.',
    exNested: 'Groups and nested items',
    exNestedDesc:
      'Nest Sub / SubItem inside an Item for second-level navigation; the parent opens automatically when a child is active and responds to arrow keys.',
    exAsChild: 'asChild with a router',
    exAsChildDesc: 'With asChild the behaviour merges onto the only child, so you can drop in a react-router Link.',
    descCollapsed: 'Controlled collapsed state',
    descDefaultCollapsed: 'Initial collapsed state when uncontrolled',
    descOnCollapsedChange: 'Called whenever the collapsed state changes',
    descCollapsible: 'Whether collapsing is allowed; the Trigger is disabled when false',
    descActive: 'Controlled active value',
    descDefaultActive: 'Initial active value when uncontrolled',
    descOnActiveChange: 'Called on every active change, controlled or not',
    descHeader: 'Top area; only the Trigger remains when collapsed',
    descContent: 'The scrollable navigation body, rendered as <nav>',
    descGroup: 'A group container with an optional label and icon',
    descGroupLabel: 'Group label, hidden when collapsed',
    descGroupIcon: 'Group icon, kept when collapsed',
    descItem: 'A nav item; becomes an expandable parent when it contains a Sub',
    descItemValue: 'Unique value matched against the active value on the root',
    descItemIcon: 'Leading icon',
    descItemBadge: 'Trailing badge or count',
    descItemActive: 'Force the active state, overriding the root active match',
    descItemDisabled: 'Disabled items cannot be activated',
    descItemHref: 'Render as an <a> link',
    descItemAsChild: 'Merge behaviour onto the only child (e.g. a router Link); leaf items only',
    descSub: 'The sub-navigation container; its open state comes from the parent Item',
    descSubItem: 'A second-level item with the same props as Item',
    descSeparator: 'A divider',
    descFooter: 'Bottom area; only the Trigger remains when collapsed',
    descTrigger: 'The collapse toggle that flips collapsed',
    descTriggerAsChild: 'Skip the built-in button and merge behaviour onto the only child',
    descExpandLabel: 'Accessible name of the button while collapsed',
    descCollapseLabel: 'Accessible name of the button while expanded',
    exProvider: 'External trigger',
    exProviderDesc:
      'Wrap the shell in SidebarProvider to lift the state out, then a button in the top bar calls useSidebar() to collapse or expand the sidebar.',
    descProvider:
      'Lifts the collapse and active state outside Sidebar so external buttons such as a top bar can share it; takes the same state props as Sidebar',
    descUseSidebar:
      'Reads collapsed / active and exposes toggleCollapsed; callable inside Sidebar or SidebarProvider',
  },
};

export const sidebarDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'sidebar',
    title: 'Sidebar',
    category: 'Navigation',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      { name: 'collapsed', type: 'boolean', description: t.descCollapsed },
      { name: 'defaultCollapsed', type: 'boolean', default: 'false', description: t.descDefaultCollapsed },
      { name: 'onCollapsedChange', type: '(collapsed: boolean) => void', description: t.descOnCollapsedChange },
      { name: 'collapsible', type: 'boolean', default: 'true', description: t.descCollapsible },
      { name: 'active', type: 'string', description: t.descActive },
      { name: 'defaultActive', type: 'string', default: "''", description: t.descDefaultActive },
      { name: 'onActiveChange', type: '(value: string) => void', description: t.descOnActiveChange },
      { name: 'SidebarProvider', type: 'component', description: t.descProvider },
      { name: 'useSidebar()', type: 'hook', description: t.descUseSidebar },
      { name: 'Sidebar.Header', type: 'HTMLAttributes', description: t.descHeader },
      { name: 'Sidebar.Content', type: 'HTMLAttributes', description: t.descContent },
      { name: 'Sidebar.Group', type: 'HTMLAttributes', description: t.descGroup },
      { name: 'Group.label', type: 'ReactNode', description: t.descGroupLabel },
      { name: 'Group.icon', type: 'ReactNode', description: t.descGroupIcon },
      { name: 'Sidebar.Item', type: 'HTMLAttributes', description: t.descItem },
      { name: 'Item.value', type: 'string', description: t.descItemValue },
      { name: 'Item.icon', type: 'ReactNode', description: t.descItemIcon },
      { name: 'Item.badge', type: 'ReactNode', description: t.descItemBadge },
      { name: 'Item.active', type: 'boolean', description: t.descItemActive },
      { name: 'Item.disabled', type: 'boolean', description: t.descItemDisabled },
      { name: 'Item.href', type: 'string', description: t.descItemHref },
      { name: 'Item.asChild', type: 'boolean', default: 'false', description: t.descItemAsChild },
      { name: 'Sidebar.Sub', type: 'HTMLAttributes', description: t.descSub },
      { name: 'Sidebar.SubItem', type: 'HTMLAttributes', description: t.descSubItem },
      { name: 'Sidebar.Separator', type: 'HTMLAttributes', description: t.descSeparator },
      { name: 'Sidebar.Footer', type: 'HTMLAttributes', description: t.descFooter },
      { name: 'Sidebar.Trigger', type: 'HTMLAttributes', description: t.descTrigger },
      { name: 'Trigger.asChild', type: 'boolean', default: 'false', description: t.descTriggerAsChild },
      { name: 'Trigger.expandLabel', type: 'string', description: t.descExpandLabel },
      { name: 'Trigger.collapseLabel', type: 'string', description: t.descCollapseLabel },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        wide: true,
        render: () => <BasicExample />,
        code: `import { useState } from 'react';

import { Sidebar } from './components/elyri/Sidebar';

// 图标组件此处省略，可换成任意图标库
export function Example() {
  const [active, setActive] = useState('home');

  return (
    <Sidebar active={active} onActiveChange={setActive} aria-label="主导航">
      <Sidebar.Header>
        <span className="brand">Elyri</span>
        <Sidebar.Trigger />
      </Sidebar.Header>

      <Sidebar.Content>
        <Sidebar.Group label="工作区">
          <Sidebar.Item value="home" icon={<HomeIcon />}>概览</Sidebar.Item>
          <Sidebar.Item value="projects" icon={<FolderIcon />} badge={3}>项目</Sidebar.Item>
          <Sidebar.Item value="inbox" icon={<InboxIcon />} badge="New">收件箱</Sidebar.Item>
        </Sidebar.Group>
        <Sidebar.Separator />
        <Sidebar.Group label="账户">
          <Sidebar.Item value="settings" icon={<CogIcon />}>设置</Sidebar.Item>
          <Sidebar.Item value="billing" icon={<CardIcon />} disabled>账单</Sidebar.Item>
        </Sidebar.Group>
      </Sidebar.Content>

      <Sidebar.Footer>
        <span className="brand">Ada Lovelace</span>
      </Sidebar.Footer>
    </Sidebar>
  );
}`,
      },
      {
        title: t.exCollapsed,
        description: t.exCollapsedDesc,
        wide: true,
        render: () => <CollapsedExample />,
        code: `import { Sidebar } from './components/elyri/Sidebar';

export function Example() {
  return (
    <Sidebar defaultActive="projects" aria-label="主导航">
      <Sidebar.Header>
        <span className="brand">Elyri</span>
        <Sidebar.Trigger />
      </Sidebar.Header>

      <Sidebar.Content>
        {/* 分组带图标，折叠成图标栏后仍能看到分组语义 */}
        <Sidebar.Group label="工作区" icon={<FolderIcon />}>
          <Sidebar.Item value="home" icon={<HomeIcon />}>概览</Sidebar.Item>
          <Sidebar.Item value="projects" icon={<FolderIcon />} badge={3}>项目</Sidebar.Item>
          <Sidebar.Item value="inbox" icon={<InboxIcon />}>收件箱</Sidebar.Item>
        </Sidebar.Group>
      </Sidebar.Content>
    </Sidebar>
  );
}`,
      },
      {
        title: t.exNested,
        description: t.exNestedDesc,
        wide: true,
        render: () => <NestedExample />,
        code: `import { Sidebar } from './components/elyri/Sidebar';

export function Example() {
  return (
    <Sidebar defaultActive="alpha" aria-label="主导航">
      <Sidebar.Content>
        <Sidebar.Group label="项目">
          <Sidebar.Item value="all" icon={<FolderIcon />}>全部项目</Sidebar.Item>
          <Sidebar.Item value="team" icon={<UsersIcon />}>
            团队空间
            <Sidebar.Sub>
              <Sidebar.SubItem value="alpha">Alpha</Sidebar.SubItem>
              <Sidebar.SubItem value="beta">Beta</Sidebar.SubItem>
              <Sidebar.SubItem value="gamma" badge={2}>Gamma</Sidebar.SubItem>
            </Sidebar.Sub>
          </Sidebar.Item>
        </Sidebar.Group>
      </Sidebar.Content>
    </Sidebar>
  );
}`,
      },
      {
        title: t.exAsChild,
        description: t.exAsChildDesc,
        wide: true,
        render: () => <AsChildExample />,
        code: `import { Link } from 'react-router-dom';

import { Sidebar } from './components/elyri/Sidebar';

export function Example() {
  return (
    <Sidebar defaultActive="docs" aria-label="主导航">
      <Sidebar.Content>
        <Sidebar.Group label="资源">
          <Sidebar.Item value="docs" asChild icon={<BookIcon />} badge="9">
            <Link to="/docs">文档</Link>
          </Sidebar.Item>
          <Sidebar.Item value="api" asChild icon={<CodeIcon />}>
            <Link to="/api">API 参考</Link>
          </Sidebar.Item>
        </Sidebar.Group>
      </Sidebar.Content>
    </Sidebar>
  );
}`,
      },
      {
        title: t.exProvider,
        description: t.exProviderDesc,
        wide: true,
        render: () => <ProviderExample />,
        code: `import { Sidebar, SidebarProvider, useSidebar } from './components/elyri/Sidebar';

// 顶部导航栏里的按钮，位于 Sidebar 外部
function TopbarToggle() {
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <button type="button" onClick={toggleCollapsed}>
      {collapsed ? '展开菜单' : '收起菜单'}
    </button>
  );
}

export function Example() {
  return (
    <SidebarProvider defaultActive="home">
      <header className="topbar">
        <span className="brand">Elyri</span>
        <TopbarToggle />
      </header>

      <div className="shell">
        <Sidebar aria-label="主导航">
          <Sidebar.Content>
            <Sidebar.Group label="工作区">
              <Sidebar.Item value="home" icon={<HomeIcon />}>概览</Sidebar.Item>
              <Sidebar.Item value="projects" icon={<FolderIcon />} badge={3}>项目</Sidebar.Item>
              <Sidebar.Item value="inbox" icon={<InboxIcon />}>收件箱</Sidebar.Item>
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar>
        <main className="shell-main">当前页面</main>
      </div>
    </SidebarProvider>
  );
}`,
      },
    ],
  };
};
