import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Dialog } from '../components/overlays/Dialog';

const renderDialog = (props: Parameters<typeof Dialog>[0] = {}) =>
  render(
    <Dialog {...props}>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Delete project</Dialog.Title>
        <Dialog.Description>This cannot be undone.</Dialog.Description>
        <Dialog.Close>Cancel</Dialog.Close>
      </Dialog.Content>
    </Dialog>,
  );

describe('Dialog', () => {
  it('renders nothing until the trigger is clicked', () => {
    renderDialog();
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.textContent).toContain('Delete project');
  });

  it('closes on Escape and on the close button after the exit animation', async () => {
    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('dialog').getAttribute('data-state')).toBe('closed');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('locks body scroll until the dialog is fully gone', async () => {
    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.body.style.overflow).toBe('hidden');
    await waitFor(() => expect(document.body.style.overflow).toBe(''));
  });

  it('reports changes without mutating a controlled value', () => {
    const onOpenChange = vi.fn();
    renderDialog({ open: false, onOpenChange });

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
