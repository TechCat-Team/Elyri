import { useEffect, useState } from 'react';

import { useI18n } from '../lib/i18n';
import { docPkg } from '../lib/sections';
import type { ComponentDoc, ComponentExample } from '../lib/types';

import { CodeBlock } from './CodeBlock';
import { InstallSnippet } from './InstallSnippet';

const iconProps = {
  width: 15,
  height: 15,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/** 单个示例卡片：预览 + 底部工具栏 + 可展开的代码面板，三者一体 */
function ExampleCard({ example, id }: { example: ComponentExample; id: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(example.code);
    setCopied(true);
  };

  const codeId = `${id}-code`;
  const copyLabel = copied ? t('code.copied') : t('code.copy');

  return (
    <section className="ui-example" id={id} aria-labelledby={`${id}-title`}>
      <div className="ui-example-head">
        <h3 className="ui-example-title" id={`${id}-title`}>
          <a href={`#${id}`} className="ui-example-anchor">
            {example.title}
            <span aria-hidden="true">#</span>
          </a>
        </h3>
        {example.description && <p className="ui-example-desc">{example.description}</p>}
      </div>

      <div className={open ? 'ui-example-card is-open' : 'ui-example-card'}>
        <div className={example.wide ? 'ui-example-preview is-wide' : 'ui-example-preview'}>{example.render()}</div>

        <div className="ui-example-bar">
          <button
            type="button"
            className="ui-example-toggle"
            aria-expanded={open}
            aria-controls={codeId}
            onClick={() => setOpen((value) => !value)}
          >
            <svg {...iconProps}>
              <path d="m8 7-5 5 5 5" />
              <path d="m16 7 5 5-5 5" />
            </svg>
            {open ? t('page.hideCode') : t('page.showCode')}
            <svg {...iconProps} width={13} height={13} className="ui-example-caret">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          <button
            type="button"
            className={copied ? 'ui-example-copy is-copied' : 'ui-example-copy'}
            aria-label={copyLabel}
            title={copyLabel}
            onClick={handleCopy}
          >
            {copied ? (
              <svg {...iconProps}>
                <path d="m5 13 4 4L19 7" />
              </svg>
            ) : (
              <svg {...iconProps}>
                <rect x="9" y="9" width="11" height="11" rx="2.5" />
                <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-8A2.5 2.5 0 0 1 5.5 3h8A1.5 1.5 0 0 1 15 4.5V5" />
              </svg>
            )}
            <span>{copyLabel}</span>
          </button>
        </div>

        <div className="ui-example-code" id={codeId} inert={!open}>
          <div className="ui-example-code-inner">
            <CodeBlock code={example.code} />
          </div>
        </div>
      </div>
    </section>
  );
}

interface UiExamplesProps {
  doc: ComponentDoc;
  examples: ComponentExample[];
}

/** 示例锚点 id，组件页右侧目录也用它 */
export const exampleId = (index: number) => `example-${index + 1}`;

/** UI 组件的示例画廊：安装 + 示例目录 + 逐条示例卡片 */
export function UiExamples({ doc, examples }: UiExamplesProps) {
  const { t } = useI18n();
  const ids = examples.map((_, index) => exampleId(index));

  return (
    <div className="ui-gallery">
      <section className="section ui-anchor" id="installation">
        <h2 className="section-title">{t('page.install')}</h2>
        <InstallSnippet component={doc.slug} pkg={docPkg(doc)} hideDependency />
      </section>

      <section className="ui-gallery-examples ui-anchor" id="examples">
        <div className="ui-gallery-head">
          <h2 className="section-title">{t('page.examples')}</h2>
          {examples.length > 1 && (
            <nav className="ui-gallery-index" aria-label={t('page.examples')}>
              {examples.map((example, index) => (
                <a key={ids[index]} href={`#${ids[index]}`} className="ui-gallery-chip">
                  {example.title}
                </a>
              ))}
            </nav>
          )}
        </div>

        {examples.map((example, index) => (
          <ExampleCard key={ids[index]} id={ids[index]} example={example} />
        ))}
      </section>
    </div>
  );
}
