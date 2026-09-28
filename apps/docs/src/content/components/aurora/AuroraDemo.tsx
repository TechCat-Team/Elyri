import { Aurora } from 'elyri';
import type { AuroraProps } from 'elyri';

import { BackgroundHero } from '../BackgroundHero';

export interface AuroraDemoProps extends AuroraProps {
  text: string;
}

export default function AuroraDemo({ text, ...props }: AuroraDemoProps) {
  return (
    <Aurora className="demo-background" {...props}>
      <BackgroundHero title={text} slug="aurora" accent={props.colors?.[1] ?? '#2a8cff'} />
    </Aurora>
  );
}
