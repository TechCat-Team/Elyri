import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Item } from '../components/data-display/Item';

describe('Item', () => {
  it('renders media, content, title, description and actions', () => {
    render(
      <Item>
        <Item.Media variant="icon">★</Item.Media>
        <Item.Content>
          <Item.Title>Ship the release</Item.Title>
          <Item.Description>Cut 0.1.0 and publish to npm.</Item.Description>
        </Item.Content>
        <Item.Actions>
          <button type="button">Open</button>
        </Item.Actions>
      </Item>,
    );

    expect(screen.getByText('Ship the release')).toBeTruthy();
    expect(screen.getByText('Cut 0.1.0 and publish to npm.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open' })).toBeTruthy();
  });

  it('applies variant and size classes and marks interactive items', () => {
    const { container } = render(<Item variant="muted" size="lg" interactive />);
    const root = container.querySelector('.elyri-ui-item');
    expect(root?.className).toContain('elyri-ui-item--muted');
    expect(root?.className).toContain('elyri-ui-item--lg');
    expect(root?.getAttribute('data-interactive')).toBe('true');
  });

  it('stacks items inside a group', () => {
    const { container } = render(
      <Item.Group>
        <Item>One</Item>
        <Item>Two</Item>
      </Item.Group>,
    );
    expect(container.querySelector('.elyri-ui-item-group')?.children).toHaveLength(2);
  });
});
