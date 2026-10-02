import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ContextMenu } from '../components/overlays/ContextMenu';

describe('ContextMenu', () => {
  it('opens at the pointer and focuses the first item', async () => {
    render(
      <ContextMenu>
        <ContextMenu.Trigger>Canvas</ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item>Duplicate</ContextMenu.Item>
          <ContextMenu.Item danger>Delete</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    );

    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.contextMenu(screen.getByText('Canvas'), { clientX: 40, clientY: 60 });

    const items = await screen.findAllByRole('menuitem');
    expect(items).toHaveLength(2);
    await waitFor(() => expect(document.activeElement).toBe(items[0]));
  });

  it('selects an item and closes the menu', async () => {
    const onSelect = vi.fn();
    render(
      <ContextMenu>
        <ContextMenu.Trigger>Canvas</ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item onSelect={onSelect}>Duplicate</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Canvas'), { clientX: 10, clientY: 10 });
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Duplicate' }));

    expect(onSelect).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('menuitem')).toBeNull());
  });

  it('closes on Escape', async () => {
    render(
      <ContextMenu>
        <ContextMenu.Trigger>Canvas</ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item>Duplicate</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Canvas'), { clientX: 10, clientY: 10 });
    await screen.findByRole('menu');

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });
});
