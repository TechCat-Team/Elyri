import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';

import { App } from './App';
import { I18nProvider } from './lib/i18n';
import { DEFAULT_LANG, href, isLang } from './lib/routes';
import { RouterProvider } from './lib/router';
import { ToastPositionProvider } from './lib/toastPosition';

import '@elyri/motion/styles.css';
import '@elyri/ui/styles.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/shell.css';
import './styles/content.css';
import './styles/playground.css';

/** 旧版 #/xxx 链接重定向到带语言前缀的新路径 */
const redirectLegacyHash = () => {
  if (!window.location.hash.startsWith('#/')) return false;

  let lang = DEFAULT_LANG;
  try {
    const stored = localStorage.getItem('elyri-docs-lang');
    if (isLang(stored ?? undefined)) lang = stored as typeof lang;
  } catch {
    // 读取失败时用默认语言
  }

  const path = window.location.hash.slice(2).replace(/\/+$/, '');
  window.location.replace(href(lang, path));
  return true;
};

if (!redirectLegacyHash()) {
  const container = document.getElementById('root');

  if (container) {
    const tree = (
      <StrictMode>
        <RouterProvider url={window.location.pathname}>
          <I18nProvider>
            {/* 全局单例：示例共用同一视口，避免各自挂载 provider 导致浮层重叠 */}
            <ToastPositionProvider>
              <App />
            </ToastPositionProvider>
          </I18nProvider>
        </RouterProvider>
      </StrictMode>
    );

    // 预渲染过的页面直接接管，否则全量渲染
    if (container.firstElementChild) hydrateRoot(container, tree);
    else createRoot(container).render(tree);
  }
}
