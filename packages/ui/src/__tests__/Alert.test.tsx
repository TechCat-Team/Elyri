import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Alert } from '../components/feedback/Alert';

describe('Alert', () => {
  it('uses alert semantics for danger and status otherwise', () => {
    const { rerender } = render(<Alert variant="danger">Failed</Alert>);
    expect(screen.getByRole('alert').textContent).toContain('Failed');

    rerender(<Alert variant="info">Heads up</Alert>);
    expect(screen.getByRole('status').textContent).toContain('Heads up');
  });

  it('renders a close button only when onClose is provided', () => {
    const onClose = vi.fn();
    const { rerender } = render(<Alert>Plain</Alert>);
    expect(screen.queryByRole('button')).toBeNull();

    rerender(<Alert onClose={onClose}>Closable</Alert>);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows a variant icon by default and hides it with icon={null}', () => {
    const { container, rerender } = render(<Alert variant="success">Done</Alert>);
    expect(container.querySelector('.elyri-ui-alert__icon svg')).toBeTruthy();

    rerender(
      <Alert variant="success" icon={null} action={<button type="button">Undo</button>}>
        Done
      </Alert>,
    );
    expect(container.querySelector('.elyri-ui-alert__icon')).toBeNull();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeTruthy();
  });

  it('toggles the border and accent emphasis', () => {
    const { container, rerender } = render(<Alert>Plain</Alert>);
    const root = () => container.querySelector('.elyri-ui-alert');
    expect(root()?.getAttribute('data-bordered')).toBeNull();
    expect(root()?.getAttribute('data-accent')).toBeNull();

    rerender(
      <Alert bordered={false} accent={false}>
        Plain
      </Alert>,
    );
    expect(root()?.getAttribute('data-bordered')).toBe('false');
    expect(root()?.getAttribute('data-accent')).toBe('false');
  });
});
