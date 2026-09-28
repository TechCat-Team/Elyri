import { Suspense, useMemo, useState } from 'react';

import { CodeBlock } from '../components/CodeBlock';
import { Controls } from '../components/Controls';
import { InstallSnippet } from '../components/InstallSnippet';
import { useI18n } from '../lib/i18n';
import type { CodeLang, ComponentDoc, ControlValue, ControlValues } from '../lib/types';

const LANG_ITEMS = [
  { value: 'ts', label: 'TS' },
  { value: 'js', label: 'JS' },
];

interface ComponentPageProps {
  doc: ComponentDoc;
  prev?: ComponentDoc;
  next?: ComponentDoc;
}

type Tab = 'preview' | 'code';

const defaultsOf = (doc: ComponentDoc): ControlValues =>
  Object.fromEntries((doc.controls ?? []).map((control) => [control.name, control.default]));

export function ComponentPage({ doc, prev, next }: ComponentPageProps) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('preview');
  const [values, setValues] = useState(() => defaultsOf(doc));
  const [codeLang, setCodeLang] = useState<CodeLang>('ts');
  const [replayKey, setReplayKey] = useState(0);

  const usage = useMemo(() => doc.usage(values, codeLang), [doc, values, codeLang]);
  const hasControls = Boolean(doc.controls?.length);

  const handleChange = (name: string, value: ControlValue) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleReset = () => {
    setValues(defaultsOf(doc));
    setReplayKey((k) => k + 1);
  };

  return (
    <article className="doc-page">
      <h1 className="page-title">{doc.title}</h1>
      <p className="page-description">{doc.description}</p>

      <div className="tabs" role="tablist">
        {(['preview', 'code'] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={tab === key ? 'tab is-active' : 'tab'}
            onClick={() => setTab(key)}
          >
            {key === 'preview' ? 'Preview' : 'Code'}
          </button>
        ))}
      </div>

      {tab === 'preview' ? (
        <>
          <div className="preview-box">
            <div className="preview-toolbar">
              <button
                type="button"
                className="icon-button"
                aria-label="重播动画"
                title="重播动画"
                onClick={() => setReplayKey((k) => k + 1)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
            </div>
            <div key={replayKey} className="preview-stage">
              <Suspense fallback={<div className="demo-fallback" />}>{doc.render(values)}</Suspense>
            </div>
          </div>

          {hasControls && (
            <section className="section">
              <div className="section-head">
                <h2 className="section-title">Customize</h2>
                <button type="button" className="ghost-button" onClick={handleReset}>
                  {t('page.reset')}
                </button>
              </div>
              <Controls controls={doc.controls ?? []} values={values} onChange={handleChange} />
            </section>
          )}
        </>
      ) : (
        <div className="code-stack">
          <h2 className="section-title">{t('page.install')}</h2>
          <InstallSnippet component={doc.slug} />
          <h2 className="section-title">{t('page.usage')}</h2>
          <CodeBlock
            title={codeLang === 'ts' ? 'Usage.tsx' : 'Usage.jsx'}
            code={usage}
            switcher={{
              label: t('code.language'),
              value: codeLang,
              items: LANG_ITEMS,
              onChange: (value) => setCodeLang(value as CodeLang),
            }}
          />
        </div>
      )}

      <section className="section">
        <h2 className="section-title">Props</h2>
        <div className="table-wrap">
          <table className="props-table">
            <thead>
              <tr>
                <th>{t('table.prop')}</th>
                <th>{t('table.type')}</th>
                <th>{t('table.default')}</th>
                <th>{t('table.description')}</th>
              </tr>
            </thead>
            <tbody>
              {doc.props.map((prop) => (
                <tr key={prop.name}>
                  <td>
                    <code className="prop-name">{prop.name}</code>
                  </td>
                  <td>
                    <code className="prop-type">{prop.type}</code>
                  </td>
                  <td>{prop.default ? <code>{prop.default}</code> : '—'}</td>
                  <td>{prop.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {doc.dependencies && doc.dependencies.length > 0 && (
        <section className="section">
          <h2 className="section-title">{t('page.dependencies')}</h2>
          <div className="dep-list">
            {doc.dependencies.map((dep) => (
              <span key={dep} className="dep-tag">
                {dep}
              </span>
            ))}
          </div>
        </section>
      )}

      <nav className="pager">
        {prev ? (
          <a href={`#/components/${prev.slug}`} className="pager-link">
            <span>{t('page.prev')}</span>
            {prev.title}
          </a>
        ) : (
          <span />
        )}
        {next && (
          <a href={`#/components/${next.slug}`} className="pager-link is-next">
            <span>{t('page.next')}</span>
            {next.title}
          </a>
        )}
      </nav>
    </article>
  );
}
