import { Suspense, lazy, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';

import { CodeBlock } from '../components/CodeBlock';
import { Controls } from '../components/Controls';
import { InstallSnippet } from '../components/InstallSnippet';
import { Pager } from '../components/Pager';
import { useI18n } from '../lib/i18n';
import type { MessageKey } from '../lib/messages';
import { docPath, docPkg } from '../lib/sections';
import type { CodeLang, ComponentDoc, ControlValue, ControlValues } from '../lib/types';

// 在线编辑器依赖浏览器内的 JSX 编译器，按需加载且只在客户端挂载
const Playground = lazy(() => import('../components/Playground').then((module) => ({ default: module.Playground })));

/** 服务端渲染返回 false，水合后再切到 true，用于只在客户端渲染的内容 */
const subscribeToNothing = () => () => {};
const isClient = () => true;
const isServer = () => false;

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
  const [heroVisible, setHeroVisible] = useState(true);
  // 在线编辑器只在客户端挂载，避免预渲染时执行浏览器内的编译器
  const mounted = useSyncExternalStore(subscribeToNothing, isClient, isServer);
  const tabsRef = useRef<HTMLDivElement>(null);

  // 滑动下划线：测量当前激活标签的位置与宽度，写入 CSS 变量
  useEffect(() => {
    const tabs = tabsRef.current;
    if (!tabs) return;
    const update = () => {
      const active = tabs.querySelector<HTMLElement>('.tab.is-active');
      if (!active) return;
      tabs.style.setProperty('--tab-x', `${active.offsetLeft}px`);
      tabs.style.setProperty('--tab-w', `${active.offsetWidth}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(tabs);
    return () => observer.disconnect();
  }, [tab]);

  const usage = useMemo(() => doc.usage(values, codeLang), [doc, values, codeLang]);
  const hasControls = Boolean(doc.controls?.length);

  const usageTitle = codeLang === 'ts' ? 'Usage.tsx' : 'Usage.jsx';
  const usageSwitcher = {
    label: t('code.language'),
    value: codeLang,
    items: LANG_ITEMS,
    onChange: (value: string) => setCodeLang(value as CodeLang),
  };
  // 服务端渲染与编辑器加载期间都退回静态代码块，保证首屏有内容
  const staticUsage = <CodeBlock title={usageTitle} code={usage} switcher={usageSwitcher} />;

  const handleChange = (name: string, value: ControlValue) => {
    setValues((current) => ({ ...current, [name]: value, ...doc.linkedValues?.(name, value) }));
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
        <div className="tabs" role="tablist" ref={tabsRef}>
          {(['preview', 'code'] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={tab === key ? 'tab is-active' : 'tab'}
              onClick={() => setTab(key)}
            >
              {t(key === 'preview' ? 'page.preview' : 'page.code')}
            </button>
          ))}
          <span className="tab-underline" aria-hidden="true" />
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

          {doc.hero && (
            <div className="preview-hero-toggle">
              <span>{t('preview.hero')}</span>
              <button
                type="button"
                role="switch"
                aria-checked={heroVisible}
                aria-label={t('preview.hero')}
                className={heroVisible ? 'switch is-on' : 'switch'}
                onClick={() => setHeroVisible((value) => !value)}
              >
                <span className="switch-thumb" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div key={tab} className="tab-panel">
        {tab === 'preview' ? (
          <>
            <div className="preview-box">
              <div
                key={replayKey}
                className={`preview-stage is-${deviceView}${doc.hero && !heroVisible ? ' is-hero-hidden' : ''}`}
              >
                <Suspense fallback={<div className="demo-fallback" />}>{doc.render(values)}</Suspense>
              </div>
            </div>

            {hasControls && (
              <section className="section">
                <div className="section-head">
                  <h2 className="section-title">{t('page.customize')}</h2>
                  <button type="button" className="ghost-button" onClick={handleReset}>
                    {t('page.resetControls')}
                  </button>
                </div>
                <Controls controls={doc.controls ?? []} values={values} onChange={handleChange} />
              </section>
            )}
          </>
        ) : (
          <div className="code-stack">
            <h2 className="section-title">{t('page.install')}</h2>
            <InstallSnippet component={doc.slug} pkg={docPkg(doc)} />
            <h2 className="section-title">{t('page.usage')}</h2>
            {mounted ? (
              <Suspense fallback={staticUsage}>
                <Playground key={codeLang} title={usageTitle} code={usage} switcher={usageSwitcher} />
              </Suspense>
            ) : (
              staticUsage
            )}
          </div>
        )}
      </div>

      <section className="section">
        <h2 className="section-title">{t('page.props')}</h2>
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

      <Pager
        prev={prev && { path: docPath(prev), title: prev.title }}
        next={next && { path: docPath(next), title: next.title }}
      />
    </article>
  );
}
