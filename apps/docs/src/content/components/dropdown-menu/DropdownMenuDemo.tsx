import { useState } from 'react';

import { DropdownMenu } from '@elyri/ui';

type Placement = 'top' | 'bottom' | 'left' | 'right';
type Align = 'start' | 'center' | 'end';

export interface DropdownMenuDemoProps {
  placement: Placement;
  align: Align;
}

export default function DropdownMenuDemo({ placement, align }: DropdownMenuDemoProps) {
  const [selected, setSelected] = useState('Nothing yet');

  return (
    <div className="demo-ui-row">
      <DropdownMenu placement={placement} align={align}>
        <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Edit</DropdownMenu.Label>
          <DropdownMenu.Item onSelect={() => setSelected('Duplicate')}>Duplicate</DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => setSelected('Rename')}>Rename</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onSelect={() => setSelected('Archive')}>Archive</DropdownMenu.Item>
          <DropdownMenu.Item disabled>Delete</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
      <span className="demo-ui-label">Selected: {selected}</span>
    </div>
  );
}
