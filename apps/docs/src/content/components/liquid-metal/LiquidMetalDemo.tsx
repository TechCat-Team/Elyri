import { LiquidMetal } from 'elyri';
import type { LiquidMetalProps } from 'elyri';

import { BackgroundHero } from '../BackgroundHero';

export interface LiquidMetalDemoProps extends LiquidMetalProps {
  text: string;
}

export default function LiquidMetalDemo({ text, ...props }: LiquidMetalDemoProps) {
  return (
    <LiquidMetal className="demo-background" {...props}>
      <BackgroundHero title={text} slug="liquid-metal" accent={props.color ?? '#c9ced6'} />
    </LiquidMetal>
  );
}
