import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Textarea } from '../components/forms/Textarea';

describe('Textarea', () => {
  it('renders a multiline textbox', () => {
    render(<Textarea placeholder="Leave a note" />);
    expect(screen.getByRole('textbox')).toBeTruthy();
    expect(screen.getByPlaceholderText('Leave a note')).toBeTruthy();
  });

  it('marks the invalid state', () => {
    render(<Textarea invalid />);
    const textarea = screen.getByRole('textbox');
    expect(textarea.className).toContain('is-invalid');
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
  });

  it('grows with the content when autosize is on', () => {
    render(<Textarea autosize defaultValue="short" />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    // jsdom 没有布局，用自带的 scrollHeight mock 模拟浏览器量高
    Object.defineProperty(textarea, 'scrollHeight', { value: 120 });

    fireEvent.input(textarea, { target: { value: 'a much longer note' } });

    expect(textarea.style.height).toBe('120px');
    expect(textarea.className).toContain('elyri-ui-textarea--autosize');
  });

  it('leaves the height alone without autosize', () => {
    render(<Textarea defaultValue="short" />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    Object.defineProperty(textarea, 'scrollHeight', { value: 120 });

    fireEvent.input(textarea, { target: { value: 'a much longer note' } });

    expect(textarea.style.height).toBe('');
  });
});
