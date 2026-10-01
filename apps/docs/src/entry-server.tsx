import { StrictMode } from 'react';
import { renderToReadableStream } from 'react-dom/server';

import { App } from './App';
import { docPagePath, docPages } from './content/docs';
import { getDocs } from './content/registry';
import { I18nProvider } from './lib/i18n';
import { pageMeta } from './lib/meta';
import { href, LANGS, LEGACY_PATHS, parsePath } from './lib/routes';
import { RouterProvider } from './lib/router';
import { docPath, sections } from './lib/sections';
import type { Lang } from './lib/types';

export interface PrerenderRoute {
  lang: Lang;
  /** 站内路径，不含语言段 */
  path: string;
  url: string;
}

/** 需要预渲染的全部页面：首页 + 文档页 + 每个分区落地页 + 每个组件，每种语言 */
export function routes(): PrerenderRoute[] {
  return LANGS.flatMap((lang) =>
    [
      '',
      ...docPages.map(docPagePath),
      ...sections.map((section) => section.path),
      ...getDocs(lang).map(docPath),
    ].map((path) => ({
      lang,
      path,
      url: href(lang, path),
    })),
  );
}

/** 旧地址 → 新地址，预渲染为跳转页，保证已收录的链接仍可访问 */
export function redirects(): { from: string; to: string }[] {
  return LANGS.flatMap((lang) =>
    Object.entries(LEGACY_PATHS).map(([from, to]) => ({ from: href(lang, from), to: href(lang, to) })),
  );
}

export async function render(url: string) {
  const { route } = parsePath(url);

  const stream = await renderToReadableStream(
    <StrictMode>
      <RouterProvider url={href(route.lang, route.path)}>
        <I18nProvider>
          <App />
        </I18nProvider>
      </RouterProvider>
    </StrictMode>,
    {
      onError(error) {
        console.error('[prerender]', error);
      },
    },
  );

  // 等待所有 Suspense 边界（按需加载的演示）完成，拿到完整 HTML
  await stream.allReady;
  const html = await new Response(stream).text();

  return { html, lang: route.lang, path: route.path, meta: pageMeta(route.lang, route.path) };
}
