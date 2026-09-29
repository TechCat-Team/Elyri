import { Aurora } from '@elyri/motion';
import type { AuroraProps } from '@elyri/motion';

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
