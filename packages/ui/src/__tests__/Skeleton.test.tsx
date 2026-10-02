import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Skeleton } from '../components/feedback/Skeleton';

describe('Skeleton', () => {
  it('renders a hidden placeholder with shape and animation classes', () => {
    const { container } = render(<Skeleton shape="rect" animation="pulse" width={120} height="2rem" />);

    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.className).toContain('elyri-ui-skeleton--rect');
    expect(el.className).toContain('elyri-ui-skeleton--pulse');
    expect(el.style.width).toBe('120px');
    expect(el.style.height).toBe('2rem');
  });

  it('keeps circles square from a single size', () => {
    const { container } = render(<Skeleton shape="circle" width={48} />);

    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe('48px');
    expect(el.style.height).toBe('48px');
  });

  it('renders multiple text lines', () => {
    const { container } = render(<Skeleton lines={3} />);

    const group = container.firstElementChild as HTMLElement;
    expect(group.className).toContain('elyri-ui-skeleton-lines');
    expect(group.children).toHaveLength(3);
  });

  it('renders children directly once loaded', () => {
    const { container } = render(
      <Skeleton loading={false}>
        <p>Loaded</p>
      </Skeleton>,
    );

    expect(screen.getByText('Loaded')).toBeTruthy();
    expect(container.querySelector('.elyri-ui-skeleton')).toBeNull();
  });

  it('wraps children to borrow their size while loading', () => {
    const { container } = render(
      <Skeleton shape="circle">
        <span>Avatar</span>
      </Skeleton>,
    );

    const el = container.firstElementChild as HTMLElement;
    expect(el.hasAttribute('data-has-children')).toBe(true);
    expect(el.style.width).toBe('');
  });
});
