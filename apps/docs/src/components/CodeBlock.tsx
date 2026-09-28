import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { highlight } from '../lib/code';
import { useI18n } from '../lib/i18n';

/** 头部右侧的分段切换（TS/JS、包管理器等） */
export interface CodeSwitcher {
  label: string;
  value: string;
  items: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

/** 头部右侧的图标按钮（如在线编辑开关） */
export interface CodeBlockAction {
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick: () => void;
}

interface CodeBlockProps {
  code: string;
  title?: string;
  switcher?: CodeSwitcher;
  actions?: CodeBlockAction[];
  /** 传入后替换默认的高亮代码区，例如换成可编辑的编辑器 */
  children?: ReactNode;
}

export function CodeBlock({ code, title, switcher, actions, children }: CodeBlockProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const html = useMemo(() => highlight(code), [code]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
  };

  const copyLabel = copied ? t('code.copied') : t('code.copy');

  return (
    <div className="code-block">
      <div className="code-block-head">
        <span className="code-block-title">{title}</span>

        <div className="code-block-actions">
          {switcher && (
            <div className="code-switch" role="group" aria-label={switcher.label}>
              {switcher.items.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={item.value === switcher.value}
                  className={item.value === switcher.value ? 'code-switch-item is-active' : 'code-switch-item'}
                  onClick={() => switcher.onChange(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {actions?.map((action) => (
            <button
              key={action.label}
              type="button"
              aria-label={action.label}
              aria-pressed={action.active}
              title={action.label}
              className={action.active ? 'code-icon-button is-active' : 'code-icon-button'}
              onClick={action.onClick}
            >
              {action.icon}
            </button>
          ))}

          <button type="button" className="code-copy" aria-label={copyLabel} title={copyLabel} onClick={handleCopy}>
            {copied ? (
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
                <path d="m5 13 4 4L19 7" />
              </svg>
            ) : (
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
                <rect x="9" y="9" width="11" height="11" rx="2.5" />
                <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-8A2.5 2.5 0 0 1 5.5 3h8A1.5 1.5 0 0 1 15 4.5V5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {children ?? (
        <pre>
          <code dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
      )}
    </div>
  );
}
