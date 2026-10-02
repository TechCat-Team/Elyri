import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from '../components/forms/Button';
import { ButtonGroup } from '../components/forms/ButtonGroup';

describe('ButtonGroup', () => {
  it('renders a group with the default orientation and attached mode', () => {
    render(
      <ButtonGroup aria-label="Text align">
        <Button>Left</Button>
        <Button>Center</Button>
        <Button>Right</Button>
      </ButtonGroup>,
    );

    const group = screen.getByRole('group', { name: 'Text align' });
    expect(group.className).toContain('elyri-ui-button-group');
    expect(group.getAttribute('data-orientation')).toBe('horizontal');
    expect(group.getAttribute('data-attached')).toBe('true');
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('reflects vertical orientation and detached mode', () => {
    render(
      <ButtonGroup orientation="vertical" attached={false} aria-label="Actions">
        <Button>Top</Button>
        <Button>Bottom</Button>
      </ButtonGroup>,
    );

    const group = screen.getByRole('group', { name: 'Actions' });
    expect(group.getAttribute('data-orientation')).toBe('vertical');
    expect(group.getAttribute('data-attached')).toBe('false');
  });
});
