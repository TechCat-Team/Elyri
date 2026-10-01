import { CodeBlock } from '../../components/CodeBlock';
import { addCommand, installCommand, PACKAGE_NAMES } from '../../lib/code';
import { useI18n } from '../../lib/i18n';
import type { DocPage } from '../../lib/types';

import { Callout, CommandBlock, DocSection, NextSteps } from './prose';

const PACKAGE_USAGE = `import { GradientText } from '@elyri/motion';
import { Button } from '@elyri/ui';

export function Hero() {
  return (
    <>
      <GradientText>Hello Elyri</GradientText>
      <Button>Get started</Button>
    </>
  );
}`;

const LOCAL_USAGE = `// CLI 默认写入 src/components/elyri（配置了 @/* 别名时写入别名对应目录）
import { GradientText } from './components/elyri/GradientText';

export function Hero() {
  return <GradientText>Hello Elyri</GradientText>;
}`;

const LOCAL_USAGE_EN = LOCAL_USAGE.replace(
  '// CLI 默认写入 src/components/elyri（配置了 @/* 别名时写入别名对应目录）',
  '// The CLI writes to src/components/elyri by default (or under your @/* alias)',
);

const STYLES = `// main.tsx：只引入用到的包
import '@elyri/motion/styles.css';
import '@elyri/ui/styles.css';`;

const STYLES_EN = STYLES.replace('// main.tsx：只引入用到的包', '// main.tsx: import only the packages you use');

function Installation() {
  const { lang } = useI18n();
  const zh = lang === 'zh';

  return (
    <>
      <DocSection id="requirements" title={zh ? '环境要求' : 'Requirements'}>
        <ul>
          {zh ? (
            <>
              <li>
                React 18 或 19（<code>react</code>、<code>react-dom</code> 为 peer dependency）。
              </li>
              <li>任意打包工具：Vite、Next.js、Remix 等，需要支持导入 CSS 文件。</li>
              <li>TypeScript 可选；包内自带类型声明，CLI 拷贝的是 TSX 源码。</li>
            </>
          ) : (
            <>
              <li>
                React 18 or 19 (<code>react</code> and <code>react-dom</code> are peer dependencies).
              </li>
              <li>Any bundler that can import CSS files: Vite, Next.js, Remix and so on.</li>
              <li>TypeScript is optional. Packages ship type declarations; the CLI copies TSX source.</li>
            </>
          )}
        </ul>
      </DocSection>

      <DocSection id="install" title={zh ? '1. 安装包' : '1. Install a package'}>
        <p>
          {zh
            ? '组件属于哪个分区，就安装哪个包。即使打算用 CLI 拷贝源码，也需要先安装：拷出来的组件会从包里导入共享的运行时（hooks 与工具函数）。'
            : 'Install the package of the section a component belongs to. You need it even if you plan to copy source with the CLI: copied components import the shared runtime (hooks and utilities) from the package.'}
        </p>
        <div className="install-steps">
          <CommandBlock title={`${PACKAGE_NAMES.motion}`} command={(manager) => installCommand(manager, 'motion')} />
          <CommandBlock title={`${PACKAGE_NAMES.ui}`} command={(manager) => installCommand(manager, 'ui')} />
        </div>
      </DocSection>

      <DocSection id="styles" title={zh ? '2. 引入样式' : '2. Import the styles'}>
        <p>
          {zh ? (
            <>
              在应用入口引入一次 <code>styles.css</code>。它定义了全局的设计变量（时长、缓动、配色等），组件自身的样式随组件一起加载。
            </>
          ) : (
            <>
              Import <code>styles.css</code> once at your app entry. It defines the global design tokens (durations,
              easings, colours); each component loads its own styles alongside it.
            </>
          )}
        </p>
        <CodeBlock title="main.tsx" code={zh ? STYLES : STYLES_EN} />
      </DocSection>

      <DocSection id="use" title={zh ? '3. 使用组件' : '3. Use a component'}>
        <h3 className="doc-subtitle">{zh ? '方式一：从包导入' : 'Option A: import from the package'}</h3>
        <p>
          {zh
            ? '最快的方式，适合不需要修改源码的场景。'
            : 'The quickest route when you do not need to change the source.'}
        </p>
        <CodeBlock title="Hero.tsx" code={PACKAGE_USAGE} />

        <h3 className="doc-subtitle">{zh ? '方式二：用 CLI 拷贝源码' : 'Option B: copy the source with the CLI'}</h3>
        <p>
          {zh
            ? '组件源码会进入你的项目，之后可以随意修改。可以一次添加多个组件。'
            : 'The component source lands in your project, ready to edit. You can add several components at once.'}
        </p>
        <CommandBlock command={(manager) => addCommand(manager, 'gradient-text')} />
        <CodeBlock title="Hero.tsx" code={zh ? LOCAL_USAGE : LOCAL_USAGE_EN} />
        <Callout>
          {zh ? (
            <>
              每个组件页的「代码」标签都给出了对应的安装命令与用法，参数调好后可以直接复制。
            </>
          ) : (
            <>Every component page has a Code tab with its install command and usage, reflecting the props you tuned.</>
          )}
        </Callout>
      </DocSection>

      <DocSection id="next" title={zh ? '下一步' : 'Next steps'}>
        <NextSteps
          items={
            zh
              ? [
                  { to: 'docs/cli', title: 'CLI', description: '目标目录、覆盖与常见报错。' },
                  { to: 'docs/theming', title: '主题定制', description: '用 CSS 变量调整配色、时长与缓动。' },
                ]
              : [
                  { to: 'docs/cli', title: 'CLI', description: 'Target directories, overwriting and common errors.' },
                  {
                    to: 'docs/theming',
                    title: 'Theming',
                    description: 'Adjust colours, durations and easings with CSS variables.',
                  },
                ]
          }
        />
      </DocSection>
    </>
  );
}

export const installationPage: DocPage = {
  slug: 'installation',
  group: 'start',
  title: { zh: '安装', en: 'Installation' },
  description: {
    zh: '安装包、引入样式，然后从包导入组件或用 CLI 拷贝源码。',
    en: 'Install a package, import the styles, then import components or copy their source with the CLI.',
  },
  Component: Installation,
};
