import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';

import { Alert } from '../components/feedback/Alert';
import { Progress } from '../components/feedback/Progress';
import { ToastProvider, useToast } from '../components/feedback/Toast';
import { Avatar, AvatarGroup } from '../components/data-display/Avatar';
import { Button } from '../components/forms/Button';
import { Checkbox, CheckboxGroup } from '../components/forms/Checkbox';
import { Field } from '../components/forms/Field';
import { Input } from '../components/forms/Input';
import { NumberInput } from '../components/forms/NumberInput';
import { RadioGroup } from '../components/forms/Radio';
import { Select } from '../components/forms/Select';
import { Slider } from '../components/forms/Slider';
import { Switch } from '../components/forms/Switch';
import { Textarea } from '../components/forms/Textarea';
import { Tabs } from '../components/navigation/Tabs';
import { Dialog } from '../components/overlays/Dialog';
import { DropdownMenu } from '../components/overlays/DropdownMenu';

/** jsdom 无布局，color-contrast 与 region 规则不可用，关闭以避免误报 */
const AXE_OPTIONS = { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } };

async function expectNoViolations(context: HTMLElement) {
  const results = await axe.run(context, AXE_OPTIONS);
  expect(results.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
}

function ToastTrigger() {
  const { toast } = useToast();
  return (
    <button type="button" onClick={() => toast({ title: 'Saved', duration: 0 })}>
      Fire
    </button>
  );
}

describe('accessibility (axe)', () => {
  it('passes for forms and feedback components', async () => {
    const { container } = render(
      <div>
        <label htmlFor="email">Email</label>
        <Input id="email" type="email" invalid />
        <Button>Save</Button>
        <Switch aria-label="Notifications" />
        <Progress value={40} label="Upload" showValue />
        <Alert variant="warning" title="Heads up">
          Check the field
        </Alert>
      </div>,
    );

    await expectNoViolations(container);
  });

  it('passes for avatars and an avatar group', async () => {
    const { container } = render(
      <div>
        <Avatar name="Ada Lovelace" status="online" />
        <Avatar src="https://example.com/ada.png" alt="Ada" />
        <AvatarGroup max={2} aria-label="Team members">
          <Avatar name="A" />
          <Avatar name="B" />
          <Avatar name="C" />
        </AvatarGroup>
      </div>,
    );

    await expectNoViolations(container);
  });

  it('passes for the field-wired form controls', async () => {
    const { container } = render(
      <div>
        <Field invalid>
          <Field.Label>Email</Field.Label>
          <Input type="email" />
          <Field.Description>We will never share it.</Field.Description>
          <Field.Message>Enter a valid email address.</Field.Message>
        </Field>
        <Field>
          <Field.Label>Notes</Field.Label>
          <Textarea />
        </Field>
        <Checkbox defaultChecked>Remember me</Checkbox>
        <Field>
          <Field.Label>Fruit</Field.Label>
          <RadioGroup defaultValue="apple">
            <RadioGroup.Radio value="apple">Apple</RadioGroup.Radio>
            <RadioGroup.Radio value="banana">Banana</RadioGroup.Radio>
          </RadioGroup>
        </Field>
        <Field>
          <Field.Label>Fruit</Field.Label>
          <Select placeholder="Pick a fruit">
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="apple">Apple</Select.Item>
              <Select.Item value="banana">Banana</Select.Item>
            </Select.Content>
          </Select>
        </Field>
        <Field>
          <Field.Label>Quantity</Field.Label>
          <NumberInput defaultValue={1} min={0} max={10} />
        </Field>
        <Field>
          <Field.Label>Volume</Field.Label>
          <Slider defaultValue={40} />
        </Field>
        <Field>
          <Field.Label>Price range</Field.Label>
          <Slider defaultValue={[20, 60]} />
        </Field>
      </div>,
    );

    await expectNoViolations(container);
  });

  it('passes for a checkbox group', async () => {
    const { container } = render(
      <Field>
        <Field.Label>Notifications</Field.Label>
        <CheckboxGroup defaultValue={['email']}>
          <CheckboxGroup.Checkbox value="email">Email</CheckboxGroup.Checkbox>
          <CheckboxGroup.Checkbox value="sms">SMS</CheckboxGroup.Checkbox>
        </CheckboxGroup>
      </Field>,
    );

    await expectNoViolations(container);
  });

  it('passes for a searchable select', async () => {
    render(
      <Field>
        <Field.Label>Fruit</Field.Label>
        <Select placeholder="Pick a fruit">
          <Select.Trigger>
            <Select.Search placeholder="Search" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">Apple</Select.Item>
            <Select.Item value="banana">Banana</Select.Item>
          </Select.Content>
        </Select>
      </Field>,
    );

    fireEvent.click(screen.getByRole('combobox'));
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());

    await expectNoViolations(document.body);
  });

  it('passes when a select listbox is open', async () => {
    render(
      <Field>
        <Field.Label>Fruit</Field.Label>
        <Select placeholder="Pick a fruit" defaultValue="apple">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="apple">Apple</Select.Item>
            <Select.Item value="banana">Banana</Select.Item>
          </Select.Content>
        </Select>
      </Field>,
    );

    fireEvent.click(screen.getByRole('combobox'));
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());

    await expectNoViolations(document.body);
  });

  it('passes for tabs', async () => {
    const { container } = render(
      <Tabs defaultValue="one">
        <Tabs.List>
          <Tabs.Trigger value="one">One</Tabs.Trigger>
          <Tabs.Trigger value="two">Two</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="one">Panel one</Tabs.Panel>
        <Tabs.Panel value="two">Panel two</Tabs.Panel>
      </Tabs>,
    );

    await expectNoViolations(container);
  });

  it('passes when a dialog is open (named by its title)', async () => {
    render(
      <Dialog>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Delete project</Dialog.Title>
          <Dialog.Description>This cannot be undone.</Dialog.Description>
          <Dialog.Close>Cancel</Dialog.Close>
        </Dialog.Content>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());

    await expectNoViolations(document.body);
  });

  it('passes when a menu is open', async () => {
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Duplicate</DropdownMenu.Item>
          <DropdownMenu.Item danger>Delete</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await waitFor(() => expect(screen.getByRole('menu')).toBeTruthy());

    await expectNoViolations(document.body);
  });

  it('passes when a toast is shown', async () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Fire' }));
    await waitFor(() => expect(screen.getByText('Saved')).toBeTruthy());

    await expectNoViolations(document.body);
  });
});
