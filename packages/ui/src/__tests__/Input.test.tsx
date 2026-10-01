import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Input } from '../components/forms/Input';

describe('Input', () => {
  it('renders a textbox with the given placeholder', () => {
    render(<Input placeholder="you@example.com" />);
    expect(screen.getByRole('textbox')).toBeTruthy();
    expect(screen.getByPlaceholderText('you@example.com')).toBeTruthy();
  });

  it('applies size classes', () => {
    const { rerender } = render(<Input size="sm" />);
    expect(screen.getByRole('textbox').className).toContain('elyri-ui-input--sm');

    rerender(<Input size="lg" />);
    expect(screen.getByRole('textbox').className).toContain('elyri-ui-input--lg');
  });

  it('marks the invalid state', () => {
    render(<Input invalid defaultValue="oops" />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('is-invalid');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('keeps a user-provided id', () => {
    render(<Input id="custom" />);
    expect(screen.getByRole('textbox').id).toBe('custom');
  });

  it('accepts typing through onChange', () => {
    render(<Input defaultValue="" readOnly={false} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'hello' } });
    expect((input as HTMLInputElement).value).toBe('hello');
  });
});
