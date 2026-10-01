import { CodeBlock } from '../../components/CodeBlock';
import { addCommand } from '../../lib/code';
import { useI18n } from '../../lib/i18n';
import type { DocPage, PackageManager } from '../../lib/types';

import { Callout, CommandBlock, DocSection, DocTable } from './prose';

const LIST_COMMANDS: Record<PackageManager, string> = {
  pnpm: 'pnpm dlx elyri@latest list',
  npm: 'npx elyri@latest list',
  yarn: 'yarn dlx elyri@latest list',
  bun: 'bunx elyri@latest list',
};

const TREE = `src/components/elyri/
└── GradientText/
    ├── GradientText.css
    ├── GradientText.tsx
    └── index.ts`;

function Cli() {
  const { lang } = useI18n();
  const zh = lang === 'zh';

  return (
    <>
      <DocSection id="overview" title={zh ? '概览' : 'Overview'}>
        <p>
          {zh
            ? 'elyri CLI 负责把组件源码拷进你的项目。无需全局安装，通过包管理器的临时执行命令运行即可。'
            : 'The elyri CLI copies component source into your project. No global install is needed — run it through your package manager.'}
        </p>
        <Callout>
          {zh
            ? '运行前请先安装组件所属的包（如 @elyri/motion），CLI 从 node_modules 中读取源码。'
            : 'Install the package the component belongs to (e.g. @elyri/motion) first — the CLI reads source from node_modules.'}
        </Callout>
      </DocSection>

      <DocSection id="add" title="add">
        <p>
          {zh
            ? '添加一个或多个组件，名称即组件页 URL 中的标识（如 gradient-text）。'
            : 'Add one or more components. Names match the slug in each component page URL (e.g. gradient-text).'}
        </p>
        <CommandBlock command={(manager) => addCommand(manager, 'fade-in gradient-text')} />
        <p>{zh ? '每个组件会作为一个完整文件夹写入：' : 'Each component is written as a self-contained folder:'}</p>
        <CodeBlock title={zh ? '目录结构' : 'Output'} code={TREE} />
        <p>
          {zh ? (
            <>
              源码中对共享运行时的相对导入会被改写为 <code>@elyri/motion/core</code> 或 <code>@elyri/ui/core</code>
              ，因此拷出来的文件可以独立工作。
            </>
          ) : (
            <>
              Relative imports of the shared runtime are rewritten to <code>@elyri/motion/core</code> or{' '}
              <code>@elyri/ui/core</code>, so the copied files work on their own.
            </>
          )}
        </p>
      </DocSection>

      <DocSection id="list" title="list">
        <p>{zh ? '按包分组列出所有可添加的组件。' : 'List every available component, grouped by package.'}</p>
        <CommandBlock command={(manager) => LIST_COMMANDS[manager]} />
      </DocSection>

      <DocSection id="options" title={zh ? '选项' : 'Options'}>
        <DocTable
          head={zh ? ['选项', '说明'] : ['Option', 'Description']}
          rows={[
            [
              <code key="o">--dir, -d &lt;path&gt;</code>,
              zh ? '指定写入目录（相对当前目录），优先级最高。' : 'Target directory, relative to the current one. Takes priority.',
            ],
            [
              <code key="o">--overwrite, --force, -f</code>,
              zh ? '覆盖已存在的文件，不再询问。' : 'Replace existing files without asking.',
            ],
          ]}
        />
      </DocSection>

      <DocSection id="destination" title={zh ? '写入位置' : 'Where files go'}>
        <p>{zh ? '按以下顺序决定目标目录：' : 'The target directory is resolved in this order:'}</p>
        <ol>
          {zh ? (
            <>
              <li>
                传入了 <code>--dir</code>：使用该目录。
              </li>
              <li>
                <code>tsconfig.json</code> / <code>tsconfig.app.json</code> / <code>jsconfig.json</code> 中配置了{' '}
                <code>@/*</code>、<code>~/*</code> 或 <code>#/*</code> 别名：写入 <code>&lt;别名根目录&gt;/components/elyri</code>。
              </li>
              <li>
                项目有 <code>src/</code> 目录：写入 <code>src/components/elyri</code>。
              </li>
              <li>
                否则写入 <code>components/elyri</code>。
              </li>
            </>
          ) : (
            <>
              <li>
                <code>--dir</code> when given.
              </li>
              <li>
                An <code>@/*</code>, <code>~/*</code> or <code>#/*</code> alias in <code>tsconfig.json</code>,{' '}
                <code>tsconfig.app.json</code> or <code>jsconfig.json</code>: <code>&lt;alias root&gt;/components/elyri</code>.
              </li>
              <li>
                A <code>src/</code> directory: <code>src/components/elyri</code>.
              </li>
              <li>
                Otherwise <code>components/elyri</code>.
              </li>
            </>
          )}
        </ol>
      </DocSection>

      <DocSection id="conflicts" title={zh ? '已有文件' : 'Existing files'}>
        <p>
          {zh
            ? 'CLI 会先检查全部目标文件，只要有一个已存在就不写入任何文件。在终端中会询问是否覆盖；在 CI 等非交互环境中会直接退出，需要显式传入 --overwrite。'
            : 'The CLI checks every target before writing; if any file exists, nothing is written. In a terminal it asks whether to overwrite; in non-interactive environments such as CI it exits and expects --overwrite.'}
        </p>
        <Callout>
          {zh
            ? '覆盖会丢弃你对该组件做过的修改，建议先提交到版本控制。'
            : 'Overwriting discards your local edits to that component — commit them first.'}
        </Callout>
      </DocSection>

      <DocSection id="errors" title={zh ? '常见报错' : 'Common errors'}>
        <DocTable
          head={zh ? ['报错', '处理'] : ['Error', 'Fix']}
          rows={[
            [
              <code key="e">Missing @elyri/motion</code>,
              zh ? '包还没安装，按提示的命令安装后重试。' : 'The package is not installed. Run the suggested command and retry.',
            ],
            [
              <code key="e">@elyri/motion@x does not ship …</code>,
              zh
                ? '已安装的包版本过旧，不包含该组件，升级到 @latest。'
                : 'The installed version predates this component. Upgrade to @latest.',
            ],
            [
              <code key="e">Unknown component: …</code>,
              zh ? '名称拼写有误，运行 list 查看可用名称。' : 'Misspelled name. Run list to see valid names.',
            ],
          ]}
        />
        <p>
          {zh
            ? '报错中给出的安装命令会根据你使用的包管理器（运行环境或锁文件）自动调整。'
            : 'Suggested commands match your package manager, detected from the runtime or your lockfile.'}
        </p>
      </DocSection>
    </>
  );
}

export const cliPage: DocPage = {
  slug: 'cli',
  group: 'start',
  title: { zh: 'CLI', en: 'CLI' },
  description: {
    zh: '用 elyri CLI 把组件源码拷进项目：命令、选项、写入位置与常见报错。',
    en: 'Copy component source into your project with the elyri CLI: commands, options, destinations and errors.',
  },
  Component: Cli,
};
