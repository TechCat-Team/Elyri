import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Select } from '../components/forms/Select';

const FRUITS = ['Apple', 'Banana', 'Cherry'];

function renderSelect(props: Partial<ComponentProps<typeof Select>> = {}) {
  return render(
    <Select placeholder="Pick a fruit" {...props}>
      <Select.Trigger />
      <Select.Content>
        {FRUITS.map((fruit, index) => (
          <Select.Item key={fruit} value={fruit.toLowerCase()} disabled={index === 2}>
            {fruit}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>,
  );
}

describe('Select (single)', () => {
  it('shows the placeholder while closed and hides the listbox', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.textContent).toContain('Pick a fruit');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('opens from the trigger and highlights the first option via aria-activedescendant', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(screen.getByRole('listbox')).toBeTruthy();
    // 焦点留在 combobox，高亮项通过 aria-activedescendant 暴露
    expect(trigger.getAttribute('aria-activedescendant')).toBe(options[0].id);
    expect(options[0].getAttribute('data-active')).toBe('true');
  });

  it('highlights the selected option when reopened', () => {
    renderSelect({ defaultValue: 'banana' });
    fireEvent.click(screen.getByRole('combobox'));

    const options = screen.getAllByRole('option');
    expect(screen.getByRole('combobox').getAttribute('aria-activedescendant')).toBe(options[1].id);
    expect(options[1].getAttribute('data-active')).toBe('true');
  });

  it('shows the default value label without opening first', () => {
    renderSelect({ defaultValue: 'banana' });
    expect(screen.getByRole('combobox').textContent).toContain('Banana');
  });

  it('selects an option, closes, and keeps focus on the trigger', async () => {
    const onValueChange = vi.fn();
    renderSelect({ onValueChange });
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    fireEvent.click(trigger);

    fireEvent.click(screen.getByRole('option', { name: 'Apple' }));

    expect(onValueChange).toHaveBeenCalledWith('apple');
    expect(trigger.textContent).toContain('Apple');
    expect(document.activeElement).toBe(trigger);
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('does not move DOM focus into the listbox on hover', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    fireEvent.click(trigger);

    const options = screen.getAllByRole('option');
    fireEvent.pointerMove(options[1]);

    expect(document.activeElement).toBe(trigger);
    expect(options[1].getAttribute('data-active')).toBe('true');
  });

  it('moves the highlight with the arrow keys and skips disabled options', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    const options = screen.getAllByRole('option');

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(trigger.getAttribute('aria-activedescendant')).toBe(options[1].id);

    fireEvent.keyDown(trigger, { key: 'End' });
    expect(trigger.getAttribute('aria-activedescendant')).toBe(options[1].id);

    fireEvent.keyDown(trigger, { key: 'Home' });
    expect(trigger.getAttribute('aria-activedescendant')).toBe(options[0].id);
  });

  it('jumps to a matching option with typeahead', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    const options = screen.getAllByRole('option');

    fireEvent.keyDown(trigger, { key: 'b' });
    expect(trigger.getAttribute('aria-activedescendant')).toBe(options[1].id);
  });

  it('opens with the arrow down key from the trigger', () => {
    renderSelect();
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  it('selects the highlighted option with Enter', () => {
    const onValueChange = vi.fn();
    renderSelect({ onValueChange });
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(onValueChange).toHaveBeenCalledWith('banana');
  });

  it('closes on Escape and keeps focus on the trigger', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox').getAttribute('data-state')).toBe('open');

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.getByRole('listbox').getAttribute('data-state')).toBe('closed');
    expect(document.activeElement).toBe(trigger);
  });

  it('ignores clicks on disabled options', () => {
    const onValueChange = vi.fn();
    renderSelect({ onValueChange });
    fireEvent.click(screen.getByRole('combobox'));

    fireEvent.click(screen.getByRole('option', { name: 'Cherry' }));

    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  it('does not open while disabled', () => {
    renderSelect({ disabled: true });
    fireEvent.click(screen.getByRole('combobox'));

    expect(screen.queryByRole('listbox')).toBeNull();
  });
});

describe('Select (multiple)', () => {
  function renderMulti(props: Partial<ComponentProps<typeof Select>> = {}) {
    return render(
      <Select multiple placeholder="Pick fruits" {...props}>
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="apple">Apple</Select.Item>
          <Select.Item value="banana">Banana</Select.Item>
        </Select.Content>
      </Select>,
    );
  }

  it('toggles options without closing and shows tags', () => {
    const onValueChange = vi.fn();
    renderMulti({ onValueChange });
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    fireEvent.click(screen.getByRole('option', { name: 'Apple' }));
    expect(onValueChange).toHaveBeenCalledWith(['apple']);
    expect(screen.getByRole('listbox')).toBeTruthy();

    fireEvent.click(screen.getByRole('option', { name: 'Banana' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['apple', 'banana']);

    expect(trigger.textContent).toContain('Apple');
    expect(trigger.textContent).toContain('Banana');
    expect(screen.getByRole('option', { name: 'Apple' }).getAttribute('aria-selected')).toBe('true');
  });

  it('removes a tag from the trigger', () => {
    const onValueChange = vi.fn();
    renderMulti({ defaultValue: ['apple', 'banana'], onValueChange });

    fireEvent.click(screen.getByRole('button', { name: 'Remove Apple' }));

    expect(onValueChange).toHaveBeenCalledWith(['banana']);
    expect(screen.getByRole('combobox').textContent).not.toContain('Apple');
  });

  it('clears every tag with the clear button', () => {
    const onValueChange = vi.fn();
    renderMulti({ defaultValue: ['apple'], onValueChange });

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onValueChange).toHaveBeenCalledWith([]);
    expect(screen.getByRole('combobox').textContent).toContain('Pick fruits');
  });

  it('keeps a controlled value untouched without a handler update', () => {
    const onValueChange = vi.fn();
    renderMulti({ value: ['apple'], onValueChange });
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    fireEvent.click(screen.getByRole('option', { name: 'Banana' }));

    expect(onValueChange).toHaveBeenCalledWith(['apple', 'banana']);
    expect(trigger.textContent).not.toContain('Banana');
  });
});

describe('Select (search)', () => {
  function renderSearchSelect(props: Partial<ComponentProps<typeof Select>> = {}) {
    return render(
      <Select placeholder="Pick a fruit" {...props}>
        <Select.Trigger>
          <Select.Search placeholder="Search fruits" />
        </Select.Trigger>
        <Select.Content>
          {FRUITS.map((fruit) => (
            <Select.Item key={fruit} value={fruit.toLowerCase()}>
              {fruit}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>,
    );
  }

  function visibleOptions() {
    const listbox = screen.getByRole('listbox');
    return Array.from(listbox.querySelectorAll('[role="option"]:not([hidden])')).map((node) => node.textContent);
  }

  it('moves the combobox role onto the search input', () => {
    renderSearchSelect();
    const combobox = screen.getByRole('combobox');
    expect(combobox.tagName).toBe('INPUT');
    expect(combobox.getAttribute('aria-expanded')).toBe('false');
  });

  it('filters options as the user types', () => {
    renderSearchSelect();
    const input = screen.getByRole('combobox');
    fireEvent.click(input);

    fireEvent.change(input, { target: { value: 'an' } });
    expect(visibleOptions()).toEqual(['Banana']);
  });

  it('selects the highlighted match with Enter and closes', () => {
    const onValueChange = vi.fn();
    renderSearchSelect({ onValueChange });
    const input = screen.getByRole('combobox');
    fireEvent.click(input);

    fireEvent.change(input, { target: { value: 'ban' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onValueChange).toHaveBeenCalledWith('banana');
    expect((input as HTMLInputElement).value).toBe('Banana');
  });

  it('reports the query through onSearchChange', () => {
    const onSearchChange = vi.fn();
    renderSearchSelect({ onSearchChange });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ch' } });

    expect(onSearchChange).toHaveBeenCalledWith('ch');
  });

  it('supports a custom filter function', () => {
    renderSearchSelect({ filter: (label, query) => label.toLowerCase().startsWith(query.toLowerCase()) });
    const input = screen.getByRole('combobox');
    fireEvent.click(input);

    fireEvent.change(input, { target: { value: 'B' } });
    expect(visibleOptions()).toEqual(['Banana']);

    fireEvent.change(input, { target: { value: 'a' } });
    expect(visibleOptions()).toEqual(['Apple']);
  });

  it('clears the query when closed', () => {
    renderSearchSelect();
    const input = screen.getByRole('combobox');
    fireEvent.click(input);

    fireEvent.change(input, { target: { value: 'ba' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect((input as HTMLInputElement).value).toBe('');
  });

  it('stays empty after the query is deleted instead of restoring the selection', () => {
    renderSearchSelect({ defaultValue: 'banana' });
    const input = screen.getByRole('combobox');
    fireEvent.click(input);
    expect((input as HTMLInputElement).value).toBe('Banana');

    fireEvent.change(input, { target: { value: '' } });

    expect((input as HTMLInputElement).value).toBe('');
  });
});
