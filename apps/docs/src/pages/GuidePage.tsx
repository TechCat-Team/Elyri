import { useEffect, useRef, useState } from 'react';

import { Pager } from '../components/Pager';
import { docPagePath, docPages } from '../content/docs';
import { useI18n } from '../lib/i18n';
import type { DocPage } from '../lib/types';

interface Heading {
  id: string;
  title: string;
}

/** 文档页：正文 + 右侧「本页目录」+ 翻页 */
export function GuidePage({ page }: { page: DocPage }) {
  const { lang, t } = useI18n();
  const bodyRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>();

  const index = docPages.indexOf(page);
  const toTarget = (item?: DocPage) => item && { path: docPagePath(item), title: item.title[lang] };

  // 目录从渲染结果中收集，正文怎么写都不需要额外维护
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const sections = [...body.querySelectorAll<HTMLElement>('.doc-section[id]')];
    setHeadings(
      sections.map((section) => ({
        id: section.id,
        title: section.querySelector('.doc-heading')?.textContent?.replace(/^#/, '') ?? section.id,
      })),
    );
    setActiveId(sections[0]?.id);

    // 视口上部区域内最靠上的一节视为当前节
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target.id) : visible.delete(entry.target.id)));
        const current = sections.find((section) => visible.has(section.id));
        if (current) setActiveId(current.id);
      },
      { rootMargin: '-80px 0px -60% 0px' },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [page, lang]);

  return (
    <div className="guide-layout">
      <article className="doc-page doc-prose">
        <h1 className="page-title">{page.title[lang]}</h1>
        <p className="page-description">{page.description[lang]}</p>
        <div ref={bodyRef}>
          <page.Component />
        </div>
        <Pager prev={toTarget(docPages[index - 1])} next={toTarget(docPages[index + 1])} />
      </article>

      {headings.length > 1 && (
        <nav className="guide-toc" aria-label={t('page.onThisPage')}>
          <p className="guide-toc-title">{t('page.onThisPage')}</p>
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={heading.id === activeId ? 'guide-toc-link is-active' : 'guide-toc-link'}
            >
              {heading.title}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
