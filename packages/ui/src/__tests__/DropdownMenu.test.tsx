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

  it('renders a shortcut hint and supports an asChild trigger', () => {
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <button>Custom</button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>
            Save
            <DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );

    const trigger = screen.getByRole('button', { name: 'Custom' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(trigger);

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('⌘S')).toBeTruthy();
  });

  it('keeps the menu open when onSelect prevents the default', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={(event) => event.preventDefault()}>Copy</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );

    fireEvent.click(screen.getByRole('menuitem', { name: 'Copy' }));
    expect(screen.getByRole('menu')).toBeTruthy();
  });

  it('toggles a checkbox item without closing the menu', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenu.Trigger>View</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.CheckboxItem defaultChecked>Show grid</DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem>Snap</DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );

    const grid = screen.getByRole('menuitemcheckbox', { name: 'Show grid' });
    expect(grid.getAttribute('aria-checked')).toBe('true');
    expect(grid.querySelector('svg')).toBeTruthy();

    fireEvent.click(grid);

    expect(grid.getAttribute('aria-checked')).toBe('false');
    // 未勾选时指示位不渲染对勾
    expect(grid.querySelector('svg')).toBeNull();
    expect(screen.getByRole('menu')).toBeTruthy();
  });

  it('selects a radio item and keeps the menu open', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenu.Trigger>Sort</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.RadioGroup defaultValue="name">
            <DropdownMenu.RadioItem value="name">Name</DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="date">Date</DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );

    const date = screen.getByRole('menuitemradio', { name: 'Date' });
    const name = screen.getByRole('menuitemradio', { name: 'Name' });
    expect(date.getAttribute('aria-checked')).toBe('false');
    // 只有选中项才显示圆点
    expect(date.querySelector('svg')).toBeNull();
    expect(name.querySelector('svg')).toBeTruthy();

    fireEvent.click(date);

    expect(date.getAttribute('aria-checked')).toBe('true');
    expect(date.querySelector('svg')).toBeTruthy();
    expect(name.querySelector('svg')).toBeNull();
    expect(screen.getByRole('menu')).toBeTruthy();
  });

  it('opens a submenu with ArrowRight and returns focus with ArrowLeft', async () => {
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Duplicate</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Share</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item>Email</DropdownMenu.Item>
              <DropdownMenu.Item>Copy link</DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));

    const subTrigger = screen.getByRole('menuitem', { name: 'Share' });
    subTrigger.focus();
    fireEvent.keyDown(subTrigger, { key: 'ArrowRight' });

    const email = await screen.findByRole('menuitem', { name: 'Email' });
    await waitFor(() => expect(document.activeElement).toBe(email));

    fireEvent.keyDown(screen.getByRole('menu', { name: 'Share' }), { key: 'ArrowLeft' });

    await waitFor(() => expect(screen.queryByRole('menuitem', { name: 'Email' })).toBeNull());
    expect(document.activeElement).toBe(subTrigger);
  });

  it('closes the whole menu when a submenu item is selected', async () => {
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Share</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item>Email</DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );

    const trigger = screen.getByRole('button', { name: 'Actions' });
    fireEvent.click(trigger);

    const subTrigger = screen.getByRole('menuitem', { name: 'Share' });
    subTrigger.focus();
    fireEvent.keyDown(subTrigger, { key: 'ArrowRight' });

    fireEvent.click(await screen.findByRole('menuitem', { name: 'Email' }));

    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });
});
