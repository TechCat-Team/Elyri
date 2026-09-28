import { BrushedMetal } from 'elyri';
import type { BrushedMetalProps } from 'elyri';

import { BackgroundHero } from '../BackgroundHero';

export interface BrushedMetalDemoProps extends BrushedMetalProps {
  text: string;
}

export default function BrushedMetalDemo({ text, ...props }: BrushedMetalDemoProps) {
  return (
    <BrushedMetal className="demo-background" {...props}>
      <BackgroundHero title={text} slug="brushed-metal" accent={props.color ?? '#c3c7cf'} />
    </BrushedMetal>
  );
}
