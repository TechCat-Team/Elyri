import type { MessageKey } from '../../lib/messages';
import { site } from '../../lib/site';
import type { DocPage, Lang, PageMeta } from '../../lib/types';

import { cliPage } from './cli';
import { faqPage } from './faq';
import { installationPage } from './installation';
import { introPage } from './intro';
import { reducedMotionPage } from './reduced-motion';
import { themingPage } from './theming';

/** 文档页的根路径，不含语言段 */
export const DOCS_ROOT = 'docs';

/** 文档页按此顺序出现在侧栏、翻页与搜索中 */
export const docPages: DocPage[] = [introPage, installationPage, cliPage, themingPage, reducedMotionPage, faqPage];

export const docGroups: { id: DocPage['group']; labelKey: MessageKey }[] = [
  { id: 'start', labelKey: 'docs.group.start' },
  { id: 'guides', labelKey: 'docs.group.guides' },
];

export const docPagePath = (page: DocPage) => (page.slug ? `${DOCS_ROOT}/${page.slug}` : DOCS_ROOT);

export const isDocsPath = (path: string) => path === DOCS_ROOT || path.startsWith(`${DOCS_ROOT}/`);

export const docPageByPath = (path: string) => docPages.find((page) => docPagePath(page) === path);

export const docPageMeta = (lang: Lang, path: string): PageMeta | null => {
  const page = docPageByPath(path);
  return page ? { title: `${page.title[lang]} · ${site.name}`, description: page.description[lang] } : null;
};
