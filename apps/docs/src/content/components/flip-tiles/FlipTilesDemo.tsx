import { FlipTiles } from 'elyri';
import type { FlipTilesProps } from 'elyri';

import { BackgroundHero } from '../BackgroundHero';

export interface FlipTilesDemoProps extends FlipTilesProps {
  text: string;
}

export default function FlipTilesDemo({ text, ...props }: FlipTilesDemoProps) {
  return (
    <FlipTiles className="demo-background demo-background--adaptive" {...props}>
      <BackgroundHero title={text} slug="flip-tiles" accent={props.color ?? '#4f6bff'} />
    </FlipTiles>
  );
}
