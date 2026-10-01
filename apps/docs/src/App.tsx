import { useEffect, useMemo, useState } from 'react';

import { Header } from './components/Header';
import { SearchDialog } from './components/SearchDialog';
import type { SearchItem } from './components/SearchDialog';
import { Sidebar } from './components/Sidebar';
import type { SidebarGroup, SidebarLink, SidebarTab } from './components/Sidebar';
import { DOCS_ROOT, docGroups, docPageByPath, docPagePath, docPages, isDocsPath } from './content/docs';
import { HomePage } from './content/home';
import { getCategories, getDocs, getSectionDocs } from './content/registry';
import { useDocumentHead } from './lib/hooks/useDocumentHead';
import { useTheme } from './lib/hooks/useTheme';
import { useI18n } from './lib/i18n';
import { categoryLabel } from './lib/messages';
import { pageMeta } from './lib/meta';
import { useRoute } from './lib/router';
import { docPath, docPkg, sectionById, sectionByPath, sections } from './lib/sections';
import type { ComponentDoc, Pkg } from './lib/types';
import { ComponentPage } from './pages/ComponentPage';
import { GuidePage } from './pages/GuidePage';
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
  const inDocs = isDocsPath(path);

  const sectionCounts = useMemo(
    () =>
      Object.fromEntries(sections.map((item) => [item.id, getSectionDocs(lang, item.id, docs).length])) as Record<
        Pkg,
        number
      >,
    [docs, lang],
  );
  const ordered = useMemo(
    () => (section ? orderByCategory(getSectionDocs(lang, section.id, docs)) : []),
    [docs, lang, section],
  );

  // 侧栏只展示当前所在区域的内容：文档区只有文档，组件分区只有该分区的组件
  const tabs = useMemo<SidebarTab[]>(
    () => [
      { key: 'docs', path: DOCS_ROOT, label: t('nav.docs') },
      ...sections.map((item) => ({ key: item.id, path: item.path, label: t(item.labelKey) })),
    ],
    [t],
  );
  const activeTab = inDocs ? 'docs' : section?.id;

  const { head, groups } = useMemo((): { head?: SidebarLink; groups: SidebarGroup[] } => {
    if (inDocs) {
      return {
        groups: docGroups.map((group) => ({
          title: t(group.labelKey),
          items: docPages
            .filter((page) => page.group === group.id)
            .map((page) => ({ path: docPagePath(page), title: page.title[lang] })),
        })),
      };
    }
    if (section) {
      const count = sectionCounts[section.id];
      return {
        head: {
          path: section.path,
          title: t(section.labelKey),
          badge: <span className="sidebar-count">{count > 0 ? count : t('section.soon')}</span>,
        },
        groups: getCategories(ordered).map((category) => ({
          title: categoryLabel(category, t),
          items: ordered
            .filter((doc) => doc.category === category)
            .map((doc) => ({
              path: docPath(doc),
              title: doc.title,
              badge: doc.isNew ? <span className="new-tag">{t('tag.new')}</span> : undefined,
            })),
        })),
      };
    }
    return { groups: [] };
  }, [inDocs, section, sectionCounts, ordered, lang, t]);

  // 搜索覆盖文档页与全部分区，文档在前，组件按分区 → 分类排列
  const searchItems = useMemo<SearchItem[]>(
    () => [
      ...docPages.map((page) => ({
        path: docPagePath(page),
        title: page.title[lang],
        meta: t('nav.docs'),
        keywords: page.description[lang],
      })),
      ...sections.flatMap((item) =>
        orderByCategory(getSectionDocs(lang, item.id, docs)).map((doc) => ({
          path: docPath(doc),
          title: doc.title,
          meta: `${t(sectionById(docPkg(doc)).labelKey)} · ${categoryLabel(doc.category, t)}`,
          keywords: `${doc.slug} ${doc.category} ${doc.description}`,
        })),
      ),
    ],
    [docs, lang, t],
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
  const guide = docPageByPath(path);

  let page;
  if (path === '') {
    page = <HomePage docs={docs} />;
  } else if (guide) {
    page = <GuidePage key={path} page={guide} />;
  } else if (index >= 0) {
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

  // 首页与 404 没有侧栏内容：宽屏铺满，窄屏抽屉里仍可切换顶层导航
  const hasNav = Boolean(head) || groups.length > 0;

  return (
    <div className="docs">
      <Header
        sections={sections}
        sectionCounts={sectionCounts}
        activeTab={activeTab}
        menuOpen={menuOpen}
        onToggleTheme={toggleTheme}
        onOpenSearch={() => setSearchOpen(true)}
        onToggleMenu={() => setMenuOpen((open) => !open)}
      />
      <div className={hasNav ? 'docs-body' : 'docs-body is-full'}>
        <Sidebar
          tabs={tabs}
          activeTab={activeTab}
          head={head}
          groups={groups}
          activePath={path}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
        <main className="docs-main">{page}</main>
      </div>
      {searchOpen && <SearchDialog items={searchItems} onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
