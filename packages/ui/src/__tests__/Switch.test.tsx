import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Switch } from '../components/forms/Switch';

describe('Switch', () => {
  it('toggles itself when uncontrolled', () => {
    render(<Switch aria-label="Notifications" />);
    const control = screen.getByRole('switch', { name: 'Notifications' });

    expect(control.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(control);
    expect(control.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(control);
    expect(control.getAttribute('aria-checked')).toBe('false');
  });

  it('honours defaultChecked', () => {
    render(<Switch aria-label="Notifications" defaultChecked />);
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true');
  });

  it('reports changes without mutating a controlled value', () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Notifications" checked={false} onCheckedChange={onCheckedChange} />);

    const control = screen.getByRole('switch');
    fireEvent.click(control);

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(control.getAttribute('aria-checked')).toBe('false');
  });

  it('ignores clicks while disabled', () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Notifications" disabled defaultChecked onCheckedChange={onCheckedChange} />);

    fireEvent.click(screen.getByRole('switch'));

    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true');
  });
});
