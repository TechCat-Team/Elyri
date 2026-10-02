import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Field } from '../components/forms/Field';
import { Slider } from '../components/forms/Slider';

describe('Slider', () => {
  it('renders a single slider at the default value', () => {
    render(<Slider defaultValue={40} aria-label="Volume" />);
    const slider = screen.getByRole('slider', { name: 'Volume' });

    expect(slider.getAttribute('aria-valuemin')).toBe('0');
    expect(slider.getAttribute('aria-valuemax')).toBe('100');
    expect(slider.getAttribute('aria-valuenow')).toBe('40');
  });

  it('steps with the arrow keys and jumps with Home / End', () => {
    render(<Slider defaultValue={50} step={5} aria-label="Volume" />);
    const slider = screen.getByRole('slider', { name: 'Volume' });

    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider.getAttribute('aria-valuenow')).toBe('55');

    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(slider.getAttribute('aria-valuenow')).toBe('50');

    fireEvent.keyDown(slider, { key: 'End' });
    expect(slider.getAttribute('aria-valuenow')).toBe('100');

    fireEvent.keyDown(slider, { key: 'Home' });
    expect(slider.getAttribute('aria-valuenow')).toBe('0');
  });

  it('clamps the value within min and max', () => {
    render(<Slider defaultValue={10} min={5} max={15} aria-label="Volume" />);
    const slider = screen.getByRole('slider', { name: 'Volume' });

    fireEvent.keyDown(slider, { key: 'End' });
    expect(slider.getAttribute('aria-valuenow')).toBe('15');

    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider.getAttribute('aria-valuenow')).toBe('15');
  });

  it('reports changes without mutating a controlled value', () => {
    const onValueChange = vi.fn();
    render(<Slider value={30} onValueChange={onValueChange} aria-label="Volume" />);

    fireEvent.keyDown(screen.getByRole('slider', { name: 'Volume' }), { key: 'ArrowRight' });

    expect(onValueChange).toHaveBeenCalledWith(31);
    expect(screen.getByRole('slider', { name: 'Volume' }).getAttribute('aria-valuenow')).toBe('30');
  });

  it('renders a range with two labelled thumbs', () => {
    render(<Slider defaultValue={[20, 60]} aria-label="Price" />);
    const lower = screen.getByRole('slider', { name: 'Minimum' });
    const upper = screen.getByRole('slider', { name: 'Maximum' });

    expect(lower.getAttribute('aria-valuenow')).toBe('20');
    expect(upper.getAttribute('aria-valuenow')).toBe('60');
  });

  it('keeps the range thumbs from crossing', () => {
    render(<Slider defaultValue={[20, 25]} step={10} aria-label="Price" />);
    const lower = screen.getByRole('slider', { name: 'Minimum' });

    fireEvent.keyDown(lower, { key: 'ArrowRight' });

    expect(lower.getAttribute('aria-valuenow')).toBe('25');
  });

  it('updates a range thumb independently', () => {
    const onValueChange = vi.fn();
    render(<Slider defaultValue={[20, 60]} step={5} onValueChange={onValueChange} aria-label="Price" />);

    fireEvent.keyDown(screen.getByRole('slider', { name: 'Maximum' }), { key: 'ArrowLeft' });

    expect(onValueChange).toHaveBeenCalledWith([20, 55]);
  });

  it('ignores keyboard input while disabled', () => {
    const onValueChange = vi.fn();
    render(<Slider defaultValue={40} disabled onValueChange={onValueChange} aria-label="Volume" />);
    const slider = screen.getByRole('slider', { name: 'Volume' });

    expect(slider.getAttribute('tabindex')).toBe('-1');
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('submits the value through a hidden input when named', () => {
    const { container } = render(<Slider defaultValue={40} name="volume" aria-label="Volume" />);
    const input = container.querySelector('input[name="volume"]') as HTMLInputElement;

    expect(input).toBeTruthy();
    expect(input.value).toBe('40');
  });

  it('is named by the surrounding Field label', () => {
    render(
      <Field>
        <Field.Label>Volume</Field.Label>
        <Slider defaultValue={40} />
      </Field>,
    );

    expect(screen.getByRole('slider', { name: 'Volume' })).toBeTruthy();
  });

  it('formats the value bubble and aria-valuetext', () => {
    const { container } = render(
      <Slider defaultValue={40} showValue formatValue={(v) => `${v}%`} aria-label="Volume" />,
    );
    const slider = screen.getByRole('slider', { name: 'Volume' });

    expect(slider.getAttribute('aria-valuetext')).toBe('40%');
    expect(container.querySelector('.elyri-ui-slider__bubble')?.textContent).toBe('40%');

    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(container.querySelector('.elyri-ui-slider__bubble')?.textContent).toBe('41%');
  });

  it('omits the value bubble by default', () => {
    const { container } = render(<Slider defaultValue={40} aria-label="Volume" />);

    expect(container.querySelector('.elyri-ui-slider__bubble')).toBeNull();
    expect(screen.getByRole('slider', { name: 'Volume' }).hasAttribute('aria-valuetext')).toBe(false);
  });

  it('renders a mark for every step and flags the filled ones', () => {
    const { container } = render(<Slider defaultValue={40} step={20} marks aria-label="Volume" />);
    const marks = container.querySelectorAll('.elyri-ui-slider__mark');

    expect(marks).toHaveLength(6);
    expect(container.querySelectorAll('.elyri-ui-slider__mark[data-active]')).toHaveLength(3);
  });

  it('renders only the given marks within bounds', () => {
    const { container } = render(<Slider defaultValue={[20, 60]} marks={[-10, 25, 50, 90, 120]} aria-label="Price" />);

    expect(container.querySelectorAll('.elyri-ui-slider__mark')).toHaveLength(3);
    expect(container.querySelectorAll('.elyri-ui-slider__mark[data-active]')).toHaveLength(2);
  });
});
