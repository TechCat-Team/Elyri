import type { ReactNode } from 'react';

import { CodeBlock } from '../../components/CodeBlock';
import { packageManagers, usePackageManager } from '../../lib/hooks/usePackageManager';
import { useI18n } from '../../lib/i18n';
import { Link } from '../../lib/router';
import type { PackageManager } from '../../lib/types';

/** 带锚点的二级标题，便于直接分享到某一节 */
export function DocSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="doc-section" id={id}>
      <h2 className="section-title doc-heading">
        <a className="doc-anchor" href={`#${id}`} aria-label={title}>
          #
        </a>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return <div className="doc-callout">{children}</div>;
}

export function DocTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="table-wrap">
      <table className="props-table">
        <thead>
          <tr>
            {head.map((cell) => (
              <th key={cell}>{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const MANAGER_ITEMS = packageManagers.map((manager) => ({ value: manager, label: manager }));

/** 随包管理器切换的命令，选择全站共享并持久化 */
export function CommandBlock({ title, command }: { title?: string; command: (manager: PackageManager) => string }) {
  const { t } = useI18n();
  const [manager, setManager] = usePackageManager();

  return (
    <CodeBlock
      title={title}
      code={command(manager)}
      switcher={{
        label: t('code.packageManager'),
        value: manager,
        items: MANAGER_ITEMS,
        onChange: (value) => setManager(value as PackageManager),
      }}
    />
  );
}

/** 文档末尾的「下一步」卡片 */
export function NextSteps({ items }: { items: { to: string; title: string; description: string }[] }) {
  return (
    <div className="doc-cards">
      {items.map((item) => (
        <Link key={item.to} className="doc-card" to={item.to}>
          <span className="doc-card-title">{item.title} →</span>
          <span className="doc-card-desc">{item.description}</span>
        </Link>
      ))}
    </div>
  );
}
