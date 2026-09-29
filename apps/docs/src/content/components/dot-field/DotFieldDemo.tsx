import { DotField } from '@elyri/motion';
import type { DotFieldProps } from '@elyri/motion';

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
