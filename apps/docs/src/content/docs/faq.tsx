import type { ReactNode } from 'react';

import { CodeBlock } from '../../components/CodeBlock';
import { useI18n } from '../../lib/i18n';
import { Link } from '../../lib/router';
import { site } from '../../lib/site';
import type { DocPage } from '../../lib/types';

import { DocSection } from './prose';

const NEXT_CLIENT = `'use client';

import { Aurora } from '@elyri/motion';

export function HeroBackground() {
  return <Aurora />;
}`;

interface Faq {
  id: string;
  question: string;
  answer: ReactNode;
}

function useFaqs(): Faq[] {
  const { lang } = useI18n();

  if (lang === 'zh') {
    return [
      {
        id: 'import-or-copy',
        question: '从包导入还是用 CLI 拷贝？',
        answer: (
          <p>
            不打算改源码就从包导入，升级只需更新版本；需要深度定制就用 CLI 拷贝，源码归你所有。两种方式可以混用，详见
            <Link to="docs">介绍</Link>。
          </p>
        ),
      },
      {
        id: 'missing-styles',
        question: '组件没有样式，或动画时长不对？',
        answer: (
          <p>
            检查是否在入口引入了 <code>@elyri/motion/styles.css</code>（UI 组件为 <code>@elyri/ui/styles.css</code>
            ）。它定义了组件依赖的全局变量，缺失时时长、配色等会失效。
          </p>
        ),
      },
      {
        id: 'nextjs',
        question: '能在 Next.js App Router 中使用吗？',
        answer: (
          <>
            <p>
              可以。组件使用了 hooks 与浏览器 API，需要在客户端组件中渲染：在使用它们的文件顶部加上{' '}
              <code>'use client'</code>，或者给 CLI 拷贝出来的组件文件加上。
            </p>
            <CodeBlock title="HeroBackground.tsx" code={NEXT_CLIENT} />
          </>
        ),
      },
      {
        id: 'update-copied',
        question: '如何更新用 CLI 拷贝的组件？',
        answer: (
          <p>
            先把包升级到最新版本，再执行 <code>elyri add &lt;组件&gt; --overwrite</code>。覆盖会丢弃本地修改，建议先提交，再用
            diff 把需要的改动合并回来。
          </p>
        ),
      },
      {
        id: 'react-version',
        question: '支持哪些 React 版本？',
        answer: <p>React 18 与 19。</p>,
      },
      {
        id: 'performance',
        question: '页面上放多个 WebGL 背景会卡吗？',
        answer: (
          <p>
            离开视口的背景会暂停渲染，后台标签页也会暂停，因此只有可见的背景在消耗 GPU。仍建议同一屏只放一个重型背景，并在移动端适当降低
            参数（如速度、密度）。
          </p>
        ),
      },
      {
        id: 'contribute',
        question: '发现问题或想要新组件？',
        answer: (
          <p>
            欢迎在{' '}
            <a href={site.github} target="_blank" rel="noreferrer">
              GitHub 仓库
            </a>{' '}
            提交 Issue 或 Pull Request。
          </p>
        ),
      },
    ];
  }

  return [
    {
      id: 'import-or-copy',
      question: 'Should I import from the package or copy with the CLI?',
      answer: (
        <p>
          Import from the package if you do not need to change the source — upgrades are a version bump. Copy with the
          CLI when you need deep customisation and want to own the code. You can mix both; see the{' '}
          <Link to="docs">introduction</Link>.
        </p>
      ),
    },
    {
      id: 'missing-styles',
      question: 'Components have no styles, or timings look wrong?',
      answer: (
        <p>
          Make sure your entry imports <code>@elyri/motion/styles.css</code> (or <code>@elyri/ui/styles.css</code> for UI
          components). It defines the global variables components rely on.
        </p>
      ),
    },
    {
      id: 'nextjs',
      question: 'Does it work with the Next.js App Router?',
      answer: (
        <>
          <p>
            Yes. Components use hooks and browser APIs, so render them from client components: add{' '}
            <code>'use client'</code> to the file that uses them, or to the copied component file.
          </p>
          <CodeBlock title="HeroBackground.tsx" code={NEXT_CLIENT} />
        </>
      ),
    },
    {
      id: 'update-copied',
      question: 'How do I update a component copied with the CLI?',
      answer: (
        <p>
          Upgrade the package to the latest version, then run <code>elyri add &lt;component&gt; --overwrite</code>.
          Overwriting discards local edits, so commit first and merge your changes back with a diff.
        </p>
      ),
    },
    {
      id: 'react-version',
      question: 'Which React versions are supported?',
      answer: <p>React 18 and 19.</p>,
    },
    {
      id: 'performance',
      question: 'Will several WebGL backgrounds slow the page down?',
      answer: (
        <p>
          Backgrounds pause when offscreen or in a background tab, so only visible ones use the GPU. Still, keep one
          heavy background per screen and consider lighter settings (speed, density) on mobile.
        </p>
      ),
    },
    {
      id: 'contribute',
      question: 'Found a bug or want a new component?',
      answer: (
        <p>
          Open an issue or pull request on the{' '}
          <a href={site.github} target="_blank" rel="noreferrer">
            GitHub repository
          </a>
          .
        </p>
      ),
    },
  ];
}

function FaqPage() {
  const faqs = useFaqs();
  return (
    <>
      {faqs.map((faq) => (
        <DocSection key={faq.id} id={faq.id} title={faq.question}>
          {faq.answer}
        </DocSection>
      ))}
    </>
  );
}

export const faqPage: DocPage = {
  slug: 'faq',
  group: 'guides',
  title: { zh: '常见问题', en: 'FAQ' },
  description: {
    zh: '样式缺失、Next.js、组件更新与性能等常见问题。',
    en: 'Answers about missing styles, Next.js, updating components and performance.',
  },
  Component: FaqPage,
};
