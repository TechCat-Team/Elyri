import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Progress } from '../components/feedback/Progress';

describe('Progress', () => {
  it('exposes determinate progressbar semantics and width', () => {
    render(<Progress value={30} max={60} label="Upload" />);

    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar.getAttribute('aria-valuenow')).toBe('30');
    expect(bar.getAttribute('aria-valuemax')).toBe('60');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect((bar.firstElementChild as HTMLElement).style.width).toBe('50%');
  });

  it('drops the value attributes when indeterminate', () => {
    render(<Progress indeterminate label="Loading" />);

    const bar = screen.getByRole('progressbar', { name: 'Loading' });
    expect(bar.getAttribute('aria-valuenow')).toBeNull();
    expect(bar.className).toContain('is-indeterminate');
  });

  it('clamps values outside the range', () => {
    render(<Progress value={150} max={100} label="Over" />);
    expect((screen.getByRole('progressbar').firstElementChild as HTMLElement).style.width).toBe('100%');
  });
});
