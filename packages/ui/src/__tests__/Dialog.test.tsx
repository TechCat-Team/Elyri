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

  it('closes from the corner button and can hide it', async () => {
    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    render(
      <Dialog defaultOpen>
        <Dialog.Content showCloseButton={false}>
          <Dialog.Title>No corner</Dialog.Title>
        </Dialog.Content>
      </Dialog>,
    );
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
  });

  it('bumps instead of closing when dismissal is blocked', async () => {
    render(
      <Dialog defaultOpen>
        <Dialog.Content closeOnEscape={false} closeOnOverlayClick={false}>
          <Dialog.Title>Locked</Dialog.Title>
        </Dialog.Content>
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(dialog.getAttribute('data-state')).toBe('open');
    expect(dialog.hasAttribute('data-shake')).toBe(true);
    await waitFor(() => expect(dialog.hasAttribute('data-shake')).toBe(false));

    fireEvent.pointerDown(dialog.parentElement!);
    expect(dialog.getAttribute('data-state')).toBe('open');
    expect(dialog.hasAttribute('data-shake')).toBe(true);
  });

  it('merges behaviour onto custom elements with asChild', async () => {
    const onClick = vi.fn();
    render(
      <Dialog>
        <Dialog.Trigger asChild>
          <a href="#open" className="custom-trigger">
            Launch
          </a>
        </Dialog.Trigger>
        <Dialog.Content showCloseButton={false}>
          <Dialog.Title>Custom</Dialog.Title>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <button type="button" className="custom-close" onClick={onClick}>
                Done
              </button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>,
    );

    const trigger = screen.getByRole('link', { name: 'Launch' });
    expect(trigger.className).toBe('custom-trigger');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    fireEvent.click(trigger);

    const close = screen.getByRole('button', { name: 'Done' });
    expect(close.className).toBe('custom-close');
    fireEvent.click(close);
    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('lets a child prevent the asChild close', () => {
    render(
      <Dialog defaultOpen>
        <Dialog.Content>
          <Dialog.Title>Guarded</Dialog.Title>
          <Dialog.Close asChild>
            <button type="button" onClick={(event) => event.preventDefault()}>
              Stay
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Stay' }));
    expect(screen.getByRole('dialog').getAttribute('data-state')).toBe('open');
  });

  it('reports changes without mutating a controlled value', () => {
    const onOpenChange = vi.fn();
    renderDialog({ open: false, onOpenChange });

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
