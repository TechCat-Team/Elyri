import { useEffect, useMemo, useState } from 'react';

import { Header } from './components/Header';
import { SearchDialog } from './components/SearchDialog';
import { Sidebar } from './components/Sidebar';
import { guides } from './content/guides';
import { getCategories, getDocs } from './content/registry';
import { useHashRoute } from './lib/hooks/useHashRoute';
import { useTheme } from './lib/hooks/useTheme';
import { useI18n } from './lib/i18n';
import { ComponentPage } from './pages/ComponentPage';

export function App() {
  const path = useHashRoute();
  const { lang, t } = useI18n();
  const { theme, toggle: toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const docs = useMemo(() => getDocs(lang), [lang]);
  const categories = useMemo(() => getCategories(docs), [docs]);
  // 按侧边栏顺序排列，便于上一个 / 下一个导航
  const ordered = useMemo(
    () => categories.flatMap((category) => docs.filter((doc) => doc.category === category)),
    [categories, docs],
  );
  const navItems = useMemo(() => guides.map((guide) => ({ path: guide.path, title: t(guide.titleKey) })), [t]);

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

  const slug = path.startsWith('components/') ? path.slice('components/'.length) : null;
  const index = ordered.findIndex((doc) => doc.slug === slug);
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
        <a className="primary-button" href="#/">
          {t('page.backHome')}
        </a>
      </article>
    );
  }

  return (
    <div className="docs">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSearch={() => setSearchOpen(true)}
        onToggleMenu={() => setMenuOpen((open) => !open)}
      />
      <div className="docs-body">
        <Sidebar
          docs={ordered}
          categories={categories}
          guides={navItems}
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
