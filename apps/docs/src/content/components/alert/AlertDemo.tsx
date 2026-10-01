import { useState } from 'react';

import { Alert } from '@elyri/ui';

const VARIANTS = ['info', 'success', 'warning', 'danger'] as const;

export interface AlertDemoProps {
  variant: (typeof VARIANTS)[number];
  title: string;
  closable: boolean;
  bordered: boolean;
  accent: boolean;
}

export default function AlertDemo({ variant, title, closable, bordered, accent }: AlertDemoProps) {
  const [visible, setVisible] = useState(true);
  const others = VARIANTS.filter((item) => item !== variant);

  return (
    <div className="demo-ui-stack">
      <Alert variant={variant} title={title} bordered={bordered} accent={accent}>
        Section, package and usage notes all live in the docs.
      </Alert>

      {closable && visible && (
        <Alert variant="success" title="Saved" onClose={() => setVisible(false)}>
          Your changes have been stored.
        </Alert>
      )}

      {others.map((item) => (
        <Alert key={item} variant={item} title={`${item[0].toUpperCase()}${item.slice(1)}`}>
          A short supporting message.
        </Alert>
      ))}
    </div>
  );
}
