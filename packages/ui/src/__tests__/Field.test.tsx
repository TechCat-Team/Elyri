import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Field } from '../components/forms/Field';
import { Input } from '../components/forms/Input';
import { RadioGroup } from '../components/forms/Radio';
import { Select } from '../components/forms/Select';

describe('Field', () => {
  it('wires the label to the control id', () => {
    render(
      <Field>
        <Field.Label>邮箱</Field.Label>
        <Input />
      </Field>,
    );

    const input = screen.getByLabelText('邮箱') as HTMLInputElement;
    const label = screen.getByText('邮箱');
    expect(label.getAttribute('for')).toBe(input.id);
  });

  it('links description and message through aria-describedby', () => {
    render(
      <Field>
        <Field.Label>邮箱</Field.Label>
        <Input />
        <Field.Description>我们不会公开你的邮箱</Field.Description>
        <Field.Message>邮箱格式不正确</Field.Message>
      </Field>,
    );

    const input = screen.getByLabelText('邮箱');
    const describedBy = (input.getAttribute('aria-describedby') ?? '').split(/\s+/);
    expect(describedBy).toContain(screen.getByText('我们不会公开你的邮箱').id);
    expect(describedBy).toContain(screen.getByText('邮箱格式不正确').id);
  });

  it('propagates invalid and disabled to the control', () => {
    render(
      <Field invalid disabled>
        <Field.Label>邮箱</Field.Label>
        <Input />
        <Field.Message>邮箱格式不正确</Field.Message>
      </Field>,
    );

    const input = screen.getByLabelText('邮箱');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.className).toContain('is-invalid');
    expect((input as HTMLInputElement).disabled).toBe(true);
  });

  it('marks the radiogroup with the field label and description', () => {
    render(
      <Field>
        <Field.Label>水果</Field.Label>
        <RadioGroup>
          <RadioGroup.Radio value="apple">Apple</RadioGroup.Radio>
        </RadioGroup>
        <Field.Description>选一个</Field.Description>
      </Field>,
    );

    const group = screen.getByRole('radiogroup', { name: '水果' });
    expect(group.getAttribute('aria-describedby')).toContain(screen.getByText('选一个').id);
  });

  it('marks the select trigger as required and invalid', () => {
    render(
      <Field required invalid>
        <Field.Label>水果</Field.Label>
        <Select placeholder="Pick one">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="apple">Apple</Select.Item>
          </Select.Content>
        </Select>
        <Field.Message>必选</Field.Message>
      </Field>,
    );

    const trigger = screen.getByRole('combobox', { name: '水果' });
    expect(trigger.getAttribute('aria-required')).toBe('true');
    expect(trigger.getAttribute('aria-invalid')).toBe('true');
    expect(trigger.className).toContain('is-invalid');
  });
});
