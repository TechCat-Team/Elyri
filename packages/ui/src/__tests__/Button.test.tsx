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
});
