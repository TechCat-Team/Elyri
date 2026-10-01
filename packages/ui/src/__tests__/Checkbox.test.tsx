import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Checkbox } from '../components/forms/Checkbox';
import { Field } from '../components/forms/Field';

describe('Checkbox', () => {
  it('toggles itself when uncontrolled', () => {
    render(<Checkbox>记住我</Checkbox>);
    const control = screen.getByRole('checkbox', { name: '记住我' });

    expect(control.getAttribute('aria-checked')).toBe(null);
    expect((control as HTMLInputElement).checked).toBe(false);

    fireEvent.click(control);
    expect((control as HTMLInputElement).checked).toBe(true);

    fireEvent.click(control);
    expect((control as HTMLInputElement).checked).toBe(false);
  });

  it('honours defaultChecked', () => {
    render(<Checkbox defaultChecked>记住我</Checkbox>);
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
  });

  it('reports changes without mutating a controlled value', () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox checked={false} onCheckedChange={onCheckedChange}>
        记住我
      </Checkbox>,
    );

    fireEvent.click(screen.getByRole('checkbox'));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(false);
  });

  it('renders the indeterminate state as mixed', () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox indeterminate onCheckedChange={onCheckedChange}>
        全选
      </Checkbox>,
    );
    const control = screen.getByRole('checkbox', { name: '全选' });

    expect(control.getAttribute('aria-checked')).toBe('mixed');
    expect((control as HTMLInputElement).indeterminate).toBe(true);

    // 半选态被点击后按浏览器行为变为选中
    fireEvent.click(control);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('ignores clicks while disabled', () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox disabled onCheckedChange={onCheckedChange}>
        记住我
      </Checkbox>,
    );

    fireEvent.click(screen.getByRole('checkbox'));

    expect(onCheckedChange).not.toHaveBeenCalled();
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(false);
  });

  it('does not duplicate the accessible name when a Field label is present', () => {
    render(
      <Field>
        <Field.Label>记住我</Field.Label>
        <Checkbox>保持登录状态</Checkbox>
      </Field>,
    );

    // 外部 Field.Label 命名，控件自身文案不再参与可访问名
    expect(screen.getByRole('checkbox', { name: '记住我' })).toBeTruthy();
    expect(screen.queryByRole('checkbox', { name: '记住我 保持登录状态' })).toBeNull();
  });
});
