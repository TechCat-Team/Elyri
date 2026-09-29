import { DotField } from 'elyri';
import type { DotFieldProps } from 'elyri';

import { BackgroundHero } from '../BackgroundHero';

export interface DotFieldDemoProps extends DotFieldProps {
  text: string;
}

export default function DotFieldDemo({ text, ...props }: DotFieldDemoProps) {
  return (
    <DotField className="demo-background demo-background--adaptive" {...props}>
      <BackgroundHero title={text} slug="dot-field" accent={props.highlightColor ?? '#7c6cff'} />
    </DotField>
  );
}
