import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

import { href, parsePath } from './routes';
import type { Lang } from './types';

interface RouterValue {
  lang: Lang;
  /** 站内路径，不含语言段 */
  path: string;
  /** 生成站内链接 */
  to: (lang: Lang, path: string) => string;
  push: (path: string, lang?: Lang) => void;
  setLang: (lang: Lang) => void;
}

const RouterContext = createContext<RouterValue | null>(null);

const clean = (path: string) => path.replace(/^\/+|\/+$/g, '');

/**
 * 基于 History API 的极简路由。路径格式为 /{lang}/{...path}/，
 * 语言是路径的一部分，因此每个页面都有独立且可被收录的 URL。
 */
export function RouterProvider({ url, children }: { url: string; children: ReactNode }) {
  const [route, setRoute] = useState(() => parsePath(url).route);

  const push = useCallback(
    (path: string, lang?: Lang) => {
      const next = { lang: lang ?? route.lang, path: clean(path) };
      window.history.pushState(null, '', href(next.lang, next.path));
      setRoute(next);
      window.scrollTo({ top: 0 });
    },
    [route.lang],
  );

  // 缺少语言段（旧链接、直接落在根路径）时改写为规范 URL
  useEffect(() => {
    const current = parsePath(window.location.pathname);
    if (!current.hasLang) {
      window.history.replaceState(null, '', href(current.route.lang, current.route.path));
    }

    const onPopState = () => {
      setRoute(parsePath(window.location.pathname).route);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const value = useMemo<RouterValue>(
    () => ({
      lang: route.lang,
      path: route.path,
      to: href,
      push,
      setLang: (lang) => push(route.path, lang),
    }),
    [route.lang, route.path, push],
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRoute() {
  const value = useContext(RouterContext);
  if (!value) throw new Error('useRoute 必须在 RouterProvider 内使用');
  return value;
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** 站内路径，不含语言段 */
  to: string;
  /** 指向其他语言时传入，省略表示保持当前语言 */
  lang?: Lang;
}

/** 站内链接：渲染真实 href（便于爬虫与中键打开），左键点击走前端路由 */
export function Link({ to, lang, onClick, ...rest }: LinkProps) {
  const { lang: currentLang, to: build, push } = useRoute();
  const target = lang ?? currentLang;

  return (
    <a
      href={build(target, to)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        push(to, target);
      }}
      {...rest}
    />
  );
}
