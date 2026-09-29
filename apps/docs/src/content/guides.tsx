import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { ComponentType } from 'react';
import { CountUp, ReducedMotionProvider, usePrefersReducedMotion } from 'elyri';

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
    statComponents: '动效组件',
    statCategories: '分类',
    statDependencies: '运行时依赖',
    featuredTitle: '精选动效',
    featuresTitle: '为什么选择 Elyri',
    features: [
      { title: '零运行时依赖', description: '只依赖 React，包体轻量，组件源码可直接阅读与改造。' },
      { title: 'CSS 变量主题', description: '所有可定制项都是 CSS 变量，可在全局或容器内局部覆盖。' },
      { title: '性能优先', description: 'WebGL 与合成层驱动动效，离屏或切到后台时自动暂停，空闲不占 CPU。' },
      { title: '尊重减弱动效', description: '跟随系统偏好，也可用 ReducedMotionProvider 强制子树播放或静止。' },
    ],
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
    statComponents: 'Components',
    statCategories: 'Categories',
    statDependencies: 'Runtime dependencies',
    featuredTitle: 'Featured effects',
    featuresTitle: 'Why Elyri',
    features: [
      {
        title: 'Zero runtime dependencies',
        description: 'React is the only peer dependency. A small bundle, with component source you can read and edit.',
      },
      {
        title: 'CSS variable theming',
        description: 'Every customizable value is a CSS variable, overridable globally or within any container.',
      },
      {
        title: 'Performance first',
        description: 'WebGL and compositor-driven motion that pauses offscreen or in background tabs.',
      },
      {
        title: 'Reduced motion aware',
        description: 'Follows the system preference, and ReducedMotionProvider can force a subtree to play or rest.',
      },
    ],
  },
};

/** 特性亮点图标，按 copy.features 的顺序一一对应 */
const featureIcons = [
  <>
    <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" />
    <path d="m3 7 9 5 9-5" />
    <path d="M12 12v10" />
  </>,
  <path d="M12 3s6 6.5 6 10.5A6 6 0 0 1 6 13.5C6 9.5 12 3 12 3Z" />,
  <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M10 9v6M14 9v6" />
  </>,
];

function IntroPage({ docs }: GuideProps) {
  const { lang } = useI18n();
  const t = copy[lang];
  const componentCount = docs.length;
  const categoryCount = new Set(docs.map((doc) => doc.category)).size;
  // 首页精选：挑三个最能代表动效能力的组件（龙鳞 / 字符画 / 水下焦散）
  const featured = ['dragon-scales', 'ascii-image', 'caustics']
    .map((slug) => docs.find((doc) => doc.slug === slug))
    .filter((doc): doc is ComponentDoc => Boolean(doc));

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

      <div className="index-stats">
        <div className="index-stat">
          <div className="index-stat-value">
            <CountUp to={componentCount} />
          </div>
          <div className="index-stat-label">{t.statComponents}</div>
        </div>
        <div className="index-stat">
          <div className="index-stat-value">
            <CountUp to={categoryCount} />
          </div>
          <div className="index-stat-label">{t.statCategories}</div>
        </div>
        <div className="index-stat">
          <div className="index-stat-value">0</div>
          <div className="index-stat-label">{t.statDependencies}</div>
        </div>
      </div>

      <section className="section">
        <h2 className="section-title">{t.featuredTitle}</h2>
        <div className="showcase-grid">
          {featured.map((doc) => (
            <ShowcaseCard key={doc.slug} doc={doc} />
          ))}
        </div>
      </section>

      <section className="index-quickstart">
        <h2 className="section-title">{t.quickstart}</h2>
        <InstallSnippet />
      </section>

      <section className="section">
        <h2 className="section-title">{t.featuresTitle}</h2>
        <div className="index-features">
          {t.features.map((feature, index) => (
            <div key={feature.title} className="index-feature">
              <span className="index-feature-icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {featureIcons[index]}
                </svg>
              </span>
              <div>
                <div className="index-feature-title">{feature.title}</div>
                <p className="index-feature-desc">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
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
            <Suspense fallback={<div className="demo-fallback" />}>
              {doc.render({ ...defaultsOf(doc), ...doc.showcaseValues })}
            </Suspense>
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
