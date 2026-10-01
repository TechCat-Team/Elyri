import { Popover } from '@elyri/ui';

type Placement = 'top' | 'bottom' | 'left' | 'right';

export interface PopoverDemoProps {
  placement: Placement;
  title: string;
}

export default function PopoverDemo({ placement, title }: PopoverDemoProps) {
  return (
    <Popover placement={placement}>
      <Popover.Trigger>Open popover</Popover.Trigger>
      <Popover.Content>
        <div className="demo-ui-popover-title">{title}</div>
        <p className="demo-ui-popover-text">
          Popovers hold interactive content, move focus inside and return it to the trigger on close.
        </p>
      </Popover.Content>
    </Popover>
  );
}
