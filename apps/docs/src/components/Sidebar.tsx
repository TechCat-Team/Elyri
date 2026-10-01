import type { ReactNode } from 'react';

import { useI18n } from '../lib/i18n';
import { Link } from '../lib/router';

export interface SidebarLink {
  path: string;
  title: string;
  badge?: ReactNode;
}

export interface SidebarGroup {
  title?: string;
  items: SidebarLink[];
}

/** 顶层导航（文档 + 各组件分区），窄屏抽屉顶部用它切换 */
export interface SidebarTab {
  key: string;
  path: string;
  label: string;
}

interface SidebarProps {
  tabs: SidebarTab[];
  activeTab?: string;
  /** 分组标题之上的总标题，例如分区名，点击回到分区落地页 */
  head?: SidebarLink;
  groups: SidebarGroup[];
  activePath: string;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ tabs, activeTab, head, groups, activePath, open, onClose }: SidebarProps) {
  const { t } = useI18n();
  const linkClass = (path: string) => (path === activePath ? 'sidebar-link is-active' : 'sidebar-link');

  return (
    <>
      <div className={open ? 'sidebar-backdrop is-open' : 'sidebar-backdrop'} onClick={onClose} />
      <aside className={open ? 'sidebar is-open' : 'sidebar'}>
        <nav>
          {/* 窄屏抽屉里的顶层切换，与宽屏顶栏的导航对应 */}
          <div className="sidebar-sections" role="group" aria-label={t('nav.sections')}>
            {tabs.map((tab) => (
              <Link
                key={tab.key}
                to={tab.path}
                className={tab.key === activeTab ? 'sidebar-section is-active' : 'sidebar-section'}
                aria-current={tab.key === activeTab ? 'true' : undefined}
                onClick={onClose}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {head && (
            <Link to={head.path} className={`sidebar-section-head ${linkClass(head.path)}`} onClick={onClose}>
              {head.title}
              {head.badge}
            </Link>
          )}

          {groups.map((group, index) => (
            <div key={group.title ?? index} className="sidebar-group">
              {group.title && <p className="sidebar-group-title">{group.title}</p>}
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={linkClass(item.path)}
                  aria-current={item.path === activePath ? 'page' : undefined}
                  onClick={onClose}
                >
                  {item.title}
                  {item.badge}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
