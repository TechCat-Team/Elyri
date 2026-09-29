import { getDocs } from '../content/registry';
import { guideMeta } from '../content/guides';

import { messages } from './messages';
import { docPkg, sectionByPath } from './sections';
import { site } from './site';
import type { Lang, PageMeta } from './types';

/** 按语言与站内路径解析页面标题与描述 */
export function pageMeta(lang: Lang, path: string): PageMeta {
  const guide = guideMeta(lang, path);
  if (guide) return guide;

  const section = sectionByPath(path);
  if (section) {
    const slug = path.slice(section.path.length + 1);
    if (!slug) {
      return {
        title: `${messages[lang][section.labelKey]} · ${site.name}`,
        description: messages[lang][section.descriptionKey],
      };
    }
    const doc = getDocs(lang).find((item) => docPkg(item) === section.id && item.slug === slug);
    if (doc) return { title: `${doc.title} · ${site.name}`, description: doc.description };
  }

  return {
    title: `404 · ${site.name}`,
    description: messages[lang]['page.notFoundHint'],
    notFound: true,
  };
}
