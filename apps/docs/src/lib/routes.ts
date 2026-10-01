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

/** 已迁移的旧路径 → 新路径。旧链接可能已被收录，继续可访问并跳到新地址 */
export const LEGACY_PATHS: Record<string, string> = {
  installation: 'docs/installation',
  browse: 'components',
};

/**
 * 把 URL 路径拆成语言与站内路径。
 * /zh/components/aurora/ → { lang: 'zh', path: 'components/aurora' }
 * 缺少语言段时按默认语言处理；旧路径直接换成新路径。是否改写 URL 交给调用方决定。
 */
export function parsePath(pathname: string): { route: Route; canonical: boolean } {
  const segments = pathname.split('/').filter(Boolean);
  const [first, ...rest] = segments;
  const hasLang = isLang(first);
  const raw = hasLang ? rest.join('/') : segments.join('/');
  const path = LEGACY_PATHS[raw] ?? raw;
  return { route: { lang: hasLang ? first : DEFAULT_LANG, path }, canonical: hasLang && path === raw };
}

/** 站内路径（不含语言段）→ 站内链接，统一带尾斜杠 */
export function href(lang: Lang, path: string): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return clean ? `/${lang}/${clean}/` : `/${lang}/`;
}
