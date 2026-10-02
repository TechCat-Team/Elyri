import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Accordion } from '../components/navigation/Accordion';
import type { AccordionProps } from '../components/navigation/Accordion';

/** 这个 helper 覆盖 single 模式的用例，multiple 的用例单独渲染 */
const renderAccordion = (props: Extract<AccordionProps, { type?: 'single' }> = {}) =>
  render(
    <Accordion defaultValue="one" {...props}>
      <Accordion.Item value="one">
        <Accordion.Trigger>One</Accordion.Trigger>
        <Accordion.Content>Body one</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="two">
        <Accordion.Trigger>Two</Accordion.Trigger>
        <Accordion.Content>Body two</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="three" disabled>
        <Accordion.Trigger>Three</Accordion.Trigger>
        <Accordion.Content>Body three</Accordion.Content>
      </Accordion.Item>
    </Accordion>,
  );

/** 面板常驻 DOM，展开状态以 data-open 标记（收起时的 visibility 由 CSS 控制，jsdom 读不到） */
const openPanel = () => document.querySelector('.elyri-ui-accordion__panel[data-open]');

describe('Accordion', () => {
  it('wires the expanded trigger to its panel', () => {
    renderAccordion();
    const [first, second] = screen.getAllByRole('button');
    const panel = openPanel();

    expect(first.getAttribute('aria-expanded')).toBe('true');
    expect(second.getAttribute('aria-expanded')).toBe('false');
    expect(panel?.textContent).toBe('Body one');
    expect(first.getAttribute('aria-controls')).toBe(panel?.id);
    expect(panel?.getAttribute('aria-labelledby')).toBe(first.id);
  });

  it('keeps every panel in the DOM but only marks the open one', () => {
    renderAccordion();
    expect(screen.getAllByRole('region')).toHaveLength(3);
    expect(openPanel()?.textContent).toBe('Body one');
  });

  it('expands another item on click and collapses the previous one', () => {
    renderAccordion();
    fireEvent.click(screen.getByRole('button', { name: 'Two' }));

    expect(screen.getByRole('button', { name: 'Two' }).getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('button', { name: 'One' }).getAttribute('aria-expanded')).toBe('false');
    expect(openPanel()?.textContent).toBe('Body two');
  });

  it('keeps the open item expanded on repeat click unless collapsible', () => {
    const { unmount } = renderAccordion();
    fireEvent.click(screen.getByRole('button', { name: 'One' }));
    expect(screen.getByRole('button', { name: 'One' }).getAttribute('aria-expanded')).toBe('true');
    unmount();

    renderAccordion({ collapsible: true });
    fireEvent.click(screen.getByRole('button', { name: 'One' }));
    expect(screen.getByRole('button', { name: 'One' }).getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByText('Body one').closest('[data-open]')).toBeNull();
  });

  it('moves focus with the arrow keys without changing the expanded item', () => {
    renderAccordion();
    const first = screen.getByRole('button', { name: 'One' });
    const second = screen.getByRole('button', { name: 'Two' });
    first.focus();

    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(second);
    // 跳过禁用项，环形移动
    fireEvent.keyDown(second, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(first, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(second);

    fireEvent.keyDown(second, { key: 'Home' });
    expect(document.activeElement).toBe(first);

    // 焦点移动不激活
    expect(first.getAttribute('aria-expanded')).toBe('true');
  });

  it('does not open a disabled item', () => {
    renderAccordion();
    const third = screen.getByRole('button', { name: 'Three' });
    expect(third.hasAttribute('disabled')).toBe(true);

    fireEvent.click(third);
    expect(third.getAttribute('aria-expanded')).toBe('false');
  });

  it('reports changes without mutating a controlled value', () => {
    const onValueChange = vi.fn();
    renderAccordion({ defaultValue: undefined, value: 'one', onValueChange });

    fireEvent.click(screen.getByRole('button', { name: 'Two' }));

    expect(onValueChange).toHaveBeenCalledWith('two');
    expect(screen.getByRole('button', { name: 'One' }).getAttribute('aria-expanded')).toBe('true');
  });

  it('defaults to the lined variant and accepts separated', () => {
    const { container, unmount } = renderAccordion();
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('lined');
    unmount();

    const { container: separated } = renderAccordion({ variant: 'separated' });
    expect(separated.firstElementChild?.getAttribute('data-variant')).toBe('separated');
  });

  it('keeps several items open when type is multiple', () => {
    const onValueChange = vi.fn();
    render(
      <Accordion type="multiple" defaultValue={['one']} onValueChange={onValueChange}>
        <Accordion.Item value="one">
          <Accordion.Trigger>One</Accordion.Trigger>
          <Accordion.Content>Body one</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="two">
          <Accordion.Trigger>Two</Accordion.Trigger>
          <Accordion.Content>Body two</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Two' }));
    expect(document.querySelectorAll('.elyri-ui-accordion__panel[data-open]')).toHaveLength(2);
    expect(onValueChange).toHaveBeenLastCalledWith(['one', 'two']);

    // multiple 下点击已展开项直接收起该项
    fireEvent.click(screen.getByRole('button', { name: 'One' }));
    expect(document.querySelectorAll('.elyri-ui-accordion__panel[data-open]')).toHaveLength(1);
    expect(onValueChange).toHaveBeenLastCalledWith(['two']);
  });

  it('renders a decorative leading icon when provided', () => {
    render(
      <Accordion defaultValue="one">
        <Accordion.Item value="one">
          <Accordion.Trigger icon={<svg data-testid="item-icon" />}>One</Accordion.Trigger>
          <Accordion.Content>Body one</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    const icon = screen.getByTestId('item-icon');
    expect(icon.closest('.elyri-ui-accordion__icon-leading')?.getAttribute('aria-hidden')).toBe('true');
  });
});
