import { Planet } from '@elyri/motion';
import type { PlanetProps } from '@elyri/motion';

import { BackgroundHero } from '../BackgroundHero';

export interface PlanetDemoProps extends PlanetProps {
  text: string;
}

export default function PlanetDemo({ text, ...props }: PlanetDemoProps) {
  return (
    <Planet className="demo-background" {...props}>
      <BackgroundHero title={text} slug="planet" accent={props.atmosphereColor ?? '#f2a57c'} />
    </Planet>
  );
}
