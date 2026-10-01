import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { RadioGroup } from '../components/forms/Radio';

function renderGroup(props: Partial<ComponentProps<typeof RadioGroup>> = {}) {
  return render(
    <RadioGroup {...props}>
      <RadioGroup.Radio value="apple">Apple</RadioGroup.Radio>
      <RadioGroup.Radio value="banana">Banana</RadioGroup.Radio>
      <RadioGroup.Radio value="cherry">Cherry</RadioGroup.Radio>
    </RadioGroup>,
  );
}

describe('RadioGroup', () => {
  it('renders a radiogroup with named radios', () => {
    renderGroup();
    expect(screen.getByRole('radiogroup')).toBeTruthy();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'Banana' })).toBeTruthy();
  });

  it('checks the default value and switches on click when uncontrolled', () => {
    const onValueChange = vi.fn();
    renderGroup({ defaultValue: 'apple', onValueChange });

    const apple = screen.getByRole('radio', { name: 'Apple' }) as HTMLInputElement;
    const banana = screen.getByRole('radio', { name: 'Banana' }) as HTMLInputElement;
    expect(apple.checked).toBe(true);

    fireEvent.click(banana);
    expect(onValueChange).toHaveBeenCalledWith('banana');
    expect(banana.checked).toBe(true);
    expect(apple.checked).toBe(false);
  });

  it('reports changes without mutating a controlled value', () => {
    const onValueChange = vi.fn();
    renderGroup({ value: 'apple', onValueChange });

    const apple = screen.getByRole('radio', { name: 'Apple' }) as HTMLInputElement;
    const banana = screen.getByRole('radio', { name: 'Banana' }) as HTMLInputElement;

    fireEvent.click(banana);
    expect(onValueChange).toHaveBeenCalledWith('banana');
    expect(apple.checked).toBe(true);
    expect(banana.checked).toBe(false);
  });

  it('shares one name across radios for native arrow key navigation', () => {
    renderGroup({ name: 'fruit' });
    const names = screen.getAllByRole('radio').map((radio) => (radio as HTMLInputElement).name);
    expect(new Set(names)).toEqual(new Set(['fruit']));
  });

  it('disables every radio from the group', () => {
    renderGroup({ disabled: true });
    screen.getAllByRole('radio').forEach((radio) => expect((radio as HTMLInputElement).disabled).toBe(true));
  });
});
