import { useEffect, useMemo, useState } from 'react';

import { Header } from './components/Header';
import { SearchDialog } from './components/SearchDialog';
import { Sidebar } from './components/Sidebar';
import { guides } from './content/guides';
import { getCategories, getDocs, getSectionDocs } from './content/registry';
import { useDocumentHead } from './lib/hooks/useDocumentHead';
import { useTheme } from './lib/hooks/useTheme';
import { useI18n } from './lib/i18n';
import { pageMeta } from './lib/meta';
import { useRoute } from './lib/router';
import { sectionById, sectionByPath, sections } from './lib/sections';
import type { ComponentDoc, Pkg } from './lib/types';
import { ComponentPage } from './pages/ComponentPage';
import { SectionPage } from './pages/SectionPage';

/** 按侧栏顺序（分类首次出现顺序）排列组件 */
const orderByCategory = (docs: ComponentDoc[]) =>
  getCategories(docs).flatMap((category) => docs.filter((doc) => doc.category === category));

/** 与窄屏抽屉断点保持一致（shell.css） */
const DRAWER_QUERY = '(max-width: 900px)';

export function App() {
  const { lang, path, to } = useRoute();
  const { t } = useI18n();
  const { toggle: toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const docs = useMemo(() => getDocs(lang), [lang]);
  const section = sectionByPath(path);

  // 引导页不属于任何分区，侧栏沿用上一次浏览的分区，避免内容突变
  const [lastSection, setLastSection] = useState<Pkg>('motion');
  if (section && section.id !== lastSection) setLastSection(section.id);
  const navSection = section ?? sectionById(lastSection);

  const ordered = useMemo(() => orderByCategory(getSectionDocs(lang, navSection.id, docs)), [docs, lang, navSection]);
  const categories = useMemo(() => getCategories(ordered), [ordered]);
  const sectionCounts = useMemo(
    () =>
      Object.fromEntries(sections.map((item) => [item.id, getSectionDocs(lang, item.id, docs).length])) as Record<
        Pkg,
        number
      >,
    [docs, lang],
  );
  // 搜索覆盖全部分区，按分区 → 分类的顺序排列
  const searchDocs = useMemo(
    () => sections.flatMap((item) => orderByCategory(getSectionDocs(lang, item.id, docs))),
    [docs, lang],
  );
  // 「浏览组件」与分区落地页重复，只保留首页入口，不进侧栏
  const navItems = useMemo(
    () =>
      guides
        .filter((guide) => guide.path !== 'browse')
        .map((guide) => ({ path: guide.path, title: t(guide.titleKey) })),
    [t],
  );
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

  // 抽屉打开时：Esc 关闭、锁定背景滚动；窗口拉宽到桌面布局时自动复位
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const media = window.matchMedia(DRAWER_QUERY);
    const onMediaChange = (event: MediaQueryListEvent) => {
      if (!event.matches) setMenuOpen(false);
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    media.addEventListener('change', onMediaChange);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKeyDown);
      media.removeEventListener('change', onMediaChange);
    };
  }, [menuOpen]);

  const slug = section && path.length > section.path.length ? path.slice(section.path.length + 1) : null;
  const index = slug ? ordered.findIndex((doc) => doc.slug === slug) : -1;
  const guide = guides.find((item) => item.path === path);

  let page;
  if (index >= 0) {
    const doc = ordered[index];
    page = <ComponentPage key={doc.slug} doc={doc} prev={ordered[index - 1]} next={ordered[index + 1]} />;
  } else if (section && path === section.path) {
    page = (
      <SectionPage
        label={t(section.labelKey)}
        description={t(section.descriptionKey)}
        emptyLabel={t('section.soon')}
        docs={ordered}
      />
    );
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
        sections={sections}
        sectionCounts={sectionCounts}
        activeSection={section?.id}
        menuOpen={menuOpen}
        onToggleTheme={toggleTheme}
        onOpenSearch={() => setSearchOpen(true)}
        onToggleMenu={() => setMenuOpen((open) => !open)}
      />
      <div className="docs-body">
        <Sidebar
          docs={ordered}
          categories={categories}
          guides={navItems}
          sections={sections}
          sectionCounts={sectionCounts}
          navSection={navSection}
          activeSection={section?.id}
          activePath={path}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
        <main className="docs-main">{page}</main>
      </div>
      {searchOpen && <SearchDialog docs={searchDocs} onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
