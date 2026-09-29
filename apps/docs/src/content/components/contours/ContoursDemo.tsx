import { Contours } from 'elyri';
import type { ContoursProps } from 'elyri';

import { BackgroundHero } from '../BackgroundHero';

export interface ContoursDemoProps extends ContoursProps {
  text: string;
}

export default function ContoursDemo({ text, ...props }: ContoursDemoProps) {
  return (
    <Contours className="demo-background demo-background--adaptive" {...props}>
      <BackgroundHero title={text} slug="contours" accent={props.highlightColor ?? '#f08a4b'} />
    </Contours>
  );
}
