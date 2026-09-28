import { Velvet } from 'elyri';
import type { VelvetProps } from 'elyri';

import { BackgroundHero } from '../BackgroundHero';

export interface VelvetDemoProps extends VelvetProps {
  text: string;
}

export default function VelvetDemo({ text, ...props }: VelvetDemoProps) {
  return (
    <Velvet className="demo-background" {...props}>
      <BackgroundHero title={text} slug="velvet" accent={props.sheenColor ?? '#ffb3c8'} />
    </Velvet>
  );
}
