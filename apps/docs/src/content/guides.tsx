import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { ComponentType } from 'react';
import { ReducedMotionProvider, usePrefersReducedMotion } from 'elyri';

import { CodeBlock } from '../components/CodeBlock';
import { InstallSnippet } from '../components/InstallSnippet';
import { Link } from '../lib/router';
import { messages, categoryLabel } from '../lib/messages';
import type { MessageKey } from '../lib/messages';
import { site } from '../lib/site';
import { useI18n } from '../lib/i18n';
import type { ComponentDoc, ControlValues, Lang, PageMeta } from '../lib/types';

/** 引导页收到的都是同一份文档数据，页面按需取用 */
export interface GuideProps {
  docs: ComponentDoc[];
}

export interface Guide {
  path: string;
  titleKey: MessageKey;
  Component: ComponentType<GuideProps>;
}

const copy = {
  zh: {
    introDescription: '为 React 而做的动效组件。浏览实时预览，调整参数，再把适合的代码带进项目。',
    introCta: '查看安装方式 ↗',
    browse: '浏览组件',
    browseDescription: '浏览全部动效组件，打开任意一个即可查看实时预览、代码与参数。',
    countSuffix: '个组件',
    quickstart: '快速开始',
    installTitle: '安装',
    installDescription: '安装底层依赖，再将组件源码添加到项目中；添加后可以直接修改组件。',
    stepInstall: '1. 安装依赖并添加组件',
    stepStyles: '2. 引入公共样式',
    stepUsage: '3. 使用本地组件',
  },
  en: {
    introDescription: 'Animation components for React. Preview them live, tune the props, then take the code with you.',
    introCta: 'Read the installation guide ↗',
    browse: 'Browse components',
    browseDescription: 'Browse every animation component. Open any one to see its live preview, code, and props.',
    countSuffix: 'COMPONENTS',
    quickstart: 'Quick start',
    installTitle: 'Installation',
    installDescription: 'Install the core dependency, then add editable component source to your project.',
    stepInstall: '1. Install and add a component',
    stepStyles: '2. Import shared styles',
    stepUsage: '3. Use the local component',
  },
};

function IntroPage() {
  const { lang } = useI18n();
  const t = copy[lang];

  return (
    <article className="doc-page index-page">
      <h1 className="page-title">{site.name}</h1>
      <p className="page-description">{t.introDescription}</p>
      <div className="index-actions">
        <Link className="primary-button" to="installation">
          {t.introCta}
        </Link>
        <Link className="ghost-button" to="browse">
          {t.browse}
        </Link>
      </div>

      <section className="index-quickstart">
        <h2 className="section-title">{t.quickstart}</h2>
        <InstallSnippet />
      </section>
    </article>
  );
}

const defaultsOf = (doc: ComponentDoc): ControlValues =>
  Object.fromEntries((doc.controls ?? []).map((control) => [control.name, control.default]));

/**
 * 组件卡片：靠近视口后挂载演示，但默认渲染成静止帧；
 * 鼠标悬停（触屏设备为进入视口）才播放动画。
 * 静止由组件库的 ReducedMotionProvider 强制，空闲时不会跑 RAF。
 */
function ShowcaseCard({ doc }: { doc: ComponentDoc }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const [mounted, setMounted] = useState(false);
  // 用户系统层面要求减弱动效时，始终静止，悬停也不播放
  const systemReducedMotion = usePrefersReducedMotion();
  // 触屏等不支持悬停的设备用可见性兜底；服务端先按可悬停处理，与客户端首帧一致
  const canHover = useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia('(hover: hover)');
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    () => window.matchMedia('(hover: hover)').matches,
    () => true,
  );

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setMounted(true);
      },
      { rootMargin: '150px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const playing = canHover ? hovered : inView;

  return (
    <div
      className="showcase-card"
      ref={ref}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div className={playing ? 'showcase-preview is-playing' : 'showcase-preview'}>
        {mounted && (
          <ReducedMotionProvider reduced={systemReducedMotion || !playing}>
            <Suspense fallback={<div className="demo-fallback" />}>{doc.render(defaultsOf(doc))}</Suspense>
          </ReducedMotionProvider>
        )}
      </div>
      <div className="showcase-card-body">
        <div className="showcase-card-head">
          <span className="showcase-card-title">{doc.title}</span>
          {doc.isNew && <span className="new-tag">New</span>}
        </div>
        <p className="showcase-card-desc">{doc.description}</p>
      </div>
      <Link className="showcase-card-link" to={`components/${doc.slug}`} aria-label={doc.title} />
    </div>
  );
}

function BrowsePage({ docs }: GuideProps) {
  const { lang, t: translate } = useI18n();
  const t = copy[lang];
  const categories = [...new Set(docs.map((doc) => doc.category))];

  return (
    <article className="doc-page index-page">
      <h1 className="page-title">{t.browse}</h1>
      <p className="page-description">{t.browseDescription}</p>
      {categories.map((category) => {
        const items = docs.filter((doc) => doc.category === category);
        return (
          <section key={category} className="showcase-group">
            <h2 className="section-title">
              {categoryLabel(category, translate)}
              <span className="showcase-count">
                {items.length} {t.countSuffix}
              </span>
            </h2>
            <div className="showcase-grid">
              {items.map((doc) => (
                <ShowcaseCard key={doc.slug} doc={doc} />
              ))}
            </div>
          </section>
        );
      })}
    </article>
  );
}

function InstallPage() {
  const { lang } = useI18n();
  const t = copy[lang];

  return (
    <article className="doc-page">
      <h1 className="page-title">{t.installTitle}</h1>
      <p className="page-description">{t.installDescription}</p>
      <h2 className="section-title">{t.stepInstall}</h2>
      <InstallSnippet />
      <h2 className="section-title">{t.stepStyles}</h2>
      <CodeBlock title="main.tsx" code={`import '${site.packageName}/styles.css';`} />
      <h2 className="section-title">{t.stepUsage}</h2>
      <CodeBlock
        title="App.tsx"
        code={`import { GradientText } from './components/elyri/GradientText';\n\nexport function App() {\n  return <GradientText>Hello</GradientText>;\n}`}
      />
    </article>
  );
}

export const guides: Guide[] = [
  { path: '', titleKey: 'guides.intro', Component: IntroPage },
  { path: 'installation', titleKey: 'guides.installation', Component: InstallPage },
  { path: 'browse', titleKey: 'guides.browse', Component: BrowsePage },
];

/** 引导页的标题与描述，供预渲染与 <head> 使用 */
export const guideMeta = (lang: Lang, path: string): PageMeta | null => {
  const t = copy[lang];

  if (path === '') return { title: messages[lang]['app.title'], description: t.introDescription };
  if (path === 'browse') {
    return { title: `${t.browse} · ${site.name}`, description: t.browseDescription };
  }
  if (path === 'installation') {
    return { title: `${t.installTitle} · ${site.name}`, description: t.installDescription };
  }
  return null;
};
