import { DragonScales } from '@elyri/motion';
import type { DragonScalesProps } from '@elyri/motion';

import { BackgroundHero } from '../BackgroundHero';

export interface DragonScalesDemoProps extends DragonScalesProps {
  text: string;
}

export default function DragonScalesDemo({ text, ...props }: DragonScalesDemoProps) {
  return (
    <DragonScales className="demo-background" {...props}>
      <BackgroundHero title={text} slug="dragon-scales" accent={props.color ?? '#7b3fe4'} />
    </DragonScales>
  );
}
