import { useEffect } from 'react';

import { HTML_LANG } from '../routes';
import type { Lang, PageMeta } from '../types';

const setMeta = (name: string, content: string) => {
  let tag = document.head.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

/**
 * 把当前页面的标题与描述写入 <head>。
 * 预渲染时这些标签已经写进 HTML，这里只负责客户端跳转后的同步。
 */
export function useDocumentHead(lang: Lang, meta: PageMeta) {
  useEffect(() => {
    document.title = meta.title;
    document.documentElement.lang = HTML_LANG[lang];
    setMeta('description', meta.description);
  }, [lang, meta.title, meta.description]);
}
