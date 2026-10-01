import { Tooltip } from '@elyri/ui';

type Placement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipDemoProps {
  placement: Placement;
  text: string;
}

const OTHERS: Placement[] = ['top', 'bottom', 'left', 'right'];

export default function TooltipDemo({ placement, text }: TooltipDemoProps) {
  return (
    <div className="demo-ui-row">
      {[placement, ...OTHERS.filter((item) => item !== placement)].map((item) => (
        <Tooltip key={item} placement={item}>
          <Tooltip.Trigger>{item}</Tooltip.Trigger>
          <Tooltip.Content>{text}</Tooltip.Content>
        </Tooltip>
      ))}
    </div>
  );
}
