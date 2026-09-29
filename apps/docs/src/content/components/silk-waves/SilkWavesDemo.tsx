import { SilkWaves } from '@elyri/motion';
import type { SilkWavesProps } from '@elyri/motion';

import { BackgroundHero } from '../BackgroundHero';

export interface SilkWavesDemoProps extends SilkWavesProps {
  text: string;
}

export default function SilkWavesDemo({ text, ...props }: SilkWavesDemoProps) {
  return (
    <SilkWaves className="demo-background" {...props}>
      <BackgroundHero title={text} slug="silk-waves" accent={props.color ?? '#9a6424'} />
    </SilkWaves>
  );
}
