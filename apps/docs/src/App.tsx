import { useEffect, useMemo, useState } from 'react';

import { Header } from './components/Header';
import { SearchDialog } from './components/SearchDialog';
import { Sidebar } from './components/Sidebar';
import { guides } from './content/guides';
import { getCategories, getDocs, getSectionNav } from './content/registry';
import { useDocumentHead } from './lib/hooks/useDocumentHead';
import { useTheme } from './lib/hooks/useTheme';
import { useI18n } from './lib/i18n';
import { pageMeta } from './lib/meta';
import { useRoute } from './lib/router';
import { docPkg, sectionByPath } from './lib/sections';
import { ComponentPage } from './pages/ComponentPage';

export function App() {
  const { lang, path, to } = useRoute();
  const { t } = useI18n();
  const { toggle: toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const docs = useMemo(() => getDocs(lang), [lang]);
  const sectionNav = useMemo(() => getSectionNav(lang), [lang]);
  const section = sectionByPath(path);
  // 侧栏只列当前分区的组件；引导页不属于任何分区，展示全部
  const sectionDocs = useMemo(
    () => (section ? docs.filter((doc) => docPkg(doc) === section.id) : docs),
    [docs, section],
  );
  const categories = useMemo(() => getCategories(sectionDocs), [sectionDocs]);
  // 按侧边栏顺序排列，便于上一个 / 下一个导航
  const ordered = useMemo(
    () => categories.flatMap((category) => sectionDocs.filter((doc) => doc.category === category)),
    [categories, sectionDocs],
  );
  const navItems = useMemo(() => guides.map((guide) => ({ path: guide.path, title: t(guide.titleKey) })), [t]);
  const meta = useMemo(() => pageMeta(lang, path), [lang, path]);

  useDocumentHead(lang, meta);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const slug = section && path.length > section.path.length ? path.slice(section.path.length + 1) : null;
  const index = slug ? ordered.findIndex((doc) => doc.slug === slug) : -1;
  const guide = guides.find((item) => item.path === path);

  let page;
  if (index >= 0) {
    const doc = ordered[index];
    page = <ComponentPage key={doc.slug} doc={doc} prev={ordered[index - 1]} next={ordered[index + 1]} />;
  } else if (guide) {
    page = <guide.Component docs={docs} />;
  } else {
    page = (
      <article className="doc-page">
        <h1 className="page-title">404</h1>
        <p className="page-description">{t('page.notFoundHint')}</p>
        <a className="primary-button" href={to(lang, '')}>
          {t('page.backHome')}
        </a>
      </article>
    );
  }

  return (
    <div className="docs">
      <Header
        sectionNav={sectionNav}
        activeSection={section?.id}
        onToggleTheme={toggleTheme}
        onOpenSearch={() => setSearchOpen(true)}
        onToggleMenu={() => setMenuOpen((open) => !open)}
      />
      <div className="docs-body">
        <Sidebar
          docs={ordered}
          categories={categories}
          guides={navItems}
          sectionNav={sectionNav}
          activeSection={section?.id}
          activePath={path}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
        <main className="docs-main">{page}</main>
      </div>
      {searchOpen && <SearchDialog docs={ordered} onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
