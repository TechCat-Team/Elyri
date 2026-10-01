import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Field } from '../components/forms/Field';
import { NumberInput } from '../components/forms/NumberInput';

describe('NumberInput', () => {
  it('starts empty by default and exposes spinbutton semantics', () => {
    render(<NumberInput aria-label="Quantity" />);
    const input = screen.getByRole('spinbutton', { name: 'Quantity' });

    expect(input.getAttribute('aria-valuenow')).toBe(null);
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('increments and decrements with the stepper buttons', () => {
    const onValueChange = vi.fn();
    render(<NumberInput defaultValue={3} onValueChange={onValueChange} aria-label="Quantity" />);

    fireEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(onValueChange).toHaveBeenCalledWith(4);
    expect((screen.getByRole('spinbutton') as HTMLInputElement).value).toBe('4');

    fireEvent.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(onValueChange).toHaveBeenLastCalledWith(3);
  });

  it('steps with the arrow keys', () => {
    const onValueChange = vi.fn();
    render(<NumberInput defaultValue={3} step={2} onValueChange={onValueChange} aria-label="Quantity" />);
    const input = screen.getByRole('spinbutton');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(onValueChange).toHaveBeenCalledWith(5);

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(onValueChange).toHaveBeenLastCalledWith(3);
  });

  it('clamps to min and max and disables the steppers at the bounds', () => {
    const onValueChange = vi.fn();
    render(<NumberInput defaultValue={2} min={0} max={2} onValueChange={onValueChange} aria-label="Quantity" />);

    expect((screen.getByRole('button', { name: 'Increase' }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(onValueChange).toHaveBeenCalledWith(1);
  });

  it('commits a typed value on blur', () => {
    const onValueChange = vi.fn();
    render(<NumberInput onValueChange={onValueChange} aria-label="Quantity" />);
    const input = screen.getByRole('spinbutton');

    fireEvent.change(input, { target: { value: '12' } });
    fireEvent.blur(input);

    expect(onValueChange).toHaveBeenCalledWith(12);
    expect((input as HTMLInputElement).value).toBe('12');
  });

  it('honours decimal precision on step', () => {
    const onValueChange = vi.fn();
    render(<NumberInput defaultValue={0} step={0.1} onValueChange={onValueChange} aria-label="Quantity" />);

    fireEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(onValueChange).toHaveBeenCalledWith(0.1);
    expect((screen.getByRole('spinbutton') as HTMLInputElement).value).toBe('0.1');
  });

  it('submits through the native input when named', () => {
    render(<NumberInput defaultValue={5} name="quantity" aria-label="Quantity" />);
    expect((screen.getByRole('spinbutton') as HTMLInputElement).name).toBe('quantity');
  });

  it('is named by the surrounding Field label', () => {
    render(
      <Field>
        <Field.Label>Quantity</Field.Label>
        <NumberInput defaultValue={1} />
      </Field>,
    );

    expect(screen.getByRole('spinbutton', { name: 'Quantity' })).toBeTruthy();
  });
});
