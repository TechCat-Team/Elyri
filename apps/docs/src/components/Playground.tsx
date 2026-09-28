import { useContext, useState } from 'react';
import { LiveContext, LiveEditor, LiveError, LivePreview, LiveProvider } from 'react-live';
import * as elyri from 'elyri';

import { CodeBlock } from './CodeBlock';
import type { CodeBlockAction, CodeSwitcher } from './CodeBlock';
import { toPlaygroundCode } from '../lib/code';
import { useI18n } from '../lib/i18n';

/** 编辑器作用域：整个组件库，用户代码里可直接使用组件与工具函数 */
const scope = { ...elyri };

/**
 * 编辑器配色复用文档站的高亮变量，与只读代码块保持一致，并跟随明暗主题。
 * 背景设为透明，让代码块自身的主题背景透出来。
 */
const codeTheme = {
  plain: {
    color: 'var(--docs-text)',
    backgroundColor: 'transparent',
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: { color: 'var(--tok-comment)', fontStyle: 'italic' as const },
    },
    { types: ['string', 'char', 'attr-value'], style: { color: 'var(--tok-string)' } },
    { types: ['tag', 'selector', 'function', 'class-name'], style: { color: 'var(--tok-tag)' } },
    { types: ['keyword', 'atrule'], style: { color: 'var(--tok-keyword)' } },
    { types: ['number', 'boolean', 'constant', 'symbol'], style: { color: 'var(--tok-number)' } },
    { types: ['attr-name'], style: { color: 'var(--tok-attr)' } },
  ],
};

const codeIcon = (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

/**
 * 可编辑代码区：变更先转交给 react-live 触发重新编译，
 * 同时把当前内容汇报给上层，供复制按钮取到最新代码。
 */
function LiveCodeEditor({ onCodeChange }: { onCodeChange: (code: string) => void }) {
  const live = useContext(LiveContext);

  return (
    <LiveEditor
      className="playground-editor"
      onChange={(value) => {
        live.onChange(value);
        onCodeChange(value);
      }}
    />
  );
}

interface PlaygroundProps {
  /** 用法代码（含 import），点击头部图标后可编辑 */
  code: string;
  title?: string;
  switcher?: CodeSwitcher;
}

/**
 * 用法代码块：默认是只读的高亮代码，点击头部的代码图标后变为可编辑状态，
 * 并在下方实时预览。依赖浏览器内的编译器，只在客户端挂载后加载。
 */
export function Playground({ code, title, switcher }: PlaygroundProps) {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(code);
  const [resetKey, setResetKey] = useState(0);

  const toggleEdit = () => {
    if (!editing) setCurrent(code);
    setEditing((value) => !value);
  };

  const reset = () => {
    setCurrent(code);
    setResetKey((key) => key + 1);
  };

  const actions: CodeBlockAction[] = [{ label: t('code.edit'), icon: codeIcon, active: editing, onClick: toggleEdit }];

  if (!editing) {
    return <CodeBlock code={code} title={title} switcher={switcher} actions={actions} />;
  }

  return (
    <LiveProvider key={resetKey} code={code} scope={scope} noInline theme={codeTheme} transformCode={toPlaygroundCode}>
      <CodeBlock code={current} title={title} switcher={switcher} actions={actions}>
        <LiveCodeEditor onCodeChange={setCurrent} />
      </CodeBlock>

      <div className="playground-result">
        <div className="playground-result-head">
          <span className="playground-hint">{t('page.playgroundHint')}</span>
          <button type="button" className="ghost-button" onClick={reset}>
            {t('page.reset')}
          </button>
        </div>
        <div className="playground-preview">
          <LivePreview />
        </div>
        <LiveError className="playground-error" />
      </div>
    </LiveProvider>
  );
}
