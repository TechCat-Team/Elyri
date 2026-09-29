import { Filaments } from 'elyri';
import type { FilamentsProps } from 'elyri';

import { BackgroundHero } from '../BackgroundHero';

export interface FilamentsDemoProps extends FilamentsProps {
  text: string;
}

export default function FilamentsDemo({ text, ...props }: FilamentsDemoProps) {
  return (
    <Filaments className="demo-background demo-background--adaptive" {...props}>
      <BackgroundHero title={text} slug="filaments" accent={props.color ?? '#5b8cff'} />
    </Filaments>
  );
}
