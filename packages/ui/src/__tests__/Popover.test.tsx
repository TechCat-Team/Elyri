import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Popover } from '../components/overlays/Popover';

const renderPopover = () =>
  render(
    <Popover>
      <Popover.Trigger>Filters</Popover.Trigger>
      <Popover.Content>Filter body</Popover.Content>
    </Popover>,
  );

describe('Popover', () => {
  it('toggles from the trigger and closes on Escape', async () => {
    renderPopover();

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
    expect(screen.getByRole('dialog').textContent).toBe('Filter body');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('dialog').getAttribute('data-state')).toBe('closed');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('keeps aria-expanded in sync', () => {
    renderPopover();
    const trigger = screen.getByRole('button', { name: 'Filters' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });
});
