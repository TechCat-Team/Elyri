import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Tabs } from '../components/navigation/Tabs';

const renderTabs = (props: Parameters<typeof Tabs>[0] = {}) =>
  render(
    <Tabs defaultValue="one" {...props}>
      <Tabs.List>
        <Tabs.Trigger value="one">One</Tabs.Trigger>
        <Tabs.Trigger value="two">Two</Tabs.Trigger>
        <Tabs.Trigger value="three">Three</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="one">Panel one</Tabs.Panel>
      <Tabs.Panel value="two">Panel two</Tabs.Panel>
      <Tabs.Panel value="three">Panel three</Tabs.Panel>
    </Tabs>,
  );

describe('Tabs', () => {
  it('marks the active tab and wires it to its panel', () => {
    renderTabs();
    const [first, second] = screen.getAllByRole('tab');
    const panel = screen.getByRole('tabpanel');

    expect(first.getAttribute('aria-selected')).toBe('true');
    expect(first.getAttribute('tabindex')).toBe('0');
    expect(second.getAttribute('aria-selected')).toBe('false');
    expect(second.getAttribute('tabindex')).toBe('-1');
    expect(panel.textContent).toBe('Panel one');
    expect(first.getAttribute('aria-controls')).toBe(panel.id);
  });

  it('keeps inactive panels in the DOM but hidden', () => {
    renderTabs();
    expect(screen.getAllByRole('tabpanel', { hidden: true })).toHaveLength(3);
  });

  it('switches panels on click', () => {
    renderTabs();
    fireEvent.click(screen.getByRole('tab', { name: 'Two' }));
    expect(screen.getByRole('tabpanel').textContent).toBe('Panel two');
  });

  it('moves focus and activates with the arrow keys', () => {
    renderTabs();
    const first = screen.getByRole('tab', { name: 'One' });
    const second = screen.getByRole('tab', { name: 'Two' });
    const third = screen.getByRole('tab', { name: 'Three' });
    first.focus();

    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(second);
    expect(second.getAttribute('aria-selected')).toBe('true');

    fireEvent.keyDown(second, { key: 'End' });
    expect(document.activeElement).toBe(third);

    fireEvent.keyDown(third, { key: 'Home' });
    expect(document.activeElement).toBe(first);

    // 首尾循环
    fireEvent.keyDown(first, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(third);
  });

  it('reports changes without mutating a controlled value', () => {
    const onValueChange = vi.fn();
    renderTabs({ defaultValue: undefined, value: 'one', onValueChange });

    fireEvent.click(screen.getByRole('tab', { name: 'Two' }));

    expect(onValueChange).toHaveBeenCalledWith('two');
    expect(screen.getByRole('tab', { name: 'One' }).getAttribute('aria-selected')).toBe('true');
  });
});
