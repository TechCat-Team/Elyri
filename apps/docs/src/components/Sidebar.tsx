import { useI18n } from '../lib/i18n';
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
              <a key={guide.path} href={`#/${guide.path}`} className={linkClass(guide.path)}>
                {guide.title}
              </a>
            ))}
          </div>

          {categories.map((category) => (
            <div key={category} className="sidebar-group">
              <p className="sidebar-group-title">{category}</p>
              {docs
                .filter((doc) => doc.category === category)
                .map((doc) => {
                  const path = `components/${doc.slug}`;
                  return (
                    <a key={doc.slug} href={`#/${path}`} className={linkClass(path)}>
                      {doc.title}
                      {doc.isNew && <span className="new-tag">New</span>}
                    </a>
                  );
                })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
