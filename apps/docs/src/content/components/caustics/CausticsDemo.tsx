import { Caustics } from 'elyri';
import type { CausticsProps } from 'elyri';

import { BackgroundHero } from '../BackgroundHero';

export interface CausticsDemoProps extends CausticsProps {
  text: string;
}

export default function CausticsDemo({ text, ...props }: CausticsDemoProps) {
  return (
    <Caustics className="demo-background" {...props}>
      <BackgroundHero title={text} slug="caustics" accent={props.color ?? '#0a6fa8'} />
    </Caustics>
  );
}
