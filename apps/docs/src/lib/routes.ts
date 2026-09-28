import type { Lang } from './types';

export const LANGS: readonly Lang[] = ['zh', 'en'];
export const DEFAULT_LANG: Lang = 'zh';

/** <html lang> 与 hreflang 使用的值 */
export const HTML_LANG: Record<Lang, string> = { zh: 'zh-CN', en: 'en' };

export const OTHER_LANG: Record<Lang, Lang> = { zh: 'en', en: 'zh' };

export const isLang = (value: string | undefined): value is Lang => value === 'zh' || value === 'en';

export interface Route {
  lang: Lang;
  /** 站内路径，不含语言段，例如 "components/aurora"；首页为 "" */
  path: string;
}

/**
 * 把 URL 路径拆成语言与站内路径。
 * /zh/components/aurora/ → { lang: 'zh', path: 'components/aurora' }
 * 缺少语言段时按默认语言处理，交给调用方决定是否改写 URL。
 */
export function parsePath(pathname: string): { route: Route; hasLang: boolean } {
  const segments = pathname.split('/').filter(Boolean);
  const [first, ...rest] = segments;
  if (isLang(first)) return { route: { lang: first, path: rest.join('/') }, hasLang: true };
  return { route: { lang: DEFAULT_LANG, path: segments.join('/') }, hasLang: false };
}

/** 站内路径（不含语言段）→ 站内链接，统一带尾斜杠 */
export function href(lang: Lang, path: string): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return clean ? `/${lang}/${clean}/` : `/${lang}/`;
}
