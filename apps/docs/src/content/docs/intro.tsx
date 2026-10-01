import { PACKAGE_NAMES } from '../../lib/code';
import { useI18n } from '../../lib/i18n';
import { Link } from '../../lib/router';
import { sections } from '../../lib/sections';
import type { DocPage } from '../../lib/types';
import { getSectionDocs } from '../registry';

import { DocSection, DocTable, NextSteps } from './prose';

function Intro() {
  const { lang, t } = useI18n();
  const zh = lang === 'zh';

  const packageRows = sections.map((section) => {
    const count = getSectionDocs(lang, section.id).length;
    return [
      <Link key="link" to={section.path}>
        {t(section.labelKey)}
      </Link>,
      <code key="pkg">{PACKAGE_NAMES[section.id]}</code>,
      t(section.descriptionKey),
      count > 0 ? String(count) : t('section.soon'),
    ];
  });

  return (
    <>
      <DocSection id="what" title={zh ? 'Elyri 是什么' : 'What is Elyri'}>
        <p>
          {zh
            ? 'Elyri 是一套面向 React 的组件集合：动效、基础 UI 组件与页面区块。每个组件都可以直接从 npm 包导入，也可以用 CLI 把源码拷进项目，像自己写的代码一样随意修改。'
            : 'Elyri is a collection of React components: motion effects, UI primitives and page blocks. Import any component straight from npm, or copy its source into your project with the CLI and edit it like your own code.'}
        </p>
      </DocSection>

      <DocSection id="packages" title={zh ? '分区与包' : 'Sections and packages'}>
        <p>
          {zh
            ? '站点按分区组织，每个分区对应一个独立的 npm 包，只安装用得到的即可。'
            : 'The site is organised into sections, each published as its own npm package. Install only what you use.'}
        </p>
        <DocTable
          head={zh ? ['分区', '包', '内容', '组件数'] : ['Section', 'Package', 'Contents', 'Components']}
          rows={packageRows}
        />
      </DocSection>

      <DocSection id="usage-modes" title={zh ? '两种使用方式' : 'Two ways to use it'}>
        <DocTable
          head={zh ? ['方式', '适合', '升级'] : ['Mode', 'Best for', 'Upgrades']}
          rows={
            zh
              ? [
                  [<strong key="a">从包导入</strong>, '直接使用、不打算改源码', '升级包版本即可'],
                  [
                    <strong key="b">CLI 拷贝源码</strong>,
                    '需要深度定制、想完全掌控实现',
                    <>
                      重新执行 <code>add --overwrite</code>（会覆盖本地修改）
                    </>,
                  ],
                ]
              : [
                  [<strong key="a">Import from the package</strong>, 'Using components as-is', 'Bump the package version'],
                  [
                    <strong key="b">Copy source with the CLI</strong>,
                    'Deep customisation and full ownership',
                    <>
                      Re-run <code>add --overwrite</code> (replaces local edits)
                    </>,
                  ],
                ]
          }
        />
        <p>
          {zh
            ? '两种方式可以混用：大部分组件直接导入，个别需要改造的再拷出来。'
            : 'You can mix both: import most components and copy out only the ones you want to reshape.'}
        </p>
      </DocSection>

      <DocSection id="principles" title={zh ? '设计原则' : 'Principles'}>
        <ul>
          {zh ? (
            <>
              <li>
                <strong>零运行时依赖</strong>：只把 <code>react</code> 与 <code>react-dom</code>（18 或 19）作为 peer
                dependency。
              </li>
              <li>
                <strong>CSS 变量主题</strong>：可定制的值都是 <code>--elyri-*</code> 变量，可在全局或任意容器内覆盖。
              </li>
              <li>
                <strong>性能优先</strong>：WebGL 背景离开视口或页面切到后台时自动暂停，渲染分辨率默认不超过 2 倍像素比。
              </li>
              <li>
                <strong>尊重减弱动效</strong>：自动跟随系统的「减弱动态效果」设置，也可以按子树强制播放或静止。
              </li>
            </>
          ) : (
            <>
              <li>
                <strong>Zero runtime dependencies</strong>: only <code>react</code> and <code>react-dom</code> (18 or
                19) as peer dependencies.
              </li>
              <li>
                <strong>CSS variable theming</strong>: every customisable value is an <code>--elyri-*</code> variable you
                can override globally or inside any container.
              </li>
              <li>
                <strong>Performance first</strong>: WebGL backgrounds pause offscreen and in background tabs, and render
                at no more than 2× device pixel ratio by default.
              </li>
              <li>
                <strong>Reduced motion aware</strong>: follows the system preference, and any subtree can be forced to
                play or stay still.
              </li>
            </>
          )}
        </ul>
      </DocSection>

      <DocSection id="next" title={zh ? '下一步' : 'Next steps'}>
        <NextSteps
          items={
            zh
              ? [
                  { to: 'docs/installation', title: '安装', description: '安装包、引入样式，跑通第一个组件。' },
                  { to: 'docs/cli', title: 'CLI', description: '把组件源码拷进项目，自由修改。' },
                  { to: 'components', title: '浏览组件', description: '查看实时预览、调参并复制代码。' },
                ]
              : [
                  {
                    to: 'docs/installation',
                    title: 'Installation',
                    description: 'Install a package, import the styles and render your first component.',
                  },
                  { to: 'docs/cli', title: 'CLI', description: 'Copy component source into your project and own it.' },
                  {
                    to: 'components',
                    title: 'Browse components',
                    description: 'Live previews, tweakable props and copy-ready code.',
                  },
                ]
          }
        />
      </DocSection>
    </>
  );
}

export const introPage: DocPage = {
  slug: '',
  group: 'start',
  title: { zh: '介绍', en: 'Introduction' },
  description: {
    zh: '了解 Elyri 的分区、包与两种使用方式。',
    en: 'Learn how Elyri is organised into sections and packages, and the two ways to use it.',
  },
  Component: Intro,
};
