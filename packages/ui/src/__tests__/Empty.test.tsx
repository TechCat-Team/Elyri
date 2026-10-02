import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Empty } from '../components/data-display/Empty';

describe('Empty', () => {
  it('renders title, description and action', () => {
    render(
      <Empty title="No data" action={<button type="button">Create</button>}>
        Nothing here yet.
      </Empty>,
    );
    expect(screen.getByText('No data')).toBeTruthy();
    expect(screen.getByText('Nothing here yet.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Create' })).toBeTruthy();
  });

  it('shows a decorative illustration by default and applies the size class', () => {
    const { container } = render(<Empty size="lg" variant="search" />);
    const root = container.querySelector('.elyri-ui-empty');
    expect(root?.className).toContain('elyri-ui-empty--lg');
    const image = container.querySelector('.elyri-ui-empty__image');
    expect(image?.getAttribute('aria-hidden')).toBe('true');
    expect(image?.querySelector('.elyri-ui-empty__lens')).toBeTruthy();
  });

  it('replaces or hides the illustration via image', () => {
    const { container, rerender } = render(<Empty image={<img alt="" src="x.png" />} />);
    expect(container.querySelector('.elyri-ui-empty__image img')).toBeTruthy();
    expect(container.querySelector('.elyri-ui-empty__image svg')).toBeNull();

    rerender(<Empty image={null} title="Empty" />);
    expect(container.querySelector('.elyri-ui-empty__image')).toBeNull();
  });
});
