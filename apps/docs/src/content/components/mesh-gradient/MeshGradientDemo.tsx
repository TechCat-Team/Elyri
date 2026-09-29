import { MeshGradient } from 'elyri';
import type { MeshGradientProps } from 'elyri';

import { BackgroundHero } from '../BackgroundHero';

export interface MeshGradientDemoProps extends MeshGradientProps {
  text: string;
}

export default function MeshGradientDemo({ text, ...props }: MeshGradientDemoProps) {
  return (
    <MeshGradient className="demo-background demo-background--adaptive" {...props}>
      <BackgroundHero title={text} slug="mesh-gradient" accent={props.colors?.[0] ?? '#6e6af0'} />
    </MeshGradient>
  );
}
