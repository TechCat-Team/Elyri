import { StrictMode } from 'react';
import { renderToReadableStream } from 'react-dom/server';

import { App } from './App';
import { guides } from './content/guides';
import { getDocs } from './content/registry';
import { I18nProvider } from './lib/i18n';
import { pageMeta } from './lib/meta';
import { href, LANGS, parsePath } from './lib/routes';
import { RouterProvider } from './lib/router';
import type { Lang } from './lib/types';

export interface PrerenderRoute {
  lang: Lang;
  /** 站内路径，不含语言段 */
  path: string;
  url: string;
}

/** 需要预渲染的全部页面：引导页 + 每个组件、每种语言 */
export function routes(): PrerenderRoute[] {
  return LANGS.flatMap((lang) =>
    [...guides.map((guide) => guide.path), ...getDocs(lang).map((doc) => `components/${doc.slug}`)].map((path) => ({
      lang,
      path,
      url: href(lang, path),
    })),
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
