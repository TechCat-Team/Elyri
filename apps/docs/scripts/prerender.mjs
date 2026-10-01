/**
 * 预渲染脚本：把每个页面渲染成独立的静态 HTML，并生成 sitemap / robots / 404。
 * 由 `pnpm build` 在 `vite build` 与 `vite build --ssr` 之后调用。
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const ssrEntry = join(root, 'dist-ssr', 'entry-server.js');

/** Vercel 会在构建时注入生产域名，本地可用 VITE_SITE_URL 覆盖 */
const rawOrigin =
  process.env.VITE_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || '';
const origin = rawOrigin ? (rawOrigin.startsWith('http') ? rawOrigin : `https://${rawOrigin}`).replace(/\/$/, '') : '';

const absolute = (path) => (origin ? `${origin}${path}` : path);
const htmlLang = (lang) => (lang === 'zh' ? 'zh-CN' : 'en');
const escape = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** 站内路径 → 对外 URL，末尾带斜杠以便静态托管直接命中目录下的 index.html */
const routeUrl = (lang, path) => {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return clean ? `/${lang}/${clean}/` : `/${lang}/`;
};

const headTags = ({ lang, path, meta }) => {
  const other = lang === 'zh' ? 'en' : 'zh';
  const tags = [
    `<meta name="description" content="${escape(meta.description)}" />`,
    meta.notFound ? '<meta name="robots" content="noindex" />' : '',
    `<link rel="canonical" href="${absolute(routeUrl(lang, path))}" />`,
    `<link rel="alternate" hreflang="zh-CN" href="${absolute(routeUrl('zh', path))}" />`,
    `<link rel="alternate" hreflang="en" href="${absolute(routeUrl('en', path))}" />`,
    `<link rel="alternate" hreflang="x-default" href="${absolute(routeUrl('zh', path))}" />`,
    `<meta name="theme-color" content="#0e1014" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:title" content="${escape(meta.title)}" />`,
    `<meta property="og:description" content="${escape(meta.description)}" />`,
    `<meta property="og:url" content="${absolute(routeUrl(lang, path))}" />`,
    `<meta property="og:locale" content="${lang === 'zh' ? 'zh_CN' : 'en_US'}" />`,
    `<meta property="og:locale:alternate" content="${other === 'zh' ? 'zh_CN' : 'en_US'}" />`,
    `<meta property="og:image" content="${absolute('/logo.svg')}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
  ];
  return tags.filter(Boolean).join('\n    ');
};

const REDIRECT_PAGE = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Elyri · React 动效组件库</title>
    <meta name="robots" content="noindex" />
    <link rel="canonical" href="/zh/" />
    <meta http-equiv="refresh" content="0; url=/zh/" />
    <script>
      (function () {
        try {
          var lang = localStorage.getItem('elyri-docs-lang');
          if (lang !== 'zh' && lang !== 'en') {
            lang = (navigator.language || '').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en';
          }
          var hash = location.hash;
          var path = hash.indexOf('#/') === 0 ? hash.slice(2) : '';
          location.replace('/' + lang + '/' + path);
        } catch (error) {
          location.replace('/zh/');
        }
      })();
    </script>
  </head>
  <body>
    <p>Redirecting to <a href="/zh/">/zh/</a>…</p>
  </body>
</html>
`;

const NOT_FOUND_PAGE = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>404 · Elyri</title>
    <meta name="robots" content="noindex" />
  </head>
  <body>
    <p>找不到页面 · Page not found</p>
    <p>
      <a href="/zh/">中文文档</a> ·
      <a href="/en/">English docs</a>
    </p>
  </body>
</html>
`;

const redirectPage = (to) => `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Redirecting…</title>
    <meta name="robots" content="noindex" />
    <link rel="canonical" href="${absolute(to)}" />
    <meta http-equiv="refresh" content="0; url=${to}" />
    <script>location.replace(${JSON.stringify(to)} + location.hash);</script>
  </head>
  <body>
    <p>Moved to <a href="${to}">${to}</a></p>
  </body>
</html>
`;

const { render, routes, redirects } = await import(pathToFileURL(ssrEntry).href);
const template = await readFile(join(dist, 'index.html'), 'utf8');

const all = routes();
for (const route of all) {
  const { html, lang, path, meta } = await render(route.url);
  const page = template
    .replace(/<html lang="[^"]*"/, `<html lang="${htmlLang(lang)}"`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(meta.title)}</title>`)
    .replace('<!--app-head-->', headTags({ lang, path, meta }))
    .replace('<!--app-html-->', html);

  const file = join(dist, routeUrl(lang, path), 'index.html');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, page);
}

for (const { from, to } of redirects()) {
  const file = join(dist, from, 'index.html');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, redirectPage(to));
}

await writeFile(join(dist, 'index.html'), REDIRECT_PAGE);
await writeFile(join(dist, '404.html'), NOT_FOUND_PAGE);

if (origin) {
  const urls = all.map((route) => `  <url>\n    <loc>${absolute(route.url)}</loc>\n  </url>`).join('\n');
  await writeFile(
    join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
  await writeFile(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${absolute('/sitemap.xml')}\n`);
  console.log(`[prerender] ${all.length} pages + sitemap.xml + robots.txt (${origin})`);
} else {
  console.warn('[prerender] 未配置站点地址，已跳过 sitemap.xml / robots.txt（设置 VITE_SITE_URL 或部署到 Vercel）');
  console.log(`[prerender] ${all.length} pages`);
}
