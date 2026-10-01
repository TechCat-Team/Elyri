import { CountUp } from '@elyri/motion';

import { InstallSnippet } from '../components/InstallSnippet';
import { ShowcaseCard } from '../components/ShowcaseCard';
import { useI18n } from '../lib/i18n';
import { messages } from '../lib/messages';
import { Link } from '../lib/router';
import type { ComponentDoc, Lang, PageMeta } from '../lib/types';
import { site } from '../lib/site';

const copy = {
  zh: {
    description: '为 React 而做的动效、UI 组件与页面区块。浏览实时预览，调整参数，再把适合的代码带进项目。',
    readDocs: '阅读文档',
    browse: '浏览组件',
    quickstart: '快速开始',
    quickstartMore: '完整安装说明 →',
    statComponents: '组件',
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
    description:
      'Motion, UI components and page blocks for React. Preview them live, tune the props, then take the code with you.',
    readDocs: 'Read the docs',
    browse: 'Browse components',
    quickstart: 'Quick start',
    quickstartMore: 'Full installation guide →',
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

/** 站点首页：不带侧栏的落地页 */
export function HomePage({ docs }: { docs: ComponentDoc[] }) {
  const { lang } = useI18n();
  const t = copy[lang];
  const categoryCount = new Set(docs.map((doc) => doc.category)).size;
  // 精选三个最能代表动效能力的组件（龙鳞 / 字符画 / 流光渐变）
  const featured = ['dragon-scales', 'ascii-image', 'mesh-gradient']
    .map((slug) => docs.find((doc) => doc.slug === slug))
    .filter((doc): doc is ComponentDoc => Boolean(doc));

  return (
    <article className="doc-page index-page">
      <h1 className="page-title">{site.name}</h1>
      <p className="page-description">{t.description}</p>
      <div className="index-actions">
        <Link className="primary-button" to="docs">
          {t.readDocs}
        </Link>
        <Link className="ghost-button" to="components">
          {t.browse}
        </Link>
      </div>

      <div className="index-stats">
        <div className="index-stat">
          <div className="index-stat-value">
            <CountUp to={docs.length} />
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
        <div className="section-head">
          <h2 className="section-title">{t.quickstart}</h2>
          <Link className="text-link" to="docs/installation">
            {t.quickstartMore}
          </Link>
        </div>
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

export const homeMeta = (lang: Lang): PageMeta => ({
  title: messages[lang]['app.title'],
  description: copy[lang].description,
});
