import type { ComponentType } from 'react';

import { CodeBlock } from '../components/CodeBlock';
import { InstallSnippet } from '../components/InstallSnippet';
import type { MessageKey } from '../lib/messages';
import { site } from '../lib/site';
import { useI18n } from '../lib/i18n';
import type { ComponentDoc } from '../lib/types';

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
    countSuffix: '个组件',
    quickstart: '快速开始',
    installTitle: '安装',
    installDescription: '通过包管理器安装，并在入口处引入样式。',
    stepInstall: '1. 安装依赖',
    stepStyles: '2. 引入样式',
    stepUsage: '3. 使用组件',
  },
  en: {
    introDescription: 'Animation components for React. Preview them live, tune the props, then take the code with you.',
    introCta: 'Read the installation guide ↗',
    browse: 'Browse components',
    countSuffix: 'COMPONENTS',
    quickstart: 'Quick start',
    installTitle: 'Installation',
    installDescription: 'Install with your package manager, then import the stylesheet once at your entry point.',
    stepInstall: '1. Install the package',
    stepStyles: '2. Import the styles',
    stepUsage: '3. Use a component',
  },
};

function IntroPage({ docs }: GuideProps) {
  const { lang } = useI18n();
  const t = copy[lang];

  return (
    <article className="doc-page index-page">
      <h1 className="page-title">{site.name}</h1>
      <p className="page-description">{t.introDescription}</p>
      <a className="primary-button" href="#/installation">
        {t.introCta}
      </a>

      <section className="section">
        <div className="index-heading">
          <h2 className="section-title">{t.browse}</h2>
          <span className="index-count">
            {docs.length} {t.countSuffix}
          </span>
        </div>
        <div className="index-list">
          {docs.map((doc) => (
            <a className="index-link" key={doc.slug} href={`#/components/${doc.slug}`}>
              <span className="index-link-title">{doc.title}</span>
              <span className="index-link-meta">
                {doc.category} · {doc.description}
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="index-quickstart">
        <h2 className="section-title">{t.quickstart}</h2>
        <InstallSnippet />
      </section>
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
        code={`import { GradientText } from '${site.packageName}';\n\nexport function App() {\n  return <GradientText>Hello</GradientText>;\n}`}
      />
    </article>
  );
}

export const guides: Guide[] = [
  { path: '', titleKey: 'guides.intro', Component: IntroPage },
  { path: 'installation', titleKey: 'guides.installation', Component: InstallPage },
];
