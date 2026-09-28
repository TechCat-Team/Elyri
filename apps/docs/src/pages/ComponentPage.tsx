import { Suspense, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { CodeBlock } from '../components/CodeBlock';
import { Controls } from '../components/Controls';
import { InstallSnippet } from '../components/InstallSnippet';
import { useI18n } from '../lib/i18n';
import type { MessageKey } from '../lib/messages';
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
type Device = 'desktop' | 'tablet' | 'mobile';

const DEVICES: { value: Device; icon: ReactNode }[] = [
  {
    value: 'desktop',
    icon: (
      <>
        <rect x="2.5" y="3.5" width="19" height="13.5" rx="2" />
        <path d="M9 20.5h6M12 17v3.5" />
      </>
    ),
  },
  {
    value: 'tablet',
    icon: (
      <>
        <rect x="5" y="2.5" width="14" height="19" rx="2.5" />
        <path d="M11 18.5h2" />
      </>
    ),
  },
  {
    value: 'mobile',
    icon: (
      <>
        <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
        <path d="M11 18.5h2" />
      </>
    ),
  },
];

const defaultsOf = (doc: ComponentDoc): ControlValues =>
  Object.fromEntries((doc.controls ?? []).map((control) => [control.name, control.default]));

export function ComponentPage({ doc, prev, next }: ComponentPageProps) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('preview');
  const [values, setValues] = useState(() => defaultsOf(doc));
  const [codeLang, setCodeLang] = useState<CodeLang>('ts');
  const [replayKey, setReplayKey] = useState(0);
  const [deviceView, setDeviceView] = useState<Device>('desktop');

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

      <div className="tabs-row">
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

        <div className="preview-toolbar">
          <div className="device-switch" role="group" aria-label={t('preview.device')}>
            {DEVICES.map((device) => (
              <button
                key={device.value}
                type="button"
                aria-label={t(`preview.${device.value}` as MessageKey)}
                aria-pressed={deviceView === device.value}
                className={deviceView === device.value ? 'is-active' : undefined}
                onClick={() => setDeviceView(device.value)}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                >
                  {device.icon}
                </svg>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="preview-replay"
            aria-label={t('page.replay')}
            onClick={() => setReplayKey((k) => k + 1)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span className="preview-replay-label">{t('page.replay')}</span>
          </button>
        </div>
      </div>

      {tab === 'preview' ? (
        <>
          <div className="preview-box">
            <div key={replayKey} className={`preview-stage is-${deviceView}`}>
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
