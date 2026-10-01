import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DropdownMenu } from '../components/overlays/DropdownMenu';

describe('DropdownMenu', () => {
  const renderMenu = () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={onSelect}>Duplicate</DropdownMenu.Item>
          <DropdownMenu.Item onSelect={vi.fn()}>Rename</DropdownMenu.Item>
          <DropdownMenu.Item disabled>Delete</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );
    return { onSelect };
  };

  it('opens from the trigger and focuses the first item', () => {
    renderMenu();
    expect(screen.queryByRole('menu')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));

    const items = screen.getAllByRole('menuitem');
    expect(items).toHaveLength(3);
    expect(document.activeElement).toBe(items[0]);
  });

  it('moves focus with the arrow keys and wraps around', () => {
    renderMenu();
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    const menu = screen.getByRole('menu');
    const items = screen.getAllByRole('menuitem');

    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(items[1]);

    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(items[0]);

    // 反向越过第一项回到最后一个可选项（跳过 disabled）
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(items[1]);

    fireEvent.keyDown(menu, { key: 'End' });
    expect(document.activeElement).toBe(items[1]);
  });

  it('selects an item and closes, returning focus to the trigger', async () => {
    const { onSelect } = renderMenu();
    const trigger = screen.getByRole('button', { name: 'Actions' });
    fireEvent.click(trigger);

    fireEvent.click(screen.getAllByRole('menuitem')[0]);

    expect(onSelect).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(trigger);
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('closes on Escape', async () => {
    renderMenu();
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('menu').getAttribute('data-state')).toBe('closed');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('is labelled by its trigger', () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: 'Actions' });
    fireEvent.click(trigger);
    expect(screen.getByRole('menu', { name: 'Actions' })).toBeTruthy();
  });

  it('moves focus to the hovered item', () => {
    renderMenu();
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    const items = screen.getAllByRole('menuitem');

    fireEvent.pointerMove(items[1]);
    expect(document.activeElement).toBe(items[1]);

    fireEvent.pointerMove(items[2]);
    expect(document.activeElement).toBe(items[1]);
  });
});
