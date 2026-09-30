import { useI18n } from '../lib/i18n';
import { categoryLabel } from '../lib/messages';
import { Link } from '../lib/router';
import { docPath } from '../lib/sections';
import type { Section } from '../lib/sections';
import type { ComponentDoc, NavItem, Pkg } from '../lib/types';

interface SidebarProps {
  docs: ComponentDoc[];
  categories: string[];
  guides: NavItem[];
  sections: readonly Section[];
  sectionCounts: Record<Pkg, number>;
  /** 侧栏展示的分区：当前页所属分区，引导页则为上一次浏览的分区 */
  navSection: Section;
  /** 当前页面所属分区；引导页没有分区 */
  activeSection?: Pkg;
  activePath: string;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({
  docs,
  categories,
  guides,
  sections,
  sectionCounts,
  navSection,
  activeSection,
  activePath,
  open,
  onClose,
}: SidebarProps) {
  const { t } = useI18n();
  const linkClass = (path: string) => (path === activePath ? 'sidebar-link is-active' : 'sidebar-link');
  const count = sectionCounts[navSection.id];

  return (
    <>
      <div className={open ? 'sidebar-backdrop is-open' : 'sidebar-backdrop'} onClick={onClose} />
      <aside className={open ? 'sidebar is-open' : 'sidebar'}>
        <nav>
          {/* 窄屏抽屉里的分区切换，与宽屏顶栏的分区标签对应 */}
          <div className="sidebar-sections" role="group" aria-label={t('nav.sections')}>
            {sections.map((section) => (
              <Link
                key={section.id}
                to={section.path}
                className={section.id === activeSection ? 'sidebar-section is-active' : 'sidebar-section'}
                aria-current={section.id === activeSection ? 'true' : undefined}
                onClick={onClose}
              >
                {t(section.labelKey)}
              </Link>
            ))}
          </div>

          <div className="sidebar-group">
            <p className="sidebar-group-title">{t('nav.getStarted')}</p>
            {guides.map((guide) => (
              <Link key={guide.path} to={guide.path} className={linkClass(guide.path)} onClick={onClose}>
                {guide.title}
              </Link>
            ))}
          </div>

          <Link to={navSection.path} className={`sidebar-section-head ${linkClass(navSection.path)}`} onClick={onClose}>
            {t(navSection.labelKey)}
            <span className="sidebar-count">{count > 0 ? count : t('section.soon')}</span>
          </Link>

          {categories.map((category) => (
            <div key={category} className="sidebar-group">
              <p className="sidebar-group-title">{categoryLabel(category, t)}</p>
              {docs
                .filter((doc) => doc.category === category)
                .map((doc) => {
                  const path = docPath(doc);
                  return (
                    <Link key={doc.slug} to={path} className={linkClass(path)} onClick={onClose}>
                      {doc.title}
                      {doc.isNew && <span className="new-tag">{t('tag.new')}</span>}
                    </Link>
                  );
                })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
