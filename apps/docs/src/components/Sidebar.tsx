import { useI18n } from '../lib/i18n';
import { categoryLabel } from '../lib/messages';
import { Link } from '../lib/router';
import { docPath } from '../lib/sections';
import type { SectionNavItem } from '../lib/sections';
import type { ComponentDoc, NavItem, Pkg } from '../lib/types';

interface SidebarProps {
  docs: ComponentDoc[];
  categories: string[];
  guides: NavItem[];
  sectionNav: SectionNavItem[];
  activeSection?: Pkg;
  activePath: string;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({
  docs,
  categories,
  guides,
  sectionNav,
  activeSection,
  activePath,
  open,
  onClose,
}: SidebarProps) {
  const { t } = useI18n();
  const linkClass = (path: string) => (path === activePath ? 'sidebar-link is-active' : 'sidebar-link');

  return (
    <>
      <div className={open ? 'sidebar-backdrop is-open' : 'sidebar-backdrop'} onClick={onClose} />
      <aside className={open ? 'sidebar is-open' : 'sidebar'}>
        <nav onClick={onClose}>
          <div className="sidebar-group section-nav">
            <p className="sidebar-group-title">{t('nav.sections')}</p>
            {sectionNav.map((section) =>
              section.id === activeSection ? (
                <span key={section.id} className="sidebar-link is-active" aria-current="page">
                  {t(section.labelKey)}
                </span>
              ) : section.path ? (
                <Link key={section.id} to={section.path} className={linkClass(section.path)}>
                  {t(section.labelKey)}
                </Link>
              ) : (
                <span key={section.id} className="sidebar-link is-disabled" title={t('section.soon')}>
                  {t(section.labelKey)}
                  <span className="new-tag">{t('section.soon')}</span>
                </span>
              ),
            )}
          </div>

          <div className="sidebar-group">
            <p className="sidebar-group-title">{t('nav.getStarted')}</p>
            {guides.map((guide) => (
              <Link key={guide.path} to={guide.path} className={linkClass(guide.path)}>
                {guide.title}
              </Link>
            ))}
          </div>

          {categories.map((category) => (
            <div key={category} className="sidebar-group">
              <p className="sidebar-group-title">{categoryLabel(category, t)}</p>
              {docs
                .filter((doc) => doc.category === category)
                .map((doc) => {
                  const path = docPath(doc);
                  return (
                    <Link key={doc.slug} to={path} className={linkClass(path)}>
                      {doc.title}
                      {doc.isNew && <span className="new-tag">New</span>}
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
