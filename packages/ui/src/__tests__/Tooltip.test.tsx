import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Tooltip } from '../components/overlays/Tooltip';

const renderTooltip = () =>
  render(
    <Tooltip>
      <Tooltip.Trigger>Info</Tooltip.Trigger>
      <Tooltip.Content>More detail</Tooltip.Content>
    </Tooltip>,
  );

describe('Tooltip', () => {
  it('shows on focus and hides on blur after the exit animation', async () => {
    renderTooltip();
    const trigger = screen.getByRole('button', { name: 'Info' });
    expect(screen.queryByRole('tooltip')).toBeNull();

    fireEvent.focus(trigger);
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.textContent).toBe('More detail');
    expect(tooltip.getAttribute('data-state')).toBe('open');
    expect(trigger.getAttribute('aria-describedby')).toBe(tooltip.id);

    fireEvent.blur(trigger);
    expect(tooltip.getAttribute('data-state')).toBe('closed');
    expect(trigger.hasAttribute('aria-describedby')).toBe(false);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('closes on Escape', async () => {
    renderTooltip();
    fireEvent.focus(screen.getByRole('button', { name: 'Info' }));
    expect(screen.getByRole('tooltip')).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });
});
