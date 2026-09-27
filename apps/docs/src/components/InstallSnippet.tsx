import { installCommand } from '../lib/code';
import { packageManagers, usePackageManager } from '../lib/hooks/usePackageManager';
import { useI18n } from '../lib/i18n';
import type { PackageManager } from '../lib/types';

import { CodeBlock } from './CodeBlock';

const ITEMS = packageManagers.map((manager) => ({ value: manager, label: manager }));

/** 安装命令代码块，包管理器可在 pnpm / npm / yarn / bun 间切换 */
export function InstallSnippet() {
  const { t } = useI18n();
  const [manager, setManager] = usePackageManager();

  return (
    <CodeBlock
      title="Terminal"
      code={installCommand(manager)}
      switcher={{
        label: t('code.packageManager'),
        value: manager,
        items: ITEMS,
        onChange: (value) => setManager(value as PackageManager),
      }}
    />
  );
}
