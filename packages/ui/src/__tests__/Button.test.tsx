import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../components/forms/Button';

describe('Button', () => {
  it('marks the loading state and blocks clicks', () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Save' }) as HTMLButtonElement;
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.disabled).toBe(true);

    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies variant and size modifiers', () => {
    render(
      <Button variant="danger" size="lg">
        Delete
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button.className).toContain('elyri-ui-button--danger');
    expect(button.className).toContain('elyri-ui-button--lg');
  });

  it('renders leading and trailing icons as decorative', () => {
    const { container } = render(
      <Button leadingIcon={<span data-testid="lead" />} trailingIcon={<span data-testid="trail" />}>
        Save
      </Button>,
    );

    const icons = container.querySelectorAll('.elyri-ui-button__icon');
    expect(icons).toHaveLength(2);
    icons.forEach((icon) => expect(icon.getAttribute('aria-hidden')).toBe('true'));
    expect(screen.getByTestId('lead')).toBeTruthy();
    expect(screen.getByTestId('trail')).toBeTruthy();
  });

  it('collapses to a square icon-only button', () => {
    render(
      <Button iconOnly aria-label="Add">
        <span />
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Add' });
    expect(button.className).toContain('elyri-ui-button--icon-only');
  });

  it('applies the circle modifier', () => {
    render(
      <Button circle aria-label="Add">
        <span />
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Add' });
    expect(button.className).toContain('elyri-ui-button--circle');
  });

  it('hides the icons while loading', () => {
    const { container } = render(
      <Button loading leadingIcon={<span data-testid="lead" />} trailingIcon={<span data-testid="trail" />}>
        Saving
      </Button>,
    );

    expect(container.querySelectorAll('.elyri-ui-button__icon')).toHaveLength(0);
    expect(container.querySelector('.elyri-ui-button__spinner')).toBeTruthy();
  });
});
