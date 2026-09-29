import { Halo } from '@elyri/motion';
import type { HaloProps } from '@elyri/motion';

import { BackgroundHero } from '../BackgroundHero';

export interface HaloDemoProps extends HaloProps {
  text: string;
}

export default function HaloDemo({ text, ...props }: HaloDemoProps) {
  return (
    <Halo className="demo-background demo-background--adaptive" {...props}>
      <BackgroundHero title={text} slug="halo" accent={props.colors?.[0] ?? '#8fb4ff'} />
    </Halo>
  );
}
