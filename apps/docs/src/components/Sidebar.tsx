import { useI18n } from '../lib/i18n';
import { categoryLabel } from '../lib/messages';
import { Link } from '../lib/router';
import type { ComponentDoc, NavItem } from '../lib/types';

interface SidebarProps {
  docs: ComponentDoc[];
  categories: string[];
  guides: NavItem[];
  activePath: string;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ docs, categories, guides, activePath, open, onClose }: SidebarProps) {
  const { t } = useI18n();
  const linkClass = (path: string) => (path === activePath ? 'sidebar-link is-active' : 'sidebar-link');

  return (
    <>
      <div className={open ? 'sidebar-backdrop is-open' : 'sidebar-backdrop'} onClick={onClose} />
      <aside className={open ? 'sidebar is-open' : 'sidebar'}>
        <nav onClick={onClose}>
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
                  const path = `components/${doc.slug}`;
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
