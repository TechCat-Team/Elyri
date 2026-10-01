import { addCommand, installCommand } from '../lib/code';
import { packageManagers, usePackageManager } from '../lib/hooks/usePackageManager';
import { useI18n } from '../lib/i18n';
import type { PackageManager, Pkg } from '../lib/types';

import { CodeBlock } from './CodeBlock';

const ITEMS = packageManagers.map((manager) => ({ value: manager, label: manager }));

const DEFAULT_COMPONENT = 'gradient-text';

interface InstallSnippetProps {
  component?: string;
  /** 组件所属分区，决定要安装哪个包 */
  pkg?: Pkg;
  /** 只展示「添加组件」，隐藏「安装依赖」（UI 组件页用） */
  hideDependency?: boolean;
}

/** 安装流程：先装对应分区的包，再把组件源码添加进项目。两个块共用包管理器选择 */
export function InstallSnippet({
  component = DEFAULT_COMPONENT,
  pkg = 'motion',
  hideDependency = false,
}: InstallSnippetProps) {
  const { t } = useI18n();
  const [manager, setManager] = usePackageManager();

  const switcher = {
    label: t('code.packageManager'),
    value: manager,
    items: ITEMS,
    onChange: (value: string) => setManager(value as PackageManager),
  };

  return (
    <div className="install-steps">
      {!hideDependency && (
        <CodeBlock title={t('install.dependency')} code={installCommand(manager, pkg)} switcher={switcher} />
      )}
      <CodeBlock title={t('install.component')} code={addCommand(manager, component)} switcher={switcher} />
    </div>
  );
}
